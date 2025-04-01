/// <reference types="@types/google.maps" />

import * as exifr from 'exifr'

declare global {
  interface Window {
    google?: typeof google
    initMap?: () => void
  }
}

async function loadGoogleMapsScript(): Promise<void> {
  if (window.google?.maps?.Geocoder) {
    return // Script already loaded and Geocoder is available
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured')
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly&loading=async`
    script.async = true
    script.defer = true
    
    const checkGeocoder = () => {
      if (window.google?.maps?.Geocoder) {
        resolve()
      } else {
        setTimeout(checkGeocoder, 100) // Check again in 100ms
      }
    }

    // Listen for the script load event
    script.addEventListener('load', () => {
      // Start checking for Geocoder
      checkGeocoder()
    })
    
    script.onerror = () => {
      const currentUrl = window.location.origin;
      reject(new Error(`Failed to load Google Maps API. If this is a RefererNotAllowed error, please authorize ${currentUrl} in the Google Cloud Console.`))
    }
    
    // Set a timeout to prevent infinite checking
    setTimeout(() => {
      reject(new Error('Timeout waiting for Google Maps API to initialize'))
    }, 10000) // 10 second timeout
    
    document.head.appendChild(script)
  })
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    await loadGoogleMapsScript()

    // Double check that Geocoder is available
    if (!window.google?.maps?.Geocoder) {
      throw new Error('Google Maps Geocoder is not available')
    }

    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder()
      const latlng = { lat: latitude, lng: longitude }

      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0]
          const components: { [key: string]: string } = {}

          // Extract address components
          result.address_components.forEach((component: google.maps.GeocoderAddressComponent) => {
            if (component.types.includes('locality')) components.city = component.long_name
            if (component.types.includes('administrative_area_level_1')) components.state = component.long_name
            if (component.types.includes('country')) components.country = component.long_name
            if (component.types.includes('point_of_interest')) components.poi = component.long_name
            if (component.types.includes('neighborhood')) components.neighborhood = component.long_name
          })

          // Build the address string in order of specificity
          const addressParts: string[] = []
          if (components.poi) addressParts.push(components.poi)
          if (components.neighborhood) addressParts.push(components.neighborhood)
          if (components.city) addressParts.push(components.city)
          if (components.state) addressParts.push(components.state)
          if (components.country) addressParts.push(components.country)

          resolve(addressParts.length > 0 ? addressParts.join(', ') : result.formatted_address)
        } else if (status === 'REQUEST_DENIED') {
          const currentUrl = window.location.origin;
          reject(new Error(`Google Maps API request denied. Please ensure ${currentUrl} is authorized in the Google Cloud Console.`))
        } else {
          reject(new Error(`Geocoding failed: ${status}`))
        }
      })
    })
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    throw error instanceof Error ? error : new Error('Failed to get location details')
  }
}

export async function getLocationFromImage(file: File): Promise<string> {
  try {
    // First check if the file is an image
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload a valid image file')
    }

    // Try to extract GPS data
    const gps = await exifr.gps(file)
    
    // If no GPS data, return empty string to allow manual location entry
    if (!gps || !gps.latitude || !gps.longitude) {
      return ''
    }

    // Validate coordinates are within reasonable range
    if (Math.abs(gps.latitude) > 90 || Math.abs(gps.longitude) > 180) {
      return ''
    }

    try {
      // Try to get the address from coordinates
      const address = await reverseGeocode(gps.latitude, gps.longitude)
      return address
    } catch (geocodeError) {
      console.error('Error getting address from coordinates:', geocodeError)
      return ''
    }
  } catch (error) {
    console.error('Error extracting location from image:', error)
    return ''
  }
} 