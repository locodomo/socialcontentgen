'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { Box, styled } from '@mui/material'
import { useTheme } from '../theme/ThemeProvider'

const StyledSwitch = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '64px',
  height: '32px',
  padding: '4px',
  borderRadius: '24px',
  backgroundColor: theme.palette.mode === 'dark' ? '#365314' : '#84cc16',
  transition: 'background-color 0.3s ease',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: theme.palette.mode === 'dark' ? 'flex-end' : 'flex-start',

  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#3f6212' : '#65a30d',
  },

  '& .toggle-thumb': {
    width: '24px',
    height: '24px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },

  '& .toggle-icon': {
    color: theme.palette.mode === 'dark' ? '#fbbf24' : '#eab308',
    width: '16px',
    height: '16px',
  }
}))

export function ThemeToggle() {
  const { mode, toggleColorMode } = useTheme()
  const isDark = mode === 'dark'

  return (
    <StyledSwitch 
      onClick={toggleColorMode} 
      role="button" 
      tabIndex={0}
      aria-label="Toggle theme"
    >
      <Box className="toggle-thumb">
        {isDark ? (
          <Moon className="toggle-icon" />
        ) : (
          <Sun className="toggle-icon" />
        )}
      </Box>
    </StyledSwitch>
  )
} 