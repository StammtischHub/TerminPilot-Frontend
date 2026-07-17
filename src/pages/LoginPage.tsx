import { useState } from 'react';
import {
  Container,
  Typography,
  InputAdornment,
  IconButton,
  Button,
  Link,
  Stack,
} from '@mui/material';
import {
  PersonOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import TextFieldWithIcon from './components/TextFieldWithIcon.tsx';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Container
      maxWidth="xs"
      sx={{ height: '100dvh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Stack
        direction="column"
        spacing={2.5}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h1">TerminPilot</Typography>

        <TextFieldWithIcon
          id="username-input"
          label="Username"
          placeholder="Dein Name"
          autoComplete="username"
          icon={<PersonOutlined fontSize="small" />}
        />

        <TextFieldWithIcon
          id="password-input"
          label="Password"
          placeholder="Dein Passwort"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          icon={<LockOutlined fontSize="small" />}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    size="small"
                    aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                  >
                    {showPassword ? (
                      <Visibility fontSize="small" />
                    ) : (
                      <VisibilityOff fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <Typography component="p" variant="body2">
          noch kein Konto?{' '}
          <Link href="#" underline="always">
            Registrieren
          </Link>
        </Typography>

        <Button
          variant="contained"
          sx={{
            width: '80%',
          }}
          fullWidth
          startIcon={<LoginIcon />}
        >
          Login
        </Button>
      </Stack>
    </Container>
  );
}
