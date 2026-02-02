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

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { sleep, stress, cycle_day, pain_level, pain_location } = await req.json();

    // 1. HARD SAFETY RULE (Deterministic)
    if (sleep < 5 || pain_level > 6) {
      return new Response(JSON.stringify({
        status: "STOP",
        ui_color: "red",
        short_message: "ORDEN DE DESCANSO OBLIGATORIA.",
        rationale: sleep < 5 ? "Privación de sueño crítica para el SNC." : "Nivel de dolor agudo detectado en " + pain_location + ".",
        modification: "No entrenar. Reprogramar para mañana tras 8h de sueño."
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. LLM AUDIT (Contextual)
    const { data: promptData } = await supabase.from('system_prompts').select('prompt_text').eq('role', 'pre_workout_auditor').eq('is_active', true).maybeSingle();
    const { data: globalContext } = await supabase.from('system_prompts').select('prompt_text').eq('role', 'global_context').maybeSingle();

    const finalPrompt = `
      CONTEXT: ${globalContext?.prompt_text}
      AUDIT_INSTRUCTIONS: ${promptData?.prompt_text || "Determine readiness based on metrics."}
      
      INPUT DATA:
      - Sleep: ${sleep} hours
      - Stress: ${stress}/10
      - Cycle Day: ${cycle_day || 'N/A'}
      - Pain: ${pain_location} level ${pain_level}

      Respond ONLY in the following JSON schema:
      {
        "status": "GO" | "CAUTION" | "STOP",
        "ui_color": "green" | "yellow" | "red",
        "short_message": "string",
        "rationale": "string",
        "modification": "string | null"
      }
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

    return new Response(JSON.stringify(output), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
})