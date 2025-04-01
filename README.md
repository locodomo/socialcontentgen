# Social Media Content Generator

Generate AI-powered social media captions effortlessly! Add a location or keyword, and get engaging captions with relevant hashtags. Share directly to Twitter, Threads, Facebook, and LinkedIn, or copy for Instagram and TikTok. Supports multiple languages with a sleek, user-friendly interface.

## Features

- 🤖 AI-powered caption generation using OpenAI GPT-4
- 📍 Location-based content generation
- 🔍 Keyword-based content generation
- 🌐 Multi-language support
- 📋 One-click copy to clipboard
- #️⃣ Smart hashtag generation
- 🎨 Modern UI with Material-UI components
- 🔄 Direct sharing to social platforms
- 📊 Usage statistics tracking

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (for AI-powered content generation)
- Optional: Google Maps API key (for enhanced location features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/locodomo/socialcontentgen.git
cd socialcontentgen
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   - Open `.env.local` and fill in your API keys and configuration:
   ```env
   # Required
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Application Settings (adjust as needed)
   NEXT_PUBLIC_MAX_DAILY_GENERATIONS=10
   NEXT_PUBLIC_MAX_TOTAL_GENERATIONS=100
   
   # Optional
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id_here
   ```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a location or keyword (or both)
2. Select content category and mood
3. Choose your preferred language
4. Click "Generate Content" to create a caption and hashtags
5. The generated content will include:
   - An engaging caption
   - Relevant hashtags
6. Use the sharing buttons to post directly to social media
7. Or use the copy buttons to copy content to clipboard

## Environment Variables

### Required Variables
- `OPENAI_API_KEY`: Your OpenAI API key for content generation

### Optional Variables
- `GOOGLE_MAPS_API_KEY`: Google Maps API key for enhanced location features
- `NEXT_PUBLIC_MAX_DAILY_GENERATIONS`: Maximum number of generations allowed per day (default: 10)
- `NEXT_PUBLIC_MAX_TOTAL_GENERATIONS`: Maximum total generations allowed (default: 100)
- `NEXT_PUBLIC_ANALYTICS_ID`: Analytics tracking ID

## Tech Stack

- Frontend: Next.js 14, React, TypeScript
- UI Components: Material-UI (MUI)
- AI: OpenAI GPT-4 for content generation
- State Management: React Hooks
- Deployment: Vercel

## Security Notes

- Never commit your `.env`, `.env.local`, or any other files containing API keys
- Keep your API keys secure and rotate them regularly
- Use environment variables for all sensitive configuration
- The `.gitignore` file is configured to prevent accidental commits of sensitive data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
