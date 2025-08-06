import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SearchResponse {
  text?: string;
  sources?: Array<{
    title: string;
    url?: string;
    snippet?: string;
  }>;
}

interface UseSearchReturn {
  search: (query: string) => Promise<SearchResponse | null>;
  isLoading: boolean;
  error: string | null;
}

const FLOWISE_ENDPOINT = 'https://srv938896.hstgr.cloud/api/v1/prediction/221de6cd-1104-416b-a676-9578bdfcc252';

export const useSearch = (): UseSearchReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const search = useCallback(async (query: string): Promise<SearchResponse | null> => {
    if (!query.trim()) return null;

    console.log('=== SEARCH FUNCTION CALLED ===');
    console.log('Query received:', query);
    alert('Search function called with: ' + query); // Debug alert

    setIsLoading(true);
    setError(null);

    try {
      console.log('Making request to:', FLOWISE_ENDPOINT);
      
      // Test if the endpoint is reachable first
      const requestBody = {
        question: query,
        overrideConfig: {}
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(FLOWISE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response received!');
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      
      const responseText = await response.text();
      console.log('Raw response text:', responseText);

      if (!response.ok) {
        console.error('Error response:', responseText);
        throw new Error(`API Error: ${response.status} - ${responseText}`);
      }

      // Try to parse the response
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed JSON data:', data);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        console.log('Treating as plain text response');
        data = responseText;
      }
      
      // Handle different response formats from Flowise
      let result: SearchResponse = {};
      
      if (typeof data === 'string') {
        result.text = data;
      } else if (data.text) {
        result.text = data.text;
        result.sources = data.sources || [];
      } else if (data.answer) {
        result.text = data.answer;
        result.sources = data.sources || [];
      } else if (data.response) {
        result.text = data.response;
        result.sources = data.sources || [];
      } else {
        // Fallback - try to extract any text content
        result.text = JSON.stringify(data);
      }

      console.log('Final result:', result);
      return result;
    } catch (err) {
      console.error('=== SEARCH ERROR ===');
      console.error('Error details:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Error message:', errorMessage);
      
      setError(errorMessage);
      
      toast({
        title: "Search Error",
        description: `Failed to get response: ${errorMessage}`,
        variant: "destructive",
      });

      // Return a more informative fallback response
      return {
        text: `Search failed: ${errorMessage}. Please check your internet connection and try again.`,
        sources: []
      };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { search, isLoading, error };
};