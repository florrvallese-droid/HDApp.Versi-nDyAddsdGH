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

    // 1. Fetch Prompt (Personality)
    let systemInstruction = `Sos un analista experto en Heavy Duty.`;
    let promptVersion = "v3.0-deep-report";

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

    // 2. Fetch Shared Knowledge Base
    let knowledgeContext = "";
    try {
      const { data: kbData } = await supabase
        .from('ai_knowledge_base')
        .select('content')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (kbData && kbData.content) {
        knowledgeContext = kbData.content;
      }
    } catch (kbErr) {
      console.error("[ai-coach] DB Knowledge Error:", kbErr);
    }

    // REGLA DE FORMATO OBLIGATORIA (ACTUALIZADA)
    const formatRule = `
      ### REGLA DE FORMATO DE SALIDA OBLIGATORIA ###
      Debes responder SIEMPRE en formato JSON válido.
      El JSON debe contener exactamente dos partes:
      
      1. "card_data": Datos breves y estructurados para la interfaz visual.
      2. "detailed_report": Un texto extenso en formato Markdown. Aquí es donde te explayas como coach.
         - Usa títulos (##) para secciones.
         - Usa negritas (**texto**) para resaltar datos clave.
         - Usa listas (- item) para enumerar hallazgos.
         - Explica el POR QUÉ fisiológico o estratégico de tu análisis.
    `;

    const schemas = {
      preworkout: `{
        "card_data": {
          "status": "GO" | "CAUTION" | "STOP",
          "ui_title": "string",
          "ui_color": "green" | "yellow" | "red"
        },
        "detailed_report": "## Informe de Recuperación SNC\\n\\n..."
      }`,
      postworkout: `{
        "card_data": {
          "verdict": "PROGRESS" | "STAGNATION" | "REGRESSION",
          "score": 1-10,
          "ui_title": "string"
        },
        "detailed_report": "## Auditoría de Sesión\\n\\n..."
      }`,
      globalanalysis: `{
        "card_data": {
          "status": "string",
          "main_insight": "string"
        },
        "detailed_report": "## Documento Oficial de Auditoría\\n\\n..."
      }`,
      marketing_generation: `{
        "card_data": {
          "hook": "string"
        },
        "detailed_report": "## Copy Estratégico para Instagram\\n\\n..."
      }`
    };

    const finalPrompt = `
      ${formatRule}

      ### PERSONALIDAD Y CONTEXTO ###
      ${systemInstruction}

      ### CONOCIMIENTO TÉCNICO (NÚCLEO) ###
      ${knowledgeContext}

      ### TAREA ESPECÍFICA ###
      Analiza los siguientes datos y genera el informe estructurado solicitado. 
      Responde SOLO en el siguiente esquema JSON:
      ${schemas[action] || "{}"}

      ### DATOS DE ENTRADA ###
      ${JSON.stringify(data)}
    `;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }],
        generationConfig: { response_mime_type: "application/json", temperature: tone.includes('business') ? 0.5 : 0.2 }
      })
    });

    const aiData = await res.json();
    if (!aiData.candidates) throw new Error("IA fail: " + JSON.stringify(aiData));

    const generatedText = aiData.candidates[0].content.parts[0].text;
    const parsedOutput = JSON.parse(generatedText);

    // Logging técnico
    supabase.from('ai_logs').insert({
      user_id: userId || null, 
      action,
      coach_tone: tone,
      model: 'gemini-1.5-flash',
      input_data: data,
      output_data: parsedOutput,
      tokens_used: aiData.usageMetadata?.totalTokenCount || 0,
      prompt_version: promptVersion
    }).then(({ error }) => { if(error) console.error("Log error:", error) });

    return new Response(JSON.stringify(parsedOutput), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: true, message: error.message }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
})