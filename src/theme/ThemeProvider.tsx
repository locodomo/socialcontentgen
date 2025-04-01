'use client'

import * as React from 'react'
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { PaletteMode } from '@mui/material'

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      dark: '#1d4ed8',
      light: '#60a5fa',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
    },
    divider: '#e5e7eb',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    h1: {
      fontSize: '2.125rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.7rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.4875rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.275rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.0625rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.85rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.85rem',
    },
    body2: {
      fontSize: '0.7225rem',
    },
    button: {
      fontSize: '0.7225rem',
      textTransform: 'none',
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.7225rem',
    },
    overline: {
      fontSize: '0.7225rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  },
})

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      dark: '#2563eb',
      light: '#60a5fa',
    },
    background: {
      default: '#111827',
      paper: '#1f2937',
    },
    text: {
      primary: '#f9fafb',
      secondary: '#9ca3af',
    },
    divider: '#374151',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    h1: {
      fontSize: '2.125rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.7rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.4875rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.275rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.0625rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.85rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.85rem',
    },
    body2: {
      fontSize: '0.7225rem',
    },
    button: {
      fontSize: '0.7225rem',
      textTransform: 'none',
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.7225rem',
    },
    overline: {
      fontSize: '0.7225rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          },
        },
      },
    },
  },
})

interface ThemeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

export const ThemeContext = React.createContext<ThemeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<PaletteMode>('dark')

  const toggleColorMode = React.useCallback(() => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
  }, [])

  const theme = React.useMemo(
    () => (mode === 'light' ? lightTheme : darkTheme),
    [mode]
  )

  const contextValue = React.useMemo(
    () => ({
      mode,
      toggleColorMode,
    }),
    [mode, toggleColorMode]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 