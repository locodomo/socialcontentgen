'use client'

import * as React from 'react'
import './globals.css'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import useMediaQuery from '@mui/material/useMediaQuery'
import { lightTheme, darkTheme } from '../theme'
import Header from '../components/Header'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setMode] = React.useState<'light' | 'dark'>(
    prefersDarkMode ? 'dark' : 'light'
  )

  React.useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as 'light' | 'dark' | null
    if (savedMode) {
      setMode(savedMode)
    }
  }, [])

  const theme = React.useMemo(
    () => (mode === 'dark' ? darkTheme : lightTheme),
    [mode]
  )

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light'
    setMode(newMode)
    localStorage.setItem('theme-mode', newMode)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header mode={mode} onToggleTheme={toggleTheme} />
      <main className="min-h-screen">
        {children}
      </main>
    </ThemeProvider>
  )
} 