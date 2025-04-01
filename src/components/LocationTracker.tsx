import * as React from 'react'
import { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert,
  Snackbar,
  Box,
  Grid,
  TextField,
  IconButton,
  InputAdornment
} from '@mui/material'
import { 
  LocationOn, 
  ContentCopy, 
  AutoAwesome,
  Search,
  MyLocation
} from '@mui/icons-material'
import { reverseGeocode } from '../utils/geocoding'

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface GeneratedContent {
  caption: string;
  hashtags: string[];
  mood?: string;
}

const LocationTracker: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationInput, setLocationInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      setError(null);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            setLocation({ latitude, longitude });
            
            setAddressLoading(true);
            const address = await reverseGeocode(latitude, longitude);
            setLocation(prev => prev ? { ...prev, address } : null);
            setLocationInput(address || "");
          } catch (err) {
            console.error('Location error:', err);
            setError(err instanceof Error ? err.message : "Failed to get location details");
          } finally {
            setAddressLoading(false);
            setLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = "Failed to get your location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Please allow location access to use this feature";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          setError(errorMessage);
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) {
      setLocation({ latitude: 0, longitude: 0, address: locationInput.trim() });
      setError(null);
    }
  };

  const handleGenerateContent = async () => {
    if (!location?.address) {
      setError("Location address is required to generate content");
      return;
    }
    
    setGeneratingContent(true);
    setError(null);

    try {
      const response = await fetch('/socialcontentgen/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setGeneratedContent(data);
      setError(null);
    } catch (err) {
      console.error('Content generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content');
      setGeneratedContent(null);
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleCopyToClipboard = (text: string, type: 'caption' | 'hashtags') => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage(`${type === 'caption' ? 'Caption' : 'Hashtags'} copied to clipboard`);
    setSnackbarOpen(true);
  };

  return (
    <Card elevation={0}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocationOn sx={{ mr: 1 }} /> Location
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box component="form" onSubmit={handleLocationSubmit} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Enter or detect location"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                disabled={loading || addressLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        type="submit"
                        disabled={!locationInput.trim() || loading || addressLoading}
                        sx={{ mr: 0.5 }}
                      >
                        <Search />
                      </IconButton>
                      <IconButton 
                        onClick={getCurrentLocation}
                        disabled={loading || addressLoading}
                        color={location?.latitude && location?.longitude ? "primary" : "default"}
                      >
                        <MyLocation />
                      </IconButton>
                    </InputAdornment>
                  ),
                  startAdornment: (loading || addressLoading) ? (
                    <InputAdornment position="start">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null
                }}
                placeholder="Type an address or click the location icon"
                helperText={location?.latitude && location?.longitude ? `📍 ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : "Enter location or use current position"}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {location?.address && (
              <Button
                variant="contained"
                startIcon={<AutoAwesome />}
                onClick={handleGenerateContent}
                disabled={generatingContent}
                fullWidth
                sx={{ mt: 2 }}
              >
                {generatingContent ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Generating...
                  </>
                ) : (
                  'Generate Content for This Location'
                )}
              </Button>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            {generatedContent && (
              <Box>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        Caption
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<ContentCopy />}
                        onClick={() => handleCopyToClipboard(generatedContent.caption, 'caption')}
                      >
                        Copy
                      </Button>
                    </Box>
                    <Typography variant="body1">
                      {generatedContent.caption}
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" color="text.secondary">
                        Hashtags
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<ContentCopy />}
                        onClick={() => handleCopyToClipboard(generatedContent.hashtags.join(' '), 'hashtags')}
                      >
                        Copy
                      </Button>
                    </Box>
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                      {generatedContent.hashtags.join(' ')}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Grid>
        </Grid>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </CardContent>
    </Card>
  );
};

export default LocationTracker; 