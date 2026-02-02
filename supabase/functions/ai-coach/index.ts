// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ARGENTINE_LANGUAGE_RULE = `
### LANGUAGE_RULE ###
- Dialecto: Castellano Rioplatense (Argentina).
- Voseo mandatorio: Usar "vos", "hacé", "tenés" en lugar de "tú", "haz", "tienes".
- Tono: Directo y profesional.
`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')?.trim();
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GEMINI_API_KEY) throw new Error("Falta GEMINI_API_KEY.");
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const body = await req.json();
    const { action, tone, data, userId } = body;

    // 1. Obtener Prompt de la Personalidad desde DB
    let systemInstruction = "Sos un coach experto en Heavy Duty.";
    const { data: promptData } = await supabase
      .from('ai_prompts')
      .select('system_instruction')
      .eq('action', action)
      .eq('coach_tone', tone || 'strict')
      .eq('is_active', true)
      .maybeSingle();

    if (promptData) systemInstruction = promptData.system_instruction;

    // 2. Obtener Base de Conocimiento Global
    const { data: kbData } = await supabase
      .from('ai_knowledge_base')
      .select('content')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    const knowledgeContext = kbData?.content || "";

    const finalPrompt = `
      ${ARGENTINE_LANGUAGE_RULE}
      
      ### CONTEXTO TÉCNICO GLOBAL ###
      ${knowledgeContext}

      ### INSTRUCCIONES DE PERSONALIDAD ###
      ${systemInstruction}

      ### DATOS DEL ATLETA ###
      ${JSON.stringify(data)}

      Responde ÚNICAMENTE en formato JSON válido con los campos "card_data" (resumen) y "detailed_report" (markdown extenso).
    `;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }],
        generationConfig: { response_mime_type: "application/json", temperature: 0.2 }
      })
    });

    const aiData = await res.json();
    const output = JSON.parse(aiData.candidates[0].content.parts[0].text);

    // Logging técnico en background
    supabase.from('ai_logs').insert({
      user_id: userId,
      action,
      coach_tone: tone,
      model: 'gemini-1.5-flash',
      input_data: data,
      output_data: output
    }).then();

    return new Response(JSON.stringify(output), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
})