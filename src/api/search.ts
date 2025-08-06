const FLOWISE_ENDPOINT = 'https://srv938896.hstgr.cloud/api/v1/prediction/221de6cd-1104-416b-a676-9578bdfcc252';

export const searchAPI = async (query: string) => {
  try {
    const response = await fetch(FLOWISE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: query,
        overrideConfig: {}
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.text();
    
    // Parse the response - Flowise typically returns plain text or JSON
    let result;
    try {
      result = JSON.parse(data);
    } catch {
      // If it's not JSON, treat as plain text
      result = data;
    }

    return {
      text: typeof result === 'string' ? result : result.text || result.answer || JSON.stringify(result),
      sources: result.sources || []
    };
  } catch (error) {
    // If CORS or network error, throw to be handled by useSearch hook
    throw new Error(`Failed to fetch from Flowise: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};