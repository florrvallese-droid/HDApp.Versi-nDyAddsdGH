// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 2. Setup & Validation
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')?.trim();
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error("Configuration Error: GEMINI_API_KEY is missing or empty.");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Configuration Error: Supabase credentials missing.");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 3. Parse Request
    const { action, tone, data, userId } = await req.json();

    if (!action || !data) {
      throw new Error("Bad Request: Missing 'action' or 'data'.");
    }

    console.log(`[ai-coach] Request: ${action} (${tone || 'default'})`);

    // 4. Fetch Prompt (Safe Mode)
    let systemInstruction = "You are a helpful fitness coach. Analyze the data and return valid JSON.";
    let promptVersion = "fallback";

    try {
      const { data: promptData, error: promptError } = await supabase
        .from('ai_prompts')
        .select('system_instruction, version')
        .eq('action', action)
        .eq('coach_tone', tone || 'strict')
        .eq('is_active', true)
        .maybeSingle(); // Use maybeSingle to avoid 406 error if 0 rows

      if (promptError) {
        console.error("[ai-coach] DB Error fetching prompt:", promptError);
      } else if (promptData) {
        systemInstruction = promptData.system_instruction;
        promptVersion = promptData.version;
      } else {
        console.warn("[ai-coach] No prompt found in DB, using fallback.");
      }
    } catch (dbErr) {
      console.error("[ai-coach] Unexpected DB error:", dbErr);
      // Continue with fallback
    }

    // 5. Construct Gemini Payload
    // Ensure we force JSON response
    const payload = {
      contents: [{
        parts: [{ text: `${systemInstruction}\n\nUser Data:\n${JSON.stringify(data)}` }]
      }],
      generationConfig: { 
        response_mime_type: "application/json" 
      }
    };

    // 6. Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ai-coach] Gemini API Error (${response.status}): ${errorText}`);
      throw new Error(`Google API Error: ${response.status} - ${errorText.substring(0, 100)}...`);
    }

    const aiResult = await response.json();
    const generatedText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.error("[ai-coach] Empty response from Gemini", aiResult);
      throw new Error("AI returned no content.");
    }

    // 7. Parse & Validate JSON
    let parsedOutput;
    try {
      parsedOutput = JSON.parse(generatedText);
    } catch (e) {
      console.error("[ai-coach] Invalid JSON from AI:", generatedText);
      // Attempt to clean markdown code blocks if present (common issue)
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, "").trim();
      try {
        parsedOutput = JSON.parse(cleanedText);
      } catch (e2) {
         throw new Error("AI response was not valid JSON.");
      }
    }

    // 8. Async Log (Fire & Forget)
    // We don't await this to speed up response time for user
    supabase.from('ai_logs').insert({
      user_id: userId || null, 
      action,
      coach_tone: tone,
      model: 'gemini-1.5-flash',
      input_data: data,
      output_data: parsedOutput,
      tokens_used: aiResult.usageMetadata?.totalTokenCount || 0,
      prompt_version: promptVersion
    }).then(({ error }) => {
      if (error) console.error("[ai-coach] Failed to log interaction:", error);
    });

    // 9. Success Response
    return new Response(JSON.stringify(parsedOutput), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`[ai-coach] CRITICAL FAILURE: ${error.message}`);
    
    // Return a 200 OK with an error field instead of 500, 
    // so the client can handle it gracefully without crashing "functions.invoke"
    // or return 500 with detailed message if client expects it.
    // Let's stick to 500 but with JSON body so client can read it.
    
    return new Response(
      JSON.stringify({ error: error.message, details: "Check Supabase Edge Function Logs for more info." }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})