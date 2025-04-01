import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { prompt, size } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: size || "1024x1024",
      quality: "standard",
      n: 1,
    })

    if (!response.data || !response.data[0]?.url) {
      throw new Error('No image URL in response')
    }

    return NextResponse.json({
      imageUrl: response.data[0].url
    })

  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
} 