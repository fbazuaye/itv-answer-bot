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

    setIsLoading(true);
    setError(null);

    try {
      console.log('Making request to:', FLOWISE_ENDPOINT);
      console.log('Query:', query);
      
      // Try different request formats for Flowise
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

      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        console.error('Error response body:', responseText);
        throw new Error(`Search failed: ${response.status} ${response.statusText} - ${responseText}`);
      }

      // Try to parse the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        // If it's not JSON, treat as plain text
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

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: "Search Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });

      // Return a fallback response
      return {
        text: "I apologize, but I'm currently unable to process your request due to a technical issue. Please try again in a moment.",
        sources: []
      };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { search, isLoading, error };
};