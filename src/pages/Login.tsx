import { useState } from 'react';
import { Alert, Button, Container, Link, Stack, Typography, useMediaQuery } from '@mui/material';
import { Login as LoginIcon, PersonOutlined } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext.tsx';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router';
import { isMobile } from '../utils/ThemeHelpers.ts';
import PasswordTextField from '../components/text-field/PasswordTextField.tsx';
import IconTextField from '../components/text-field/IconTextField.tsx';
import { useSafeSubmit } from '../hooks/useSafeSubmit.ts';

export default function Login() {
  const mobile = useMediaQuery(isMobile);
  const navigate = useNavigate();

  const { login, user, isLoading } = useAuth();
  const { submit, isSubmitting, error } = useSafeSubmit();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (isLoading) return null;
  if (user) return <Navigate to="/home" replace />;

  const handleSubmit = () =>
    submit(() => login(username, password), {
      errorMessages: { 401: 'Die Kombination aus Benutzername oder Passwort ist falsch!' },
      onSuccess: () => navigate('/home', { replace: true }),
    });

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <img
        src="/assets/TerminPilot.png"
        alt="TerminPilot Logo"
        style={{ width: mobile ? 300 : 450, textAlign: 'center' }}
      />
      <Typography variant={mobile ? 'h4' : 'h2'} component="h1" sx={{ mt: 0, mb: 4 }}>
        TerminPilot
      </Typography>
      <Stack
        component="form"
        onSubmit={(submit) => {
          submit.preventDefault();
          void handleSubmit();
        }}
        noValidate
        direction="column"
        spacing={2}
        sx={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}
      >
        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        <IconTextField
          id="username-input"
          label="Benutzername"
          icon={<PersonOutlined fontSize="small" />}
          placeholder="Benutzername"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <PasswordTextField
          id="password-input"
          label="Passwort"
          placeholder="Passwort"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Typography component="p" variant="body2">
          Noch kein Konto?{' '}
          <Link component={RouterLink} to="/register" underline="always">
            Registrieren
          </Link>
        </Typography>

        <Button
          type="submit"
          variant="contained"
          sx={{ width: '80%' }}
          startIcon={<LoginIcon />}
          loading={isSubmitting}
        >
          Einloggen
        </Button>
      </Stack>
    </Container>
  );
}
