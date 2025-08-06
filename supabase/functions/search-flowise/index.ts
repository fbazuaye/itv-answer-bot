import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const FLOWISE_ENDPOINT = 'https://srv938896.hstgr.cloud/api/v1/prediction/221de6cd-1104-416b-a676-9578bdfcc252';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Flowise proxy function called');
    
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query parameter is required and must be a string');
    }
    
    console.log('📝 Processing query:', query);
    
    const requestBody = {
      question: query,
      overrideConfig: {}
    };
    
    console.log('🚀 Making request to Flowise endpoint');
    
    const response = await fetch(FLOWISE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Flowise API error:', errorText);
      throw new Error(`Flowise API error: ${response.status} - ${errorText}`);
    }

    const data = await response.text();
    console.log('📄 Raw response received from Flowise');
    
    // Parse the response - Flowise typically returns plain text or JSON
    let result;
    try {
      result = JSON.parse(data);
      console.log('✅ Successfully parsed JSON response');
    } catch (parseError) {
      console.log('📝 Response is plain text, not JSON');
      result = data;
    }

    // Format the response for consistent structure
    const formattedResponse = {
      text: typeof result === 'string' ? result : result.text || result.answer || JSON.stringify(result),
      sources: result.sources || []
    };
    
    console.log('🎯 Returning formatted response');
    
    return new Response(JSON.stringify(formattedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Error in search-flowise function:', error);
    
    return new Response(JSON.stringify({ 
      error: `Search failed: ${error.message}`,
      text: `I'm sorry, but I encountered an error while processing your search. Please try again later.`,
      sources: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});