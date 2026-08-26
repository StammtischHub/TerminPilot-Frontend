import { useState } from 'react';
import { Alert, Button, Container, Link, Stack, Typography, useMediaQuery } from '@mui/material';
import { Login as LoginIcon, PersonOutlined } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext.tsx';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router';
import { isMobile } from '../utils/ThemeHelpers.ts';
import PasswordTextField from '../components/text-field/PasswordTextField.tsx';
import TextFieldWithIcon from '../components/text-field/TextFieldWithIcon.tsx';

export default function Login() {
  const mobile = useMediaQuery(isMobile);
  const navigate = useNavigate();

  const { login, user, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return null;
  if (user) return <Navigate to='/home'  replace />;

  const handleLoginSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
    } catch {
      setError('Benutzername oder Passwort ist falsch.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{ height: '100dvh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}
    >
      <Stack direction="column" sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', mb: 4}}>
        <img src="/public/assets/TerminPilot.png" alt="TerminPilot Logo" style={{ width: mobile ? 300 : 400, textAlign: 'center' }} />
        <Typography variant={mobile ? 'h4' : 'h3'} component="h1" sx={{ mt: 0 }}>
          TerminPilot
        </Typography>
      </Stack>
      <Stack
        component="form"
        onSubmit={(submit) => {
          submit.preventDefault()
          handleLoginSubmit()
            .then(() => navigate('/home', { replace: true }));
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

        <TextFieldWithIcon
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
          loading={submitting}
        >
          Einloggen
        </Button>
      </Stack>
    </Container>
  );
}
