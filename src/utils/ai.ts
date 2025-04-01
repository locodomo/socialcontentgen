import { HfInference } from '@huggingface/inference'

const HUGGING_FACE_API_KEY = process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY
const MODEL_NAME = 'facebook/bart-large-cnn'

export async function generateWithMistral(prompt: string): Promise<string> {
  try {
    console.log('Generating content with prompt:', prompt)
    console.log('Using API key:', HUGGING_FACE_API_KEY)

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 100,
            min_length: 30,
            do_sample: true,
            temperature: 0.7,
            top_p: 0.95,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`API request failed: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log('API Response:', result)

    // Format the response with emojis
    const generatedText = result[0]?.generated_text || ''
    const formattedText = addEmojisToText(generatedText)

    return formattedText
  } catch (error) {
    console.error('Error generating content:', error)
    throw error
  }
}

function addEmojisToText(text: string): string {
  const locationEmojis = ['📍', '🌎', '🗺️', '📌'] as const
  const moodEmojis = ['✨', '💫', '🌟', '🌅', '🌄', '🌊', '🌿', '🎨'] as const
  
  // Add a random location emoji at the start
  const locationEmoji = locationEmojis[Math.floor(Math.random() * locationEmojis.length)]
  
  // Add 1-2 random mood emojis
  const numMoodEmojis = Math.floor(Math.random() * 2) + 1
  const selectedMoodEmojis: string[] = []
  for (let i = 0; i < numMoodEmojis; i++) {
    const emoji = moodEmojis[Math.floor(Math.random() * moodEmojis.length)]
    if (!selectedMoodEmojis.includes(emoji)) {
      selectedMoodEmojis.push(emoji)
    }
  }

  return `${locationEmoji} ${text} ${selectedMoodEmojis.join(' ')}`
}

export function constructPrompt(location: string, mood?: string): string {
  return `Create a short, engaging social media caption about ${location}${
    mood ? ` that feels ${mood}` : ''
  }. Make it personal and authentic, focusing on the experience and atmosphere.`
} 