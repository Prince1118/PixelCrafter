const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get the API key from environment variable
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Parse the request body
    const requestData = JSON.parse(event.body);
    const { modelId, payload } = requestData;

    if (!modelId || !payload) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing modelId or payload' })
      };
    }

    // Make request to Hugging Face API
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'PixelCrafter/1.0'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || 'Unknown error' };
      }

      console.error('Hugging Face API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: errorData.error || `API request failed: ${response.status} ${response.statusText}`
        })
      };
    }

    // Get the image as buffer
    const imageBuffer = await response.buffer();
    
    // Convert to base64 for transmission
    const base64Image = imageBuffer.toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: base64Image,
        contentType: contentType
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      })
    };
  }
}; 