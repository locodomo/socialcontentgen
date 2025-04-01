import { z } from 'zod'

// Schema for content generation request
export const contentGenerationSchema = z.object({
  location: z.string().transform(val => val.trim()),
  keyword: z.string().transform(val => val.trim()),
  category: z.string().default('general'),
  mood: z.string().optional().default('casual'),
  language: z.string().min(2, 'Invalid language code').default('en')
})
.strict()
.refine(
  data => data.location.length > 0 || data.keyword.length > 0,
  {
    message: "Either location or keyword must be provided",
    path: ["input"]
  }
)
.transform(data => ({
  ...data,
  category: data.category || 'general',
  mood: data.mood || 'casual',
  language: data.language || 'en'
}))

// Schema for content generation response
export const contentGenerationResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().nullable(),
  caption: z.string().nullable(),
  hashtags: z.array(z.string()).default([]),
  mood: z.string().nullable()
}).strict()

// Schema for translation request
export const translationRequestSchema = z.object({
  text: z.string().min(1, 'Text is required').transform(val => val.trim()),
  targetLanguage: z.string().min(2, 'Target language is required')
}).strict()

// Schema for translation response
export const translationResponseSchema = z.object({
  translatedText: z.string(),
  success: z.boolean(),
  error: z.string().nullable()
}).strict()

// Types derived from schemas
export type ContentGenerationRequest = z.infer<typeof contentGenerationSchema>
export type ContentGenerationResponse = z.infer<typeof contentGenerationResponseSchema>
export type TranslationRequest = z.infer<typeof translationRequestSchema>
export type TranslationResponse = z.infer<typeof translationResponseSchema> 