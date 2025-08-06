import { supabase } from '@/integrations/supabase/client';

export const searchAPI = async (query: string) => {
  console.log('🔍 Starting search via Supabase Edge Function');
  console.log('📝 Query:', query);
  
  try {
    const { data, error } = await supabase.functions.invoke('search-flowise', {
      body: { query }
    });

    if (error) {
      console.error('❌ Supabase function error:', error);
      throw new Error(`Edge function error: ${error.message}`);
    }

    console.log('✅ Successfully received response from edge function');
    console.log('📄 Response data:', data);

    return {
      text: data.text || 'No response received',
      sources: data.sources || []
    };

  } catch (error) {
    console.error('💥 Search API error:', error);
    
    // Return a user-friendly error response
    return {
      text: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
      sources: []
    };
  }
};