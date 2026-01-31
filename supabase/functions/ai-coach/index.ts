// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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

    // Fetch Prompt AND Context
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

    // Construct the FINAL Prompt with Knowledge Base
    const finalPrompt = `
      ${systemInstruction}

      ${knowledgeContext ? `
      ### BASE DE CONOCIMIENTO (FUENTE OFICIAL) ###
      Usa la siguiente información como la VERDAD ABSOLUTA para tomar tus decisiones.
      No contradigas los principios expuestos en este texto:
      
      ${knowledgeContext}
      #############################################
      ` : ''}

      ### USER DATA ###
      ${JSON.stringify(data)}
    `;

    // Call Gemini API - USING GEMINI 1.5 PRO
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: finalPrompt }]
        }],
        generationConfig: { 
          response_mime_type: "application/json" 
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API Error: ${response.status} - ${errorText.substring(0, 100)}...`);
    }

    const aiResult = await response.json();
    const generatedText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) throw new Error("AI returned no content.");

    let parsedOutput;
    try {
      parsedOutput = JSON.parse(generatedText);
    } catch (e) {
      // Cleanup markdown if present
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, "").trim();
      try {
        parsedOutput = JSON.parse(cleanedText);
      } catch (e2) {
         throw new Error("AI response was not valid JSON.");
      }
    }

    // Log Interaction
    supabase.from('ai_logs').insert({
      user_id: userId || null, 
      action,
      coach_tone: tone,
      model: 'gemini-1.5-pro',
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
    console.error(`[ai-coach] ERROR: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})