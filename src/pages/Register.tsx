import { useState } from 'react';
import { Alert, Button, Container, Link, Stack, Typography, useMediaQuery } from '@mui/material';
import { PersonAddAlt1 as RegisterIcon, PersonOutlined } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext.tsx';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router';
import { isMobile } from '../utils/ThemeHelpers.ts';
import PasswordTextField from '../components/text-field/PasswordTextField.tsx';
import IconTextField from '../components/text-field/IconTextField.tsx';
import { useSafeSubmit } from '../hooks/useSafeSubmit.ts';

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export default function Register() {
  const mobile = useMediaQuery(isMobile);
  const navigate = useNavigate();

  const { register, user, isLoading } = useAuth();
  const { submit, isSubmitting, error, setError } = useSafeSubmit();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
    passwordConfirmation?: string;
  }>({});

  if (isLoading) return null;
  if (user) return <Navigate to="/home" replace />;

  const validateUsername = () => {
    if (username.length < 3) {
      setFieldErrors({
        ...fieldErrors,
        username: 'Der Benutzername muss mindesten 3 Zeichen lang sein.',
      });
    } else if (username.length > 50) {
      setFieldErrors({
        ...fieldErrors,
        username: 'Der Benutzername darf maximal 50 Zeichen lang sein.',
      });
    } else if (!USERNAME_PATTERN.test(username)) {
      setFieldErrors({ ...fieldErrors, username: 'Erlaubt sind Buchstaben, Zahlen sowie . _ -' });
    } else if (fieldErrors.username) {
      setFieldErrors({ ...fieldErrors, username: undefined });
    }
    return Object.keys(fieldErrors).length === 0;
  };

  const validatePassword = () => {
    if (password.length < 12) {
      setFieldErrors({
        ...fieldErrors,
        password: 'Das Passwort muss mindestens 12 Zeichen lang sein.',
      });
    } else if (password.length > 72) {
      setFieldErrors({
        ...fieldErrors,
        password: 'Das Passwort darf maximal 72 Zeichen lang sein.',
      });
    } else if (fieldErrors.password) {
      setFieldErrors({ ...fieldErrors, password: undefined });
    }
    return Object.keys(fieldErrors).length === 0;
  };

  const validatePasswordConfirmation = () => {
    if (passwordConfirmation !== password) {
      setFieldErrors({
        ...fieldErrors,
        passwordConfirmation: 'Die Passwörter stimmen nicht überein.',
      });
    } else if (fieldErrors.passwordConfirmation) {
      setFieldErrors({ ...fieldErrors, passwordConfirmation: undefined });
    }
    return Object.keys(fieldErrors).length === 0;
  };

  const formValid = Object.values(fieldErrors).every((value) => value === undefined);

  const handleSubmit = () => {
    if (!formValid) {
      setError('Nicht alle Eingabefelder sind korrekt ausgefüllt.');
      return;
    }
    return submit(() => register(username, password), {
      errorMessages: {
        400: 'Ungültige Registrierungsdaten wurden übermittelt.',
        409: 'Dieser Benutzername ist bereits vergeben.',
      },
      onSuccess: () => navigate('/home', { replace: true }),
    });
  };

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
        style={{ width: mobile ? 300 : 450 }}
      />
      <Typography variant={mobile ? 'h4' : 'h2'} component="h1" sx={{ mt: 0, mb: 4 }}>
        TerminPilot
      </Typography>
      <Stack
        component="form"
        onSubmit={async (submit) => {
          submit.preventDefault();
          await handleSubmit();
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
          onBlur={() => validateUsername()}
          error={Boolean(fieldErrors.username)}
          helperText={fieldErrors.username ?? '3–50 Zeichen'}
        />

        <PasswordTextField
          id="password-input"
          label="Passwort"
          placeholder="Passwort"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={() => validatePassword()}
          error={Boolean(fieldErrors.password)}
          helperText={fieldErrors.password ?? 'Mindestens 12 Zeichen'}
        />

        <PasswordTextField
          id="password-confirm-input"
          label="Passwort bestätigen"
          placeholder="Passwort wiederholen"
          autoComplete="new-password"
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          onBlur={() => validatePasswordConfirmation()}
          error={Boolean(fieldErrors.passwordConfirmation)}
          helperText={fieldErrors.passwordConfirmation ?? ''}
        />

        <Typography component="p" variant="body2">
          Schon registriert?{' '}
          <Link component={RouterLink} to="/login" underline="always">
            Zum Login
          </Link>
        </Typography>

        <Button
          type="submit"
          variant="contained"
          sx={{ width: '80%' }}
          startIcon={<RegisterIcon />}
          loading={isSubmitting}
          disabled={!formValid}
        >
          Konto erstellen
        </Button>
      </Stack>
    </Container>
  );
}
