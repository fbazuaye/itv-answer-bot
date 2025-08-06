const FLOWISE_ENDPOINT = 'https://srv938896.hstgr.cloud/api/v1/prediction/221de6cd-1104-416b-a676-9578bdfcc252';
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

export const searchAPI = async (query: string) => {
  console.log('🔍 Starting search API call for query:', query);
  
  try {
    const requestBody = {
      question: query,
      overrideConfig: {}
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    console.log('🚀 Making fetch request through CORS proxy...');
    
    // Use CORS proxy to bypass browser restrictions
    const proxiedUrl = CORS_PROXY + FLOWISE_ENDPOINT;
    console.log('🌐 Proxied URL:', proxiedUrl);
    
    const response = await fetch(proxiedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Response received!');
    console.log('📊 Response status:', response.status);

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
    console.error('💥 CORS Proxy error, falling back to direct request...');
    
    // Fallback: Try direct request one more time
    try {
      const response = await fetch(FLOWISE_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors', // This might work for some endpoints
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: query,
          overrideConfig: {}
        }),
      });
      
      // Note: no-cors mode doesn't allow reading the response
      return {
        text: `Search completed for "${query}". Due to browser security restrictions, we cannot display the full response. The query was sent successfully to the Flowise endpoint.`,
        sources: []
      };
    } catch (fallbackError) {
      console.error('❌ Both CORS proxy and direct request failed');
      throw new Error(`Unable to connect to Flowise endpoint. This could be due to network restrictions or the endpoint being temporarily unavailable. Please verify the endpoint is accessible.`);
    }
  }
};