'use client'

import * as React from 'react'
import ContentGenerator from '../components/ContentGenerator'
import { Container, Grid, Card } from '@mui/material'

export default function Home() {
  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Content Generator */}
        <Grid item xs={12}>
          <Card 
            elevation={0}
            sx={{ 
              p: 2,
              backgroundColor: 'background.default',
              borderRadius: '1rem',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <ContentGenerator onGenerationComplete={() => {}} />
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
} 