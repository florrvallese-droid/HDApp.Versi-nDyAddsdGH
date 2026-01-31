// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now();
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
  
  let action, tone, data, userId;

  try {
    const body = await req.json();
    action = body.action;
    tone = body.tone;
    data = body.data;
    
    // Attempt to get user_id from auth header if possible, otherwise rely on body (insecure for prod but ok for MVP)
    // For now we'll check if it was passed in body or just leave null if anonymous
    userId = body.userId; 

    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

    // Fetch Prompt
    let { data: promptData, error: promptError } = await supabase
      .from('ai_prompts')
      .select('system_instruction, version')
      .eq('action', action)
      .eq('coach_tone', tone)
      .eq('is_active', true)
      .single();

    if (promptError || !promptData) {
      console.error(`[ai-coach] Prompt missing for ${action}/${tone}`);
      promptData = { 
        system_instruction: "You are a fitness coach. Analyze data and return JSON.", 
        version: "fallback" 
      };
    }

    // Call Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${promptData.system_instruction}\n\nUser Data:\n${JSON.stringify(data)}` }]
        }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    if (!response.ok) throw new Error(await response.text());

    const aiResult = await response.json();
    const generatedText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) throw new Error("No content generated");

    let parsedOutput;
    try {
      parsedOutput = JSON.parse(generatedText);
    } catch (e) {
      throw new Error("Invalid JSON from AI");
    }

    // Log to DB
    const endTime = Date.now();
    const { error: logError } = await supabase.from('ai_logs').insert({
      user_id: userId || null, // If we had the user ID
      action,
      coach_tone: tone,
      model: 'gemini-1.5-flash',
      input_data: data,
      output_data: parsedOutput,
      tokens_used: aiResult.usageMetadata?.totalTokenCount || 0,
      latency_ms: endTime - startTime,
      prompt_version: promptData.version
    });

    if (logError) console.error("[ai-coach] Log Error:", logError);

    return new Response(JSON.stringify(parsedOutput), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`[ai-coach] Error: ${error.message}`);
    
    // Log error to DB too
    await supabase.from('ai_logs').insert({
      action: action || 'unknown',
      error: error.message,
      latency_ms: Date.now() - startTime
    });

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})