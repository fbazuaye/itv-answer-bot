// Simple in-memory search function as fallback while we set up proper API
export const searchAPI = async (query: string) => {
  // For demo purposes, return a mock response
  // In production, this would connect to your search service
  return {
    text: `Here's information about "${query}": This is a demo response showing that the search functionality is working. In a production environment, this would connect to your actual search API or knowledge base to provide real answers to user queries.`,
    sources: [
      {
        title: "Demo Source 1",
        url: "https://example.com/source1",
        snippet: "This is a sample source snippet that would normally come from your search index."
      },
      {
        title: "Demo Source 2", 
        url: "https://example.com/source2",
        snippet: "Another example of how sources would be displayed in search results."
      }
    ]
  };
};