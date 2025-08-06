import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { searchAPI } from '@/api/search';

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

// Using local API to avoid CORS issues

export const useSearch = (): UseSearchReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const search = useCallback(async (query: string): Promise<SearchResponse | null> => {
    if (!query.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      // Use local API to avoid CORS issues
      const result = await searchAPI(query);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: "Search Error",
        description: `Failed to get response: ${errorMessage}`,
        variant: "destructive",
      });

      return {
        text: `Search failed: ${errorMessage}. Please try again.`,
        sources: []
      };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { search, isLoading, error };
};