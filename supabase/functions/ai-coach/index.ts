// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')?.trim();
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GEMINI_API_KEY) throw new Error("Configuration Error: GEMINI_API_KEY is missing.");
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    let body;
    try {
      body = await req.json();
    } catch (e) {
      throw new Error("Invalid JSON body");
    }

    const { action, tone, data, userId } = body;
    if (!action || !data) throw new Error("Bad Request: Missing 'action' or 'data'.");

    console.log(`[ai-coach] Request: ${action} (${tone})`);

    // 1. Fetch Prompt
    let systemInstruction = "You are a helpful fitness coach. Analyze the data and return valid JSON.";
    let knowledgeContext = "";
    let promptVersion = "fallback";

    try {
      const { data: promptData } = await supabase
        .from('ai_prompts')
        .select('system_instruction, knowledge_context, version')
        .eq('action', action)
        .eq('coach_tone', tone || 'strict')
        .eq('is_active', true)
        .maybeSingle();

      if (promptData) {
        systemInstruction = promptData.system_instruction;
        knowledgeContext = promptData.knowledge_context || "";
        promptVersion = promptData.version;
      }
    } catch (dbErr) {
      console.error("[ai-coach] DB Error (non-fatal):", dbErr);
    }

    const finalPrompt = `
      ROLE:
      ${systemInstruction}

      STRICT INSTRUCTIONS:
      1. Analyze the USER DATA provided below.
      2. Consult the KNOWLEDGE BASE if provided.
      3. Think step-by-step before deciding.
      4. Output ONLY valid JSON. No markdown formatting.

      ${knowledgeContext ? `### KNOWLEDGE BASE ###\n${knowledgeContext}\n` : ''}

      ### USER DATA ###
      ${JSON.stringify(data)}
    `;

    // 2. Helper to call Gemini
    const callGemini = async (model: string) => {
      console.log(`[ai-coach] Attempting with model: ${model}`);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }],
          generationConfig: { 
            response_mime_type: "application/json",
            temperature: 0.4
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Model ${model} failed (${response.status}): ${errorText}`);
      }
      return response.json();
    };

    // 3. Select Strategy based on Action
    let primaryModel = 'gemini-1.5-flash'; // Default fast
    let fallbackModel = 'gemini-pro';      // Stable fallback

    if (action === 'globalanalysis') {
      // For audits, prefer Intelligence over Speed
      primaryModel = 'gemini-1.5-pro';
      fallbackModel = 'gemini-1.5-flash';
    }

    // 4. Execution
    let aiResult;
    let usedModel = primaryModel;

    try {
      aiResult = await callGemini(primaryModel);
    } catch (err: any) {
      console.warn(`[ai-coach] Primary model ${primaryModel} failed: ${err.message}`);
      
      // Fallback
      console.log(`[ai-coach] Falling back to ${fallbackModel}`);
      usedModel = fallbackModel;
      try {
        aiResult = await callGemini(fallbackModel);
      } catch (fallbackErr: any) {
        throw new Error(`All AI models failed. Primary: ${err.message}. Fallback: ${fallbackErr.message}`);
      }
    }

    const generatedText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) throw new Error("AI returned no content.");

    // 5. Parse
    let parsedOutput;
    try {
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, "").trim();
      parsedOutput = JSON.parse(cleanedText);
    } catch (e) {
      console.error("[ai-coach] JSON Parse Error. Raw:", generatedText);
      throw new Error("AI response was not valid JSON.");
    }

    // 6. Log
    supabase.from('ai_logs').insert({
      user_id: userId || null, 
      action,
      coach_tone: tone,
      model: usedModel,
      input_data: data,
      output_data: parsedOutput,
      tokens_used: aiResult.usageMetadata?.totalTokenCount || 0,
      prompt_version: promptVersion
    }).then(({ error }) => { if(error) console.error("Log error:", error) });

    return new Response(JSON.stringify(parsedOutput), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`[ai-coach] CRITICAL FAILURE: ${error.message}`);
    return new Response(
      JSON.stringify({ 
        error: true,
        message: error.message
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})