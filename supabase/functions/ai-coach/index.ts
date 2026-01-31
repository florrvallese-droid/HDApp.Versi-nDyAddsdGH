// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')?.trim();
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GEMINI_API_KEY) throw new Error("Configuration Error: GEMINI_API_KEY is missing in Secrets.");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Configuration Error: Supabase credentials missing.");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse Body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      throw new Error("Invalid JSON body");
    }

    const { action, tone, data, userId } = body;

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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: finalPrompt }]
        }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.4
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ai-coach] Google API Error: ${response.status}`, errorText);
      throw new Error(`Google API Error: ${response.status} - ${errorText}`);
    }

    const aiResult = await response.json();
    const generatedText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) throw new Error("AI returned no content.");

    // 4. Parse JSON safely
    let parsedOutput;
    try {
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, "").trim();
      parsedOutput = JSON.parse(cleanedText);
    } catch (e) {
      console.error("[ai-coach] JSON Parse Error:", generatedText);
      throw new Error(`AI response was not valid JSON. Raw: ${generatedText.substring(0, 50)}...`);
    }

    // 5. Async Logging
    supabase.from('ai_logs').insert({
      user_id: userId || null, 
      action,
      coach_tone: tone,
      model: 'gemini-1.5-flash',
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
    
    // Return error as 200 OK JSON so client can read the message
    return new Response(
      JSON.stringify({ 
        error: true,
        message: error.message,
        details: "Check Edge Function logs via Supabase Dashboard."
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})