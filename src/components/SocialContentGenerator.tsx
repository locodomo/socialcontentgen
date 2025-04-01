import { Container } from '@mui/material';
import ContentGenerator from './ContentGenerator';

export default function SocialContentGenerator() {
  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        minHeight: 'calc(100vh - 70px)', // Subtract navbar height
        backgroundColor: 'background.default',
        py: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 4 }
      }}
    >
      <ContentGenerator onGenerationComplete={() => {}} />
    </Container>
  );
} 