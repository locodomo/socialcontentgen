import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import ExifReader from 'exifreader'

// Initialize OpenAI client with retry configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 5, // Increased retries
  timeout: 60000, // Increased timeout
})

// Helper function to validate API availability and authentication
async function checkAPIAvailability() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5
    })
    return response.choices.length > 0
  } catch (error: any) {
    console.error('API availability check failed:', error)
    
    // Check for specific authentication errors
    if (error?.response?.status === 401 || 
        error?.message?.includes('invalid_api_key') || 
        error?.message?.includes('auth')) {
      throw new Error('Authentication error: Invalid API key')
    }
    
    return false
  }
}

// Helper function to extract text with retries
async function extractTextWithLayout(base64Image: string, fileType: string) {
  let attempts = 0
  const maxAttempts = 3
  const backoffDelay = 1000

  while (attempts < maxAttempts) {
    try {
      // Ensure API key is properly configured
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured')
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract and analyze all text in this image. Identify any location information such as addresses, cities, or geographical references. Return the results in JSON format with the following structure:\n\n{\n  "text": "all text combined",\n  "blocks": [{"content": "text block", "position": "description of location"}],\n  "location_data": {\n    "found": boolean,\n    "type": "address|city|region|other",\n    "value": "extracted location",\n    "confidence": "high|medium|low"\n  }\n}'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/${fileType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
        response_format: { type: "json_object" }
      })

      if (!response.choices?.[0]?.message?.content) {
        throw new Error('No content generated from image analysis')
      }

      const defaultResponse = {
        text: "",
        blocks: [],
        metadata: {
          orientation: "horizontal",
          language: "unknown",
          text_density: "sparse"
        },
        location_data: {
          found: false,
          type: null,
          value: null,
          confidence: null
        }
      }

      const parsedResponse = JSON.parse(response.choices[0].message.content || JSON.stringify(defaultResponse))
      
      // Validate the response structure
      if (!parsedResponse.text || !Array.isArray(parsedResponse.blocks)) {
        console.warn('⚠️ Invalid response structure from OpenAI API')
        return defaultResponse
      }

      return {
        ...parsedResponse,
        success: true,
        timestamp: new Date().toISOString()
      }

    } catch (error: any) {
      attempts++
      console.error(`❌ Attempt ${attempts} failed:`, error)

      if (error?.response?.status === 401) {
        throw new Error('Invalid API key or authentication error')
      }

      if (attempts === maxAttempts) {
        throw error
      }

      const delay = backoffDelay * Math.pow(2, attempts - 1)
      console.warn(`⚠️ Retrying in ${delay/1000} seconds...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new Error('Failed to process image after multiple attempts')
}

// Helper function to handle retries with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 5,
  initialDelay: number = 2000
): Promise<T> {
  let attempts = 0
  
  while (attempts < maxAttempts) {
    try {
      return await operation()
    } catch (error: any) {
      attempts++
      console.error(`Attempt ${attempts} failed:`, error)

      // Check if we should retry based on error type
      if (attempts === maxAttempts || 
          error?.message?.includes('invalid_api_key') ||
          error?.message?.includes('insufficient_quota') ||
          error?.response?.status === 401) {
        throw error
      }

      // Calculate delay with exponential backoff and jitter
      const delay = initialDelay * Math.pow(2, attempts - 1) * (0.5 + Math.random() * 0.5)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new Error('Maximum retry attempts reached')
}

// Helper function for content generation
async function generateContent(base64Image: string, fileType: string, category: string) {
  let attempts = 3; // Retry up to 3 times
  let delay = 3000; // Wait 3 seconds between retries

  for (let i = 0; i < attempts; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Generate engaging social media content for this ${category} image. Include:
1. A captivating caption (2-3 sentences)
2. 8-10 relevant hashtags

Format the response as:
CAPTION:
[your caption]

HASHTAGS:
[your hashtags]`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/${fileType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      if (!response.choices?.[0]?.message?.content) {
        throw new Error('No content generated');
      }

      return response.choices[0].message.content;

    } catch (error: any) {
      console.error(`❌ OpenAI API Error (Attempt ${i + 1}/${attempts}):`, error);
      
      // Check specifically for 503 Service Unavailable
      if (error?.response?.status === 503) {
        console.warn(`⚠️ OpenAI Service Unavailable. Retrying in ${delay / 1000} seconds...`);
        if (i < attempts - 1) { // Only wait if we're going to retry
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
      }
      
      // If it's the last attempt or not a 503 error, throw the error
      if (i === attempts - 1 || error?.response?.status !== 503) {
        throw error;
      }
    }
  }

  throw new Error('Failed to generate content after multiple attempts. Please try again later.');
}

// Add new function for GPS metadata extraction
async function extractGPSMetadata(imageBuffer: Buffer): Promise<{ latitude: number | null, longitude: number | null }> {
  try {
    const tags = await ExifReader.load(imageBuffer);
    
    if (tags.GPSLatitude && tags.GPSLongitude) {
      const latitude = tags.GPSLatitude.description;
      const longitude = tags.GPSLongitude.description;
      
      return {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      };
    }
    
    return { latitude: null, longitude: null };
  } catch (error) {
    console.warn("⚠️ Error reading GPS metadata:", error);
    return { latitude: null, longitude: null };
  }
}

export async function POST(request: Request) {
  try {
    // Validate API key before processing
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'API configuration error',
          details: 'Missing API key configuration',
          success: false
        },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'general'
    const mode = formData.get('mode') as string || 'content'

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Convert the file to buffer and base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Extract GPS metadata
    const gpsData = await extractGPSMetadata(buffer)

    // Process based on mode
    if (mode === 'ocr') {
      const textAnalysis = await withRetry(() => extractTextWithLayout(base64Image, file.type))
      return NextResponse.json({
        ...textAnalysis,
        gps_data: gpsData
      })
    } else {
      const content = await generateContent(base64Image, file.type, category)
      
      // Parse the response
      const captionMatch = content.match(/CAPTION:\s*([\s\S]*?)(?=\n\nHASHTAGS:|$)/i)
      const hashtagsMatch = content.match(/HASHTAGS:\s*([\s\S]*?)$/i)

      const caption = captionMatch?.[1]?.trim() || ''
      const hashtagsText = hashtagsMatch?.[1]?.trim() || ''
      const hashtags = hashtagsText.match(/#[\w\d]+/g) || []

      return NextResponse.json({
        caption,
        hashtags: hashtags.map(tag => tag.replace('#', '')),
        gps_data: gpsData,
        success: true,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error: any) {
    console.error('Error in image analysis:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    let statusCode = 500
    let details = 'Please try again later.'

    // Enhanced error classification
    if (error?.response?.status === 429 || errorMessage.includes('quota exceeded') || errorMessage.includes('rate limit')) {
      statusCode = 429
      details = 'Rate limit exceeded. Please try again in a few minutes.'
    } else if (error?.response?.status === 401 || errorMessage.includes('invalid_api_key') || errorMessage.includes('Authentication error')) {
      statusCode = 401
      details = 'Authentication failed. Please check your API key configuration.'
    } else if (error?.response?.status === 503 || errorMessage.toLowerCase().includes('model') || errorMessage.includes('unavailable')) {
      statusCode = 503
      details = 'The Vision API service is temporarily unavailable. Please try again in a few minutes.'
    } else if (errorMessage.includes('parse')) {
      statusCode = 422
      details = 'Failed to parse the API response. Please try again.'
    } else if (error?.response?.status === 413) {
      statusCode = 413
      details = 'The image file is too large. Please use an image under 20MB.'
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details,
        success: false,
        timestamp: new Date().toISOString(),
        retryAfter: statusCode === 429 ? 60 : undefined // Suggest retry after 1 minute for rate limits
      },
      { 
        status: statusCode,
        headers: statusCode === 429 ? { 'Retry-After': '60' } : undefined
      }
    )
  }
} 