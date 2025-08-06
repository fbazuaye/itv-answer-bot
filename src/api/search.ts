const FLOWISE_ENDPOINT = 'https://srv938896.hstgr.cloud/api/v1/prediction/221de6cd-1104-416b-a676-9578bdfcc252';

export const searchAPI = async (query: string) => {
  console.log('🔍 Starting search API call for query:', query);
  console.log('🌐 Endpoint URL:', FLOWISE_ENDPOINT);
  
  try {
    const requestBody = {
      question: query,
      overrideConfig: {}
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    console.log('🚀 Making fetch request...');
    
    const response = await fetch(FLOWISE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Response received!');
    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.text();
    console.log('📄 Raw response data:', data);
    
    // Parse the response - Flowise typically returns plain text or JSON
    let result;
    try {
      result = JSON.parse(data);
      console.log('✅ Parsed JSON result:', result);
    } catch (parseError) {
      console.log('📝 Treating as plain text response');
      result = data;
    }

    const finalResult = {
      text: typeof result === 'string' ? result : result.text || result.answer || JSON.stringify(result),
      sources: result.sources || []
    };
    
    console.log('🎯 Final API result:', finalResult);
    return finalResult;
    
  } catch (error) {
    console.error('💥 Fetch error details:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    // Check if it's a network error, CORS error, or other fetch failure
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🚫 This appears to be a network/CORS/SSL error');
      throw new Error(`Network error connecting to Flowise. This could be due to CORS restrictions, SSL issues, or the endpoint being unreachable. Original error: ${error.message}`);
    }
    
    throw new Error(`Failed to fetch from Flowise: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};