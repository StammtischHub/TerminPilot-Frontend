import type { ReactNode } from 'react';
import { Container, Typography, useMediaQuery } from '@mui/material';
import { isMobile } from '../utils/ThemeHelpers.ts';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const mobile = useMediaQuery(isMobile);

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <img
        src="/assets/TerminPilot.png"
        alt="TerminPilot Logo"
        style={{ width: mobile ? 300 : 450 }}
      />
      <Typography variant={mobile ? 'h4' : 'h2'} component="h1" sx={{ mt: 0, mb: 4 }}>
        TerminPilot
      </Typography>
      {children}
    </Container>
  );
}
