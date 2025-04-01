import { NextResponse } from 'next/server'

export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured')
    }

    const response = await fetch('https://api.openai.com/v1/dashboard/billing/usage', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch usage data')
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      usage: data,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error checking API usage:', error)
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        success: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 