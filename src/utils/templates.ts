// Caption templates with emoji variations
export const captionTemplates = [
  {
    template: "✨ Exploring the magical streets of {location}! Can't get enough of this incredible place 🌟",
    mood: "excited"
  },
  {
    template: "🌅 Beautiful day in {location}! Making memories that will last forever 📸",
    mood: "peaceful"
  },
  {
    template: "🗺️ Lost in the beauty of {location}! Every corner tells a story 🎭",
    mood: "adventurous"
  },
  {
    template: "💫 Living my best life in {location}! The vibes here are unmatched ✨",
    mood: "happy"
  },
  {
    template: "🌆 City lights and urban delights in {location}! This place never fails to amaze 🌟",
    mood: "urban"
  },
  {
    template: "🌿 Finding peace and tranquility in {location}! Nature's beauty at its finest 🍃",
    mood: "nature"
  },
  {
    template: "🎨 Soaking in the culture and art of {location}! Every moment is inspiring ✨",
    mood: "cultural"
  },
  {
    template: "🌊 Coastal vibes and good times in {location}! Paradise found 🏖️",
    mood: "beach"
  },
  {
    template: "🌄 Chasing sunsets in {location}! These views are absolutely breathtaking ✨",
    mood: "sunset"
  },
  {
    template: "🍜 Savoring the flavors of {location}! A feast for all the senses 🥢",
    mood: "food"
  },
  {
    template: "🎭 Immersed in the vibrant culture of {location}! Every moment feels like magic ✨",
    mood: "cultural"
  },
  {
    template: "🏃‍♂️ Adventure awaits in {location}! Ready to explore every hidden gem 🗺️",
    mood: "adventure"
  }
]

// Hashtag categories
export const hashtagCategories = {
  general: [
    'travel', 'wanderlust', 'explore', 'adventure', 'discover',
    'photography', 'travelphotography', 'travelgram', 'instatravel',
    'photooftheday', 'beautiful', 'amazing', 'picoftheday', 'instagood',
    'traveltheworld', 'travelblogger', 'travelphoto', 'traveler',
    'photographer', 'adventureseeker', 'roamtheplanet', 'adventurethatislife',
    'goexplore'
  ],
  photography: [
    'photography', 'photooftheday', 'photographer', 'naturephotography',
    'travelphotography', 'streetphotography', 'portraitphotography',
    'landscapephotography', 'wildlifephotography', 'mobilephotography',
    'architecturephotography', 'aerialphotography'
  ],
  drone: [
    'drone', 'dronephotography', 'dronestagram', 'droneoftheday',
    'dronesdaily', 'dronefly', 'dronepilot', 'dronegear', 'dronelife'
  ],
  landmarks: [
    'landmark', 'architecture', 'history', 'monument', 'historic',
    'cityscape', 'historiclandmarks', 'iconiclandmarks', 'landmarks'
  ],
  regions: {
    japan: [
      'japantravel', 'japan', 'japantrip', 'tokyo', 'kyoto', 'osaka',
      'visitjapan', 'japanphotography', 'japanlife', 'japanculture'
    ]
  },
  mood: {
    excited: ['excited', 'happiness', 'goodvibes', 'bestday', 'lovinglife', 'excitement', 'joyful'],
    peaceful: ['peaceful', 'serenity', 'mindfulness', 'calm', 'relaxation', 'zen', 'peace'],
    adventurous: ['adventure', 'explore', 'discover', 'wanderer', 'neverstopexploring', 'adventuretime'],
    happy: ['happy', 'smile', 'joy', 'blessed', 'gratitude', 'happiness', 'positivevibes'],
    urban: ['citylife', 'urban', 'streetphotography', 'citylights', 'cityscape', 'urbanstyle'],
    nature: ['nature', 'naturephotography', 'outdoors', 'naturelovers', 'wilderness', 'naturelover'],
    cultural: ['culture', 'art', 'history', 'heritage', 'architecture', 'tradition', 'culturalheritage'],
    beach: ['beach', 'ocean', 'coastal', 'beachlife', 'seaside', 'beachvibes', 'oceanlife'],
    sunset: ['sunset', 'sunsetlovers', 'goldenhour', 'sunsetphotography', 'dusk', 'twilight'],
    food: ['food', 'foodie', 'foodphotography', 'foodstagram', 'foodlover', 'cuisine', 'yummy']
  },
  time: [
    'instagood', 'instadaily', 'nofilter', 'lifestyle',
    'memories', 'moment', 'capture', 'live', 'experience',
    'today', 'photooftheday', 'picoftheday', 'instamood'
  ]
}

// Function to generate location-specific hashtags
export function generateLocationHashtags(location: string): string[] {
  const locationWords = location.toLowerCase().split(/[,\s]+/)
  const locationTags = locationWords.map(word => word.trim()).filter(Boolean)
  
  const result = [
    ...locationTags.map(tag => tag.replace(/[^\w]/g, '')),
    `visit${locationWords[0]}`,
    `${locationWords[0]}life`,
    `${locationWords[0]}photography`,
    `${locationWords[0]}vibes`,
    `discover${locationWords[0]}`,
    `${locationWords[0]}moments`
  ]

  return [...new Set(result)]
}

// Function to select random items from an array
export function getRandomItems(array: string[], count: number): string[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Function to select a random template
export function getRandomTemplate(): typeof captionTemplates[0] {
  return captionTemplates[Math.floor(Math.random() * captionTemplates.length)]
}

// Function to generate hashtags based on mood and location
export function generateHashtags(location: string, mood: string): string[] {
  const generalTags = getRandomItems(hashtagCategories.general, 4)
  const moodTags = getRandomItems(hashtagCategories.mood[mood as keyof typeof hashtagCategories.mood] || [], 3)
  const timeTags = getRandomItems(hashtagCategories.time, 2)
  const photographyTags = getRandomItems(hashtagCategories.photography, 3)
  const landmarkTags = getRandomItems(hashtagCategories.landmarks, 2)
  const locationTags = generateLocationHashtags(location)

  // Add region-specific tags if location matches
  const locationLower = location.toLowerCase()
  let regionTags: string[] = []
  if (locationLower.includes('japan') || 
      locationLower.includes('tokyo') || 
      locationLower.includes('kyoto') || 
      locationLower.includes('osaka')) {
    regionTags = getRandomItems(hashtagCategories.regions.japan, 4)
  }

  // Add drone tags occasionally (20% chance)
  const droneTags = Math.random() < 0.2 ? getRandomItems(hashtagCategories.drone, 3) : []

  return [...new Set([
    ...generalTags,
    ...moodTags,
    ...timeTags,
    ...photographyTags,
    ...landmarkTags,
    ...regionTags,
    ...droneTags,
    ...locationTags
  ])]
} 