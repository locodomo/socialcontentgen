'use client'

import * as React from 'react'
import { LightMode, DarkMode } from '@mui/icons-material'

interface HeaderProps {
  mode: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Header({ mode, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-center">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {mode === 'dark' ? (
            <LightMode sx={{ fontSize: 24 }} />
          ) : (
            <DarkMode sx={{ fontSize: 24 }} />
          )}
        </button>
      </div>
    </header>
  )
} 