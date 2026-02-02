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
    let promptVersion = "v2.2-business-hybrid";

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

    // REGLAS GLOBALES DE COMPORTAMIENTO (Fase 3: El Juicio)
    const globalConstrains = `
      ### REGLAS DE ORO DEL SISTEMA (ESTRICTAS) ###
      1. IDIOMA: Responde EXCLUSIVAMENTE en ESPAÑOL.
      2. ROL: Sos un ANALISTA DE DATOS y un ESTRATEGA DE NEGOCIO fitness.
      3. PERSONALIDAD: Debes mantener el tono "${tone}". 
      4. SI EL TONO ES "business_analytical": Tu prioridad es detectar patrones que afecten la rentabilidad (ej: falta de progreso del alumno = riesgo de abandono) y oportunidades de marca (ej: hitos para redes sociales).
      5. OBJETIVO: Da un análisis crítico basado en la evidencia de los logs. 
    `;

    const schemas = {
      preworkout: `{
        "decision": "TRAIN_HEAVY" | "TRAIN_LIGHT" | "REST",
        "rationale": "Análisis en ESPAÑOL del estado sistémico...",
        "recommendations": ["Observación 1", "Observación 2"]
      }`,
      postworkout: `{
        "verdict": "PROGRESS" | "STAGNATION" | "REGRESSION",
        "highlights": ["Hito detectado"],
        "corrections": ["Falla técnica"],
        "coach_quote": "Frase de cierre según tu personalidad",
        "judgment": "Análisis profundo en Markdown sobre el rendimiento."
      }`,
      globalanalysis: `{
        "top_patterns": [{"pattern": "Descripción", "evidence": "Dato", "action": "Observación estratégica"}],
        "performance_insights": {"best_performing_conditions": "...", "worst_performing_conditions": "...", "optimal_frequency": "..."},
        "red_flags": ["Alertas"],
        "next_14_days_plan": ["Tendencias detectadas"],
        "overall_assessment": "Análisis macroscópico del progreso mensual o del negocio."
      }`,
      marketing_generation: `{
        "top_patterns": [{"pattern": "Hito viral", "evidence": "Dato real", "action": "Hook para copy"}],
        "overall_assessment": "Copy de Instagram completo con emojis y estructura de storytelling."
      }`
    };

    const finalPrompt = `
      ${globalConstrains}

      ### PERSONALIDAD Y CONTEXTO ###
      ${systemInstruction}

      ### FUENTE DE VERDAD (CONOCIMIENTO TÉCNICO) ###
      ${knowledgeContext}

      ### INSTRUCCIONES DE SALIDA ###
      Analiza los datos y genera un informe en ESPAÑOL.
      Responde SOLO en formato JSON:
      ${schemas[action] || "{}"}

      ### DATOS DE ENTRADA ###
      ${JSON.stringify(data)}
    `;

    const callGemini = async (modelName: string) => {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }],
          generationConfig: { 
            response_mime_type: "application/json",
            temperature: tone === 'business_analytical' ? 0.5 : 0.2
          }
        })
      });

      if (!response.ok) throw new Error(`Model ${modelName} failed`);
      return response.json();
    };

    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-pro'];
    let aiResult = null;
    let usedModel = "";

    for (const model of modelsToTry) {
        try {
            aiResult = await callGemini(model);
            usedModel = model;
            break; 
        } catch (err) { console.warn(`[ai-coach] ${model} fail`); }
    }

    if (!aiResult) throw new Error("IA failure");
    
    const generatedText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanedText = generatedText.replace(/```json\n?|\n?```/g, "").trim();
    const parsedOutput = JSON.parse(cleanedText);

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
    return new Response(JSON.stringify({ error: true, message: error.message }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
})