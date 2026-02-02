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
    const { exercise_name, prev_weight, prev_reps, curr_weight, curr_reps } = await req.json();

    const finalPrompt = `
      You are the Heavy Duty Judge. Audit Progressive Overload.
      
      Rules:
      1. Weight UP + Reps UP = GOLD standard.
      2. Weight SAME + Reps UP = SILVER standard.
      3. Weight DOWN = REGRESSION (Flag for cause).

      CONTEXT:
      - Exercise: ${exercise_name}
      - Previous: ${prev_weight}kg x ${prev_reps} reps
      - Current: ${curr_weight}kg x ${curr_reps} reps

      Respond ONLY in JSON:
      {
        "verdict": "PROGRESS" | "STAGNATION" | "REGRESSION",
        "intensity_score": 1-10,
        "feedback_card": {
          "title": "string",
          "body": "string",
          "action_item": "string"
        },
        "coach_alert": boolean
      }
    `;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }],
        generationConfig: { response_mime_type: "application/json", temperature: 0.1 }
      })
    });

    const aiData = await res.json();
    const output = JSON.parse(aiData.candidates[0].content.parts[0].text);

    return new Response(JSON.stringify(output), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
})