'use client'

import * as React from 'react'
import { useState } from 'react'
import Image from 'next/image'
import { 
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { 
  Copy,
  Laugh,
  Globe,
  FileText,
  Sparkles,
  Loader2,
  Instagram,
  Twitter,
  Share2,
  Facebook,
  Linkedin,
  MessageCircle,
  Video,
  CloudMoonRain,
  BookOpenText,
  Heart
} from 'lucide-react'
import { contentGenerationSchema, translationRequestSchema } from '../lib/schemas'
import * as z from 'zod'

export default function ContentGenerator({ onGenerationComplete }: { onGenerationComplete: () => void }) {
  const [location, setLocation] = useState('')
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<string>('general')
  const [mood, setMood] = useState<string>('casual')
  const [generatedCaption, setGeneratedCaption] = useState<string>('')
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [language, setLanguage] = useState<string>('en')
  const [pageVisits, setPageVisits] = useState(0)
  const [uniqueUsers, setUniqueUsers] = useState(0)
  const [totalGenerated, setTotalGenerated] = useState(0)
  const [dailyGenerations, setDailyGenerations] = useState(0)
  const MAX_DAILY_GENERATIONS = 6

  // Track page visits and unique users on component mount
  React.useEffect(() => {
    // Get or initialize visit count
    const visits = parseInt(localStorage.getItem('pageVisits') || '0')
    setPageVisits(visits + 1)
    localStorage.setItem('pageVisits', (visits + 1).toString())

    // Track unique users
    const userId = localStorage.getItem('userId')
    if (!userId) {
      const newUserId = Math.random().toString(36).substring(2, 15)
      localStorage.setItem('userId', newUserId)
      const users = parseInt(localStorage.getItem('uniqueUsers') || '0')
      setUniqueUsers(users + 1)
      localStorage.setItem('uniqueUsers', (users + 1).toString())
    } else {
      // If user exists, just get the current count
      const users = parseInt(localStorage.getItem('uniqueUsers') || '0')
      setUniqueUsers(users)
    }

    // Get total generated content count
    const total = parseInt(localStorage.getItem('totalGenerated') || '0')
    setTotalGenerated(total)

    // Get daily generations count
    const today = new Date().toDateString()
    const lastGenerationDate = localStorage.getItem('lastGenerationDate')
    const generations = parseInt(localStorage.getItem('dailyGenerations') || '0')

    if (lastGenerationDate !== today) {
      // Reset daily count if it's a new day
      setDailyGenerations(0)
      localStorage.setItem('dailyGenerations', '0')
      localStorage.setItem('lastGenerationDate', today)
    } else {
      setDailyGenerations(generations)
    }
  }, [])

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'coffee', label: 'Coffee & Cafes' },
    { value: 'photography', label: 'Photography' },
    { value: 'travel', label: 'Travel & Adventure' },
    { value: 'jellycat', label: 'Jellycat Collection' },
    { value: 'designer_toys', label: 'Designer Toys' },
    { value: 'toy_collections', label: 'Toy Collections' },
    { value: 'sculpt_toys', label: 'Sculpt & Art Toys' }
  ]

  const moods = [
    { value: 'casual', label: 'Casual & Relaxed' },
    { value: 'professional', label: 'Professional & Formal' },
    { value: 'funny', label: 'Funny & Humorous' },
    { value: 'inspirational', label: 'Inspirational & Motivating' },
    { value: 'excited', label: 'Excited & Energetic' },
    { value: 'thoughtful', label: 'Thoughtful & Reflective' },
    { value: 'friendly', label: 'Friendly & Warm' },
    { value: 'sarcastic', label: 'Sarcastic & Witty' },
    { value: 'minimalist', label: 'Minimalist & Simple' },
    { value: 'artistic', label: 'Artistic & Creative' }
  ]

  const languages = [
    { value: 'en', label: 'English (English)' },
    { value: 'zh', label: '中文 (Chinese)' },
    { value: 'hi', label: 'हिन्दी (Hindi)' },
    { value: 'es', label: 'Español (Spanish)' },
    { value: 'ar', label: 'العربية (Arabic)' },
    { value: 'fr', label: 'Français (French)' },
    { value: 'bn', label: 'বাংলা (Bengali)' },
    { value: 'pt', label: 'Português (Portuguese)' },
    { value: 'ru', label: 'Русский (Russian)' },
    { value: 'ja', label: '日本語 (Japanese)' }
  ]

  const translateContent = async (text: string, targetLanguage: string) => {
    if (targetLanguage === 'en') return text // No translation needed for English
    
    try {
      // Validate translation request
      const validatedRequest = translationRequestSchema.parse({
        text,
        targetLanguage
      });

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedRequest),
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const data = await response.json()
      return data.translatedText
    } catch (err) {
      console.error('Translation error:', err)
      // Return original text if translation fails
      return text
    }
  }

  const generateContent = async () => {
    // Allow generation if either location or keyword is provided
    if (!location.trim() && !keyword.trim()) {
      setError('Please provide either a location or a keyword to generate content')
      setSnackbarMessage('Location or keyword required')
      setSnackbarOpen(true)
      return
    }

    if (dailyGenerations >= MAX_DAILY_GENERATIONS) {
      setError('You have reached the daily limit of 6 generations. Please try again tomorrow.')
      setSnackbarMessage('Daily generation limit reached')
      setSnackbarOpen(true)
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location.trim(),
          keyword: keyword.trim(),
          category,
          mood,
          language
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
        throw new Error(errorData.error || `Failed to generate content: ${response.status}`)
      }

      const data = await response.json()
      setGeneratedCaption(data.caption)
      setGeneratedHashtags(data.hashtags || [])
      
      // Update generation counts
      const newTotal = totalGenerated + 1
      const newDaily = dailyGenerations + 1
      setTotalGenerated(newTotal)
      setDailyGenerations(newDaily)
      
      // Store updated counts
      localStorage.setItem('totalGenerated', newTotal.toString())
      localStorage.setItem('dailyGenerations', newDaily.toString())
      localStorage.setItem('lastGenerationDate', new Date().toDateString())
      
      onGenerationComplete()
      
      // Clear any previous errors
      setError('')
    } catch (err) {
      console.error('Error generating content:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate content')
      setSnackbarMessage('Failed to generate content')
      setSnackbarOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateContent()
  }

  const handleCopyToClipboard = (text: string, type: 'caption' | 'hashtags') => {
    navigator.clipboard.writeText(text)
    setSnackbarMessage(`${type === 'caption' ? 'Caption' : 'Hashtags'} copied to clipboard`)
    setSnackbarOpen(true)
  }

  const handleTwitterShare = (caption: string, hashtags: string[]) => {
    const text = `${caption}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleFacebookShare = (caption: string, hashtags: string[]) => {
    const text = `${caption}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleLinkedInShare = (caption: string, hashtags: string[]) => {
    const text = `${caption}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleThreadsShare = (caption: string, hashtags: string[]) => {
    const text = `${caption}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`
    handleCopyToClipboard(text, 'caption')
    const threadsUrl = `https://www.threads.net/create`
    window.open(threadsUrl, '_blank', 'noopener,noreferrer')
    setSnackbarOpen(true)
  }

  const handleInstagramShare = (caption: string, hashtags: string[]) => {
    const text = `${caption}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`
    handleCopyToClipboard(text, 'caption')
    const instagramUrl = `instagram://camera`
    window.location.href = instagramUrl
    setTimeout(() => {
      window.open('https://instagram.com', '_blank', 'noopener,noreferrer')
    }, 500)
    setSnackbarOpen(true)
  }

  const handleTikTokShare = (caption: string, hashtags: string[]) => {
    const text = `${caption}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`
    handleCopyToClipboard(text, 'caption')
    const tiktokUrl = `tiktok://create`
    window.location.href = tiktokUrl
    setTimeout(() => {
      window.open('https://www.tiktok.com/upload', '_blank', 'noopener,noreferrer')
    }, 500)
    setSnackbarOpen(true)
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {/* Stats Card */}
          <Card sx={{ mb: 3, bgcolor: 'background.default' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {pageVisits}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Page Visits
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {totalGenerated}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Content Generated
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="primary">
                      {dailyGenerations}/{MAX_DAILY_GENERATIONS}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Daily Generation Limit
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}
          >
            <Grid container spacing={3}>
              {/* Left Column - Settings */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Instructions Card */}
                  <Card 
                    elevation={0}
                    sx={{ 
                      p: 2,
                      backgroundColor: 'background.default',
                      borderRadius: '1rem',
                      border: '1px solid',
                      borderColor: 'divider',
                      background: (theme) => `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <BookOpenText className="text-primary" size={24} />
                      <Typography variant="h6">How to Use</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Typography variant="body2">
                        1. Enter a location or keyword (e.g., "Tokyo" or "sunset coffee")
                      </Typography>
                      <Typography variant="body2">
                        2. Select a category & mood (e.g., Travel, Casual)
                      </Typography>
                      <Typography variant="body2">
                        3. Choose your preferred language & generate!
                      </Typography>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<Heart size={20} />}
                        onClick={() => window.open('https://locodomo.com', '_blank', 'noopener,noreferrer')}
                        sx={{ 
                          mt: 1,
                          textTransform: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: 500
                        }}
                      >
                        Support Project
                      </Button>
                    </Box>
                  </Card>

                  {/* Settings Card */}
                  <Card 
                    elevation={0}
                    sx={{ 
                      p: 2,
                      backgroundColor: 'background.default',
                      borderRadius: '1rem',
                      border: '1px solid',
                      borderColor: 'divider',
                      background: (theme) => `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter a location (e.g. Tokyo, Paris)"
                      />

                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 2,
                        my: -0.5 
                      }}>
                        <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            px: 1,
                            fontWeight: 500,
                            fontSize: '0.875rem'
                          }}
                        >
                          or
                        </Typography>
                        <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                      </Box>

                      <TextField
                        fullWidth
                        label="Keyword"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Enter a keyword (e.g. sunset, coffee, art)"
                      />

                      <FormControl fullWidth>
                        <InputLabel id="category-label" sx={{ fontSize: '0.85rem' }}>Content Category</InputLabel>
                        <Select
                          labelId="category-label"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          disabled={isLoading}
                          startAdornment={
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                              <Laugh className="text-primary" size={20} />
                            </Box>
                          }
                          label="Content Category"
                          sx={{
                            '& .MuiSelect-select': {
                              fontSize: '0.85rem'
                            }
                          }}
                        >
                          {categories.map((cat) => (
                            <MenuItem key={cat.value} value={cat.value} sx={{ fontSize: '0.85rem' }}>
                              {cat.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel id="mood-label" sx={{ fontSize: '0.85rem' }}>Content Mood</InputLabel>
                        <Select
                          labelId="mood-label"
                          value={mood}
                          onChange={(e) => setMood(e.target.value)}
                          disabled={isLoading}
                          startAdornment={
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                              <CloudMoonRain className="text-primary" size={20} />
                            </Box>
                          }
                          label="Content Mood"
                          sx={{
                            '& .MuiSelect-select': {
                              fontSize: '0.85rem'
                            }
                          }}
                        >
                          {moods.map((m) => (
                            <MenuItem key={m.value} value={m.value} sx={{ fontSize: '0.85rem' }}>
                              {m.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel id="language-label" sx={{ fontSize: '0.85rem' }}>Language</InputLabel>
                        <Select
                          labelId="language-label"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          disabled={isLoading}
                          startAdornment={
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                              <Globe className="text-primary" size={20} />
                            </Box>
                          }
                          label="Language"
                          sx={{
                            '& .MuiSelect-select': {
                              fontSize: '0.85rem'
                            }
                          }}
                        >
                          {languages.map((lang) => (
                            <MenuItem key={lang.value} value={lang.value} sx={{ fontSize: '0.85rem' }}>
                              {lang.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Button
                        fullWidth
                        variant="contained"
                        type="submit"
                        disabled={isLoading || (!location.trim() && !keyword.trim())}
                        sx={{ 
                          height: '3rem',
                          fontWeight: 500,
                          fontSize: '1rem',
                          textTransform: 'none',
                          borderRadius: '0.5rem'
                        }}
                        startIcon={isLoading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                      >
                        {isLoading ? (
                          'Generating...'
                        ) : (
                          'Generate Content'
                        )}
                      </Button>
                    </Box>
                  </Card>
                </Box>
              </Grid>

              {/* Right Column - Generated Content */}
              <Grid item xs={12} md={8}>
                <Card 
                  elevation={0}
                  sx={{
                    height: '100%',
                    backgroundColor: 'background.default',
                    borderRadius: '1rem',
                    p: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    background: (theme) => `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  {error && !error.includes('location') && (
                    <Alert 
                      severity="error" 
                      sx={{ mb: 3, borderRadius: '0.5rem' }}
                    >
                      {error}
                    </Alert>
                  )}

                  {(!generatedCaption && !generatedHashtags.length) && (
                    <Box 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        color: 'text.secondary',
                        p: 4,
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: '1rem',
                        backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f8fafc' : 'background.paper',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f1f5f9' : 'action.hover'
                        }
                      }}
                    >
                      <FileText size={48} className="mb-4 opacity-50" />
                      <Typography variant="h6" gutterBottom>
                        No Content Generated Yet
                      </Typography>
                      <Typography variant="body2" sx={{ maxWidth: '400px', mb: 2 }}>
                        Please enter a location to generate content.
                      </Typography>
                    </Box>
                  )}

                  {(generatedCaption || generatedHashtags.length > 0) && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {generatedCaption && (
                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Caption
                          </Typography>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              p: 3,
                              backgroundColor: 'background.paper',
                              borderRadius: '0.5rem',
                              mb: 2
                            }}
                          >
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                              {generatedCaption}
                            </Typography>
                          </Card>
                          <Button
                            startIcon={<Copy size={20} />}
                            onClick={() => handleCopyToClipboard(generatedCaption, 'caption')}
                            sx={{
                              textTransform: 'none',
                              borderRadius: '0.5rem'
                            }}
                          >
                            Copy Caption
                          </Button>
                        </Box>
                      )}

                      {generatedHashtags.length > 0 && (
                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                            Hashtags
                          </Typography>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              p: 3,
                              backgroundColor: 'background.paper',
                              borderRadius: '0.5rem',
                              mb: 2
                            }}
                          >
                            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                              {generatedHashtags.map(tag => `#${tag}`).join(' ')}
                            </Typography>
                          </Card>
                          <Button
                            startIcon={<Copy size={20} />}
                            onClick={() => handleCopyToClipboard(generatedHashtags.map(tag => `#${tag}`).join(' '), 'hashtags')}
                            sx={{
                              textTransform: 'none',
                              borderRadius: '0.5rem'
                            }}
                          >
                            Copy Hashtags
                          </Button>
                        </Box>
                      )}

                      {/* Social Sharing Section */}
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Share
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {/* Direct sharing platforms */}
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                              variant="outlined"
                              startIcon={<Twitter size={20} />}
                              onClick={() => handleTwitterShare(generatedCaption, generatedHashtags)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '0.5rem',
                                minWidth: '160px'
                              }}
                            >
                              Share on X
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<Facebook size={20} />}
                              onClick={() => handleFacebookShare(generatedCaption, generatedHashtags)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '0.5rem',
                                minWidth: '160px'
                              }}
                            >
                              Share on Facebook
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<Linkedin size={20} />}
                              onClick={() => handleLinkedInShare(generatedCaption, generatedHashtags)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '0.5rem',
                                minWidth: '160px'
                              }}
                            >
                              Share on LinkedIn
                            </Button>
                          </Box>
                          
                          {/* Copy and open platforms */}
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                              variant="outlined"
                              startIcon={<Instagram size={20} />}
                              onClick={() => handleInstagramShare(generatedCaption, generatedHashtags)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '0.5rem',
                                minWidth: '160px'
                              }}
                            >
                              Open Instagram
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<MessageCircle size={20} />}
                              onClick={() => handleThreadsShare(generatedCaption, generatedHashtags)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '0.5rem',
                                minWidth: '160px'
                              }}
                            >
                              Open Threads
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<Video size={20} />}
                              onClick={() => handleTikTokShare(generatedCaption, generatedHashtags)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '0.5rem',
                                minWidth: '160px'
                              }}
                            >
                              Open TikTok
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: 'background.paper',
            color: 'text.primary',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderRadius: '0.5rem',
          },
        }}
      />

      {/* Copyright Notice */}
      <Box 
        sx={{ 
          textAlign: 'center',
          py: 2,
          mt: 3
        }}
      >
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontWeight: 500,
            fontSize: '0.875rem'
          }}
        >
          Powered by{' '}
          <Box
            component="a"
            href="https://locodomo.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            locodomo.com
          </Box>
          {' '}• All rights reserved
        </Typography>
      </Box>
    </Box>
  )
} 