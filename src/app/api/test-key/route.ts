import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('Test Key Request:', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers)
  });

  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('API Key Missing');
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key is not configured',
        details: {
          configured: false,
          message: 'API key is missing in environment variables'
        }
      }, { 
        status: 500,
        headers 
      });
    }

    const apiKey = process.env.OPENAI_API_KEY.trim();
    console.log('API Key Check:', {
      length: apiKey.length,
      hasKey: !!apiKey,
      timestamp: new Date().toISOString()
    });

    // Test API key format
    const keyDetails = {
      length: apiKey.length,
      prefix: apiKey.substring(0, 7),
      hasValidPrefix: apiKey.startsWith('sk-'),
      containsSpaces: apiKey.includes(' '),
      wasTrimed: apiKey !== process.env.OPENAI_API_KEY
    };

    // Test API connection
    console.log('Initiating OpenAI API test...');
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('OpenAI API Response Headers:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers)
      });

      let data;
      const rawResponse = await response.text();
      console.log('Raw Response:', rawResponse);

      try {
        data = JSON.parse(rawResponse);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        throw new Error(`Failed to parse API response: ${rawResponse.substring(0, 100)}...`);
      }

      console.log('OpenAI API Response:', {
        status: response.status,
        ok: response.ok,
        error: !response.ok ? data.error : null,
        dataType: typeof data,
        hasData: !!data
      });

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: 'API key validation failed',
          details: {
            configured: true,
            valid: false,
            status: response.status,
            statusText: response.statusText,
            message: data.error?.message,
            keyDetails
          }
        }, { 
          status: response.status,
          headers 
        });
      }

      return NextResponse.json({
        success: true,
        details: {
          configured: true,
          valid: true,
          status: response.status,
          models: data.data?.length || 0,
          keyDetails
        }
      }, { headers });

    } catch (apiError) {
      console.error('API Request Error:', {
        message: apiError instanceof Error ? apiError.message : 'Unknown API error',
        stack: apiError instanceof Error ? apiError.stack : undefined
      });
      throw apiError;
    }

  } catch (error) {
    console.error('Test Key Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: {
        configured: true,
        valid: false,
        message: 'Failed to validate API key'
      }
    }, { 
      status: 500,
      headers 
    });
  }
} 