import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { contentGenerationSchema } from '@/lib/schemas'
import { z } from 'zod'
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

// Initialize OpenAI client with all environment variables
let openai: OpenAI | null = null;

interface ApiKeyDetails {
  length: number;
  prefix: string;
  suffix: string;
  type: string;
  containsSpaces: boolean;
  hasWhitespace: boolean;
  originalLength: number;
  wasTrimed: boolean;
  hasValidChars: boolean;
  structure: {
    hasPrefix: boolean;
    hasValidLength: boolean;
    containsValidChars: boolean;
  };
}

interface ApiKeyValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  details: ApiKeyDetails;
}

// Validate API key format
const validateApiKey = (apiKey: string): ApiKeyValidationResult => {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Basic format checks
  if (!apiKey) {
    issues.push('API key is empty');
    return {
      isValid: false,
      issues,
      warnings,
      details: {
        length: 0,
        prefix: '',
        suffix: '',
        type: 'invalid',
        containsSpaces: false,
        hasWhitespace: false,
        originalLength: 0,
        wasTrimed: false,
        hasValidChars: false,
        structure: {
          hasPrefix: false,
          hasValidLength: false,
          containsValidChars: false
        }
      }
    };
  }

  // Detailed validation
  const cleanKey = apiKey.trim();
  const details = {
    length: cleanKey.length,
    prefix: cleanKey.substring(0, Math.min(7, cleanKey.length)),
    suffix: cleanKey.slice(-4),
    type: cleanKey.startsWith('sk-pro-') ? 'project-scoped' : cleanKey.startsWith('sk-proj-') ? 'project-scoped' : 'standard',
    containsSpaces: apiKey.includes(' '),
    hasWhitespace: /\s/.test(apiKey),
    originalLength: apiKey.length,
    wasTrimed: apiKey.length !== cleanKey.length,
    hasValidChars: /^[a-zA-Z0-9_-]+$/.test(cleanKey.replace('sk-', '').replace('pro-', '').replace('proj-', '')),
    structure: {
      hasPrefix: cleanKey.startsWith('sk-') || cleanKey.startsWith('sk-pro-') || cleanKey.startsWith('sk-proj-'),
      hasValidLength: cleanKey.length >= 40,
      containsValidChars: true
    }
  };

  // Check for spaces or trimming needed
  if (apiKey.length !== cleanKey.length) {
    issues.push('API key contains leading or trailing whitespace');
  }
  if (apiKey.includes(' ')) {
    issues.push('API key contains spaces');
  }
  if (/\s/.test(apiKey)) {
    issues.push('API key contains whitespace characters');
  }

  // Length validation
  if (cleanKey.length < 40) {
    issues.push(`API key length (${cleanKey.length}) is too short. Expected at least 40 characters`);
  }

  // Prefix validation
  if (!cleanKey.startsWith('sk-') && !cleanKey.startsWith('sk-pro-') && !cleanKey.startsWith('sk-proj-')) {
    issues.push('API key must start with sk-, sk-pro-, or sk-proj-');
  }

  // Character validation
  const validCharsRegex = /^[a-zA-Z0-9_-]+$/;
  const keyWithoutPrefix = cleanKey.replace('sk-', '').replace('pro-', '').replace('proj-', '');
  if (!validCharsRegex.test(keyWithoutPrefix)) {
    issues.push('API key contains invalid characters');
  }

  // Add warnings for potential issues
  if (cleanKey.length > 100) {
    warnings.push('API key is unusually long');
  }

  // Log validation attempt (safely)
  console.log('API Key Validation Attempt:', {
    timestamp: new Date().toISOString(),
    hasIssues: issues.length > 0,
    hasWarnings: warnings.length > 0,
    details: {
      type: details.type,
      length: details.length,
      wasTrimed: details.wasTrimed,
      hasValidChars: details.hasValidChars,
      structure: details.structure
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    details
  };
};

// Initialize OpenAI client
const initializeOpenAI = async () => {
  try {
    // Debug logging for environment variables
    console.log('Environment Debug:', {
      NODE_ENV: process.env.NODE_ENV,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      keyLength: process.env.OPENAI_API_KEY?.length,
      keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 8),
      timestamp: new Date().toISOString()
    });

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required');
    }

    const apiKey = process.env.OPENAI_API_KEY.trim();
    
    // Validate API key format first
    const validationResult = validateApiKey(apiKey);
    console.log('API Key Validation Result:', {
      isValid: validationResult.isValid,
      issues: validationResult.issues,
      warnings: validationResult.warnings,
      details: {
        type: validationResult.details.type,
        length: validationResult.details.length,
        prefix: validationResult.details.prefix,
        structure: validationResult.details.structure
      }
    });

    if (!validationResult.isValid) {
      throw new Error(`Invalid API key format: ${validationResult.issues.join(', ')}`);
    }

    // Test direct API call first
    console.log('Testing API connection...');
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const testData = await testResponse.json();
    
    if (!testResponse.ok) {
      console.error('API Test Failed:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        error: testData.error
      });
      
      // Provide specific error messages based on status code
      switch (testResponse.status) {
        case 401:
          throw new Error('Authentication failed: Invalid API key');
        case 403:
          throw new Error('Authorization failed: Insufficient permissions');
        case 429:
          throw new Error('Rate limit exceeded: Too many requests');
        default:
          throw new Error(`API test failed: ${testData.error?.message || testResponse.statusText}`);
      }
    }

    console.log('API Test Successful:', {
      status: testResponse.status,
      models: testData.data?.length || 0
    });

    // Create OpenAI client with minimal configuration
    openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.openai.com/v1'
    });

    return true;
  } catch (error) {
    console.error('OpenAI Setup Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown',
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

// Language name mapping
const languageNames: { [key: string]: string } = {
  en: 'English',
  zh: 'Chinese',
  hi: 'Hindi',
  es: 'Spanish',
  ar: 'Arabic',
  fr: 'French',
  bn: 'Bengali',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese'
}

const getLanguageName = (code: string): string => {
  return languageNames[code] || 'English'
}

export async function POST(request: Request) {
  try {
    // Set CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    // Handle OPTIONS request for CORS
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { headers });
    }

    console.log('API Request received:', {
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString()
    });

    // Initialize OpenAI if not already initialized
    if (!openai) {
      await initializeOpenAI();
    }

    if (!openai) {
      throw new Error('Failed to initialize OpenAI client');
    }

    // Parse and validate request body
    const body = await request.json().catch((error) => {
      console.error('Failed to parse request body:', error);
      throw new Error('Invalid JSON in request body');
    });
    
    console.log('Request body:', {
      ...body,
      timestamp: new Date().toISOString()
    });

    // Validate with Zod schema
    const validatedData = contentGenerationSchema.parse(body);
    const { location, keyword, category, mood, language } = validatedData;

    console.log('Validated data:', {
      location,
      keyword,
      category,
      mood,
      language,
      timestamp: new Date().toISOString()
    });

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system' as const,
        content: `You are a creative social media content writer. Generate engaging captions and relevant hashtags.
        You must respond with a valid JSON object containing exactly these fields:
        {
          "caption": "Your engaging caption text here (do not include any hashtags in the caption)",
          "hashtags": ["tag1", "tag2", "tag3"] (5-7 relevant words without # symbols)
        }
        
        Important rules:
        1. Keep the caption concise and engaging
        2. Do NOT include hashtags in the caption text
        3. Include 5-7 relevant hashtags as separate words without # symbols
        4. Do not include any other text or formatting in your response
        5. Ensure the response is a valid JSON object`
      },
      {
        role: 'user' as const,
        content: generatePrompt(validatedData)
      }
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the JSON response
    const parsedContent = JSON.parse(content);
    
    if (!parsedContent.caption || !Array.isArray(parsedContent.hashtags)) {
      throw new Error('Invalid response format from OpenAI');
    }

    console.log('Generated Content:', {
      caption: parsedContent.caption,
      hashtags: parsedContent.hashtags,
      rawContent: content
    });

    return NextResponse.json(
      {
        success: true,
        caption: parsedContent.caption,
        hashtags: parsedContent.hashtags,
        mood: validatedData.mood,
        timestamp: new Date().toISOString()
      },
      { headers }
    );

  } catch (error) {
    console.error('Error generating content:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    let statusCode = 500;
    let message = 'An unexpected error occurred';
    
    if (error instanceof z.ZodError) {
      statusCode = 400;
      message = error.errors.map(e => e.message).join(', ');
    } else if (error instanceof Error) {
      message = error.message;
      
      // Add specific error messages for common issues
      if (message.includes('JSON')) {
        message = 'Failed to parse AI response. Please try again.';
      } else if (message.includes('API key')) {
        message = 'API configuration error. Please check your settings.';
      } else if (message.includes('rate limit')) {
        message = 'Too many requests. Please try again in a moment.';
      }
    }

    // Set error response headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    return NextResponse.json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString()
      },
      { 
        status: statusCode,
        headers
      }
    );
  }
}

// Helper function to generate the prompt based on available inputs
function generatePrompt(data: { 
  location?: string, 
  keyword?: string, 
  category: string, 
  mood: string, 
  language: string 
}) {
  let prompt = ''
  
  // Build the base prompt based on available inputs
  if (data.location && data.keyword) {
    prompt = `Generate a social media caption about ${data.keyword} at ${data.location}. `
  } else if (data.location) {
    prompt = `Generate a social media caption about ${data.location}. `
  } else if (data.keyword) {
    prompt = `Generate a social media caption about ${data.keyword}. `
  }

  // Add category and mood context
  prompt += `The content should be in the ${data.category} category with a ${data.mood} tone. `
  
  // Add hashtag and language requirements
  prompt += `Include relevant hashtags. The response should be in ${getLanguageName(data.language)} language.`

  return prompt
} 