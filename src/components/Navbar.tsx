'use client'

import * as React from 'react'
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  useTheme
} from '@mui/material'
import { Sparkles, Heart } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

export default function Navbar() {
  const theme = useTheme()

  const handleDonate = () => {
    window.open('https://ko-fi.com/juliawood92753', '_blank', 'noopener,noreferrer')
  }

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        backdropFilter: 'blur(6px)',
        backgroundColor: 'background.default',
        borderBottom: `1px solid ${theme.palette.divider}`,
        height: { xs: '56px', sm: '64px' },
      }}
    >
      <Container maxWidth={false}>
        <Toolbar 
          disableGutters 
          sx={{ 
            height: { xs: '56px', sm: '64px' },
            display: 'flex',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 4 }
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="large"
              edge="start"
              color="primary"
              aria-label="logo"
              sx={{ 
                mr: 1,
                '&:hover': {
                  backgroundColor: 'action.hover'
                },
                padding: { xs: 1, sm: 1.5 }
              }}
            >
              <Sparkles size={20} />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                color: 'text.primary',
                textDecoration: 'none',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              <Box component="span" sx={{ display: { xs: 'block', sm: 'none' } }}>
                Social Content Gen
              </Box>
              <Box component="span" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Social Content Generator
              </Box>
            </Typography>
          </Box>

          {/* Right Section - Donate & Theme */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<Heart size={20} />}
              onClick={handleDonate}
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: '0.5rem',
                px: 3,
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              Support Project
            </Button>
            <ThemeToggle />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
} 