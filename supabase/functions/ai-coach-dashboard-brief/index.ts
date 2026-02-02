// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const { stats, coachName } = await req.json();
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Obtener el prompt del sistema
    const { data: promptData } = await supabase
      .from('ai_prompts')
      .select('system_instruction')
      .eq('action', 'dashboard_brief')
      .eq('is_active', true)
      .maybeSingle();

    const finalPrompt = `
      ${promptData?.system_instruction}
      
      DATOS DEL DÍA (Snapshot):
      ${JSON.stringify(stats)}
      
      COACH: ${coachName}

      Responde ÚNICAMENTE con el JSON solicitado.
    `;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }],
        generationConfig: { response_mime_type: "application/json", temperature: 0.4 }
      })
    });

    const aiData = await res.json();
    const output = aiData.candidates[0].content.parts[0].text;

    return new Response(output, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
})