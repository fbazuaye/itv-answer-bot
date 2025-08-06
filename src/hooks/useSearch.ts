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

const FLOWISE_ENDPOINT = 'https://livegigaichatbot.onrender.com/api/v1/prediction/300308c0-f14d-4ff1-a0a3-075c245eb74a';

export const useSearch = (): UseSearchReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const search = useCallback(async (query: string): Promise<SearchResponse | null> => {
    if (!query.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(FLOWISE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: query,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
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