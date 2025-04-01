import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { text, targetLanguage } = await req.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to ${targetLanguage}. Maintain the same tone and style, including any emojis or special characters. Only respond with the translated text, nothing else.`
        },
        {
          role: "user",
          content: text
        }
      ]
    })

    const translatedText = completion.choices[0]?.message?.content

    if (!translatedText) {
      throw new Error('No translation generated')
    }

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
} 