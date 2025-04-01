import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Test coordinates for Times Square, New York
    const latitude = 40.7580
    const longitude = -73.9855

    // Log the API key being used (first few characters)
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    console.log('Using API key (first 6 chars):', apiKey.substring(0, 6))

    // Test the API key with a direct request to the Geocoding API
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    const response = await fetch(geocodingUrl)
    const data = await response.json()

    // Log the response status and data
    console.log('Geocoding API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    })

    if (!response.ok) {
      throw new Error(`Geocoding API request failed: ${response.statusText}`)
    }

    if (data.status !== 'OK') {
      throw new Error(`Geocoding API error: ${data.status} - ${data.error_message || 'Unknown error'}`)
    }

    return NextResponse.json({
      success: true,
      message: 'API key is valid',
      testResult: {
        apiKeyPrefix: apiKey.substring(0, 6),
        geocodingStatus: data.status,
        results: data.results?.[0]?.formatted_address || 'No address found'
      }
    })

  } catch (error) {
    console.error('Maps API test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
} 