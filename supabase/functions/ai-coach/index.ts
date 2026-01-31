// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')?.trim();
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GEMINI_API_KEY) throw new Error("Configuration Error: GEMINI_API_KEY missing.");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Configuration Error: Supabase credentials missing.");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { action, tone, data, userId } = await req.json();

    if (!action || !data) throw new Error("Bad Request: Missing 'action' or 'data'.");

    console.log(`[ai-coach] Request: ${action} (${tone || 'default'})`);

    // 1. Fetch Dynamic Prompt from DB
    let systemInstruction = "You are a helpful fitness coach. Analyze the data and return valid JSON.";
    let knowledgeContext = "";
    let promptVersion = "fallback";

    try {
      const { data: promptData, error: promptError } = await supabase
        .from('ai_prompts')
        .select('system_instruction, knowledge_context, version')
        .eq('action', action)
        .eq('coach_tone', tone || 'strict')
        .eq('is_active', true)
        .maybeSingle();

      if (promptError) {
        console.error("[ai-coach] DB Error fetching prompt:", promptError);
      } else if (promptData) {
        systemInstruction = promptData.system_instruction;
        knowledgeContext = promptData.knowledge_context || "";
        promptVersion = promptData.version;
      }
    } catch (dbErr) {
      console.error("[ai-coach] Unexpected DB error:", dbErr);
    }

    // 2. Construct Strict Prompt (Chain of Thought enforced)
    const finalPrompt = `
      ROLE:
      ${systemInstruction}

      STRICT INSTRUCTIONS:
      1. Analyze the USER DATA provided below.
      2. Consult the KNOWLEDGE BASE if provided.
      3. Think step-by-step before deciding.
      4. Output ONLY valid JSON. No markdown formatting, no intro text.

      ${knowledgeContext ? `
      ### KNOWLEDGE BASE (SOURCE OF TRUTH) ###
      ${knowledgeContext}
      ########################################
      ` : ''}

      ### USER DATA ###
      ${JSON.stringify(data)}
    `;

    // 3. Call Gemini API (Using 1.5 FLASH for speed/stability)
    // Note: 'response_mime_type' is critical for ensuring JSON
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: finalPrompt }]
        }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.4 // Lower temperature for less hallucinations
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API Error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const aiResult = await response.json();
    const generatedText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) throw new Error("AI returned no content.");

    // 4. Parse JSON safely
    let parsedOutput;
    try {
      // Sometimes models wrap json in markdown blocks despite mime_type
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, "").trim();
      parsedOutput = JSON.parse(cleanedText);
    } catch (e) {
      console.error("[ai-coach] JSON Parse Error:", generatedText);
      throw new Error("AI response was not valid JSON.");
    }

    // 5. Async Logging (Don't await to speed up response)
    supabase.from('ai_logs').insert({
      user_id: userId || null, 
      action,
      coach_tone: tone,
      model: 'gemini-1.5-flash', // Updated logging
      input_data: data,
      output_data: parsedOutput,
      tokens_used: aiResult.usageMetadata?.totalTokenCount || 0,
      prompt_version: promptVersion
    }).then(({ error }) => {
      if (error) console.error("[ai-coach] Failed to log interaction:", error);
    });

    return new Response(JSON.stringify(parsedOutput), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`[ai-coach] CRITICAL FAILURE: ${error.message}`);
    
    // Return a structured error that the client can parse if needed, 
    // but Keep 500 status so client knows it failed.
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check Edge Function logs for more info."
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})