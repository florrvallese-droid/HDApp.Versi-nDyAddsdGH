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

    // 1. Fetch Prompt (Personality)
    let systemInstruction = `Sos un entrenador experto en Heavy Duty.`;
    let promptVersion = "fallback";

    try {
      const { data: promptData } = await supabase
        .from('ai_prompts')
        .select('system_instruction, version')
        .eq('action', action)
        .eq('coach_tone', tone || 'strict')
        .eq('is_active', true)
        .maybeSingle();

      if (promptData) {
        systemInstruction = promptData.system_instruction;
        promptVersion = promptData.version;
      }
    } catch (dbErr) {
      console.error("[ai-coach] DB Prompt Error:", dbErr);
    }

    // 2. Fetch Shared Knowledge Base (The Book/Principles)
    let knowledgeContext = "";
    try {
      const { data: kbData } = await supabase
        .from('ai_knowledge_base')
        .select('content')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle(); // Get the first active knowledge base

      if (kbData && kbData.content) {
        knowledgeContext = kbData.content;
      }
    } catch (kbErr) {
      console.error("[ai-coach] DB Knowledge Error:", kbErr);
    }

    // Define strict schemas
    const schemas = {
      preworkout: `
      {
        "decision": "TRAIN_HEAVY" | "TRAIN_LIGHT" | "REST",
        "rationale": "Detailed explanation...",
        "recommendations": ["Tip 1", "Tip 2"]
      }`,
      postworkout: `
      {
        "verdict": "PROGRESS" | "PLATEAU" | "REGRESSION",
        "highlights": ["Achievement 1"],
        "corrections": ["Correction 1"],
        "coach_quote": "Motivational quote"
      }`,
      globalanalysis: `
      {
        "top_patterns": [{"pattern": "...", "evidence": "...", "action": "..."}],
        "performance_insights": {"best_performing_conditions": "...", "worst_performing_conditions": "...", "optimal_frequency": "..."},
        "red_flags": ["..."],
        "next_14_days_plan": ["..."],
        "overall_assessment": "..."
      }`
    };

    const targetSchema = schemas[action] || "{}";

    const finalPrompt = `
      ROLE:
      ${systemInstruction}

      STRICT OUTPUT INSTRUCTIONS:
      1. Analyze the USER DATA provided below.
      2. Consult the KNOWLEDGE BASE provided. Use it as the absolute truth for training methodology.
      3. Output ONLY valid JSON matching this structure:
      ${targetSchema}

      NO markdown formatting. Just raw JSON.

      ${knowledgeContext ? `### KNOWLEDGE BASE (HEAVY DUTY PRINCIPLES) ###\n${knowledgeContext}\n` : ''}

      ### USER DATA ###
      ${JSON.stringify(data)}
    `;

    // 3. Call Gemini
    const callGemini = async (model: string) => {
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

    // Model selection
    let usedModel = 'gemini-2.0-flash'; // Fast & good context
    if (action === 'globalanalysis') usedModel = 'gemini-2.0-pro-exp-02-05'; // Smarter for deep analysis

    // Execute
    const aiResult = await callGemini(usedModel);
    const generatedText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) throw new Error("AI returned no content.");

    // Parse
    let parsedOutput;
    try {
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, "").trim();
      parsedOutput = JSON.parse(cleanedText);
    } catch (e) {
      console.error("[ai-coach] JSON Parse Error. Raw:", generatedText);
      throw new Error("AI response was not valid JSON.");
    }

    // Log
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