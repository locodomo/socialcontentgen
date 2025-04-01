import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false, // Ensures API key is only used server-side
});

// Function to generate content using OpenAI
export async function generateContent(location: string, mood?: string, category: string = 'general') {
  try {
    // Create category-specific prompt
    let categoryPrompt = '';
    switch (category) {
      case 'food':
        categoryPrompt = 'Focus on culinary experiences, local cuisine, dining atmosphere, and foodie culture. Include popular food and culinary hashtags.';
        break;
      case 'photography':
        categoryPrompt = 'Focus on photography opportunities, visual spots, lighting conditions, and artistic elements. Include popular photography and visual arts hashtags.';
        break;
      case 'travel':
        categoryPrompt = 'Focus on travel experiences, destination highlights, adventure opportunities, and cultural aspects. Include popular travel and destination hashtags.';
        break;
      default:
        categoryPrompt = 'Focus on general appeal and broad reach.';
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional social media content creator specializing in ${category} content and trending hashtags. ${categoryPrompt} Create engaging content that will maximize reach and engagement.`
        },
        {
          role: "user",
          content: `Generate a captivating social media caption and popular, trending hashtags for this ${category} location: ${location}${mood ? ` with mood: ${mood}` : ''}. Include a mix of general popular hashtags and ${category}-specific ones.\n\nRespond in this format:\n\nCAPTION:\n[2-3 engaging sentences]\n\nHASHTAGS:\n[8-10 trending hashtags, including both general popular ones and ${category}-specific ones]`
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse the response
    const captionMatch = content.match(/CAPTION:\s*([\s\S]*?)(?=\n\nHASHTAGS:|$)/i);
    const hashtagsMatch = content.match(/HASHTAGS:\s*([\s\S]*?)$/i);

    const caption = captionMatch?.[1]?.trim() || '';
    const hashtagsText = hashtagsMatch?.[1]?.trim() || '';
    const hashtags = hashtagsText.match(/#[\w\d]+/g) || [];

    return {
      caption,
      hashtags: hashtags.map(tag => tag.replace('#', '')),
      mood: mood || null
    };
  } catch (error: any) {
    // Handle specific OpenAI API errors
    if (error?.status === 429) {
      throw new Error('API quota exceeded. Please try again later or check your OpenAI account billing status.');
    } else if (error?.status === 401) {
      throw new Error('Authentication error. Please check your OpenAI API key configuration.');
    } else if (error?.status === 404) {
      throw new Error('The selected AI model is not available. Please contact support.');
    }
    
    // Log the full error for debugging
    console.error('OpenAI API Error:', {
      status: error?.status,
      message: error?.message,
      code: error?.code,
      type: error?.type
    });
    
    // Throw a user-friendly error
    throw new Error('Unable to generate content at this time. Please try again later.');
  }
} 