import { useState } from 'react';
import { Alert, Button, Link, Stack, Typography } from '@mui/material';
import { Login as LoginIcon, PersonOutlined } from '@mui/icons-material';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext.tsx';
import AuthLayout from '../components/AuthLayout.tsx';
import PasswordTextField from '../components/text-field/PasswordTextField.tsx';
import IconTextField from '../components/text-field/IconTextField.tsx';
import { useSafeSubmit } from '../hooks/useSafeSubmit.ts';

export default function Login() {
  const navigate = useNavigate();

  const { login, user, isLoading } = useAuth();
  const { submit, isSubmitting, error } = useSafeSubmit();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (isLoading) return null;
  if (user) return <Navigate to="/home" replace />;

  const formValid = username && password;

  const handleSubmit = () => {
    if (!formValid) return;

    return submit(() => login(username, password), {
      errorMessages: { 401: 'Die Kombination aus Benutzername und Passwort ist falsch.' },
      onSuccess: () => navigate('/home', { replace: true }),
    });
  }

  return (
    <AuthLayout>
      <Stack
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
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
          onChange={(event) => setPassword(event.target.value)}
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
          disabled={!formValid}
          loading={isSubmitting}
        >
          Einloggen
        </Button>
      </Stack>
    </AuthLayout>
  );
}
