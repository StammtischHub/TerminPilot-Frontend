import { useState } from 'react';
import { Alert, Button, Container, Link, Stack, Typography, useMediaQuery } from '@mui/material';
import { PersonAddAlt1 as RegisterIcon, PersonOutlined } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext.tsx';
import { ApiError } from '../api/client.ts';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router';
import { isMobile } from '../utils/ThemeHelpers.ts';
import PasswordTextField from '../components/text-field/PasswordTextField.tsx';
import TextFieldWithIcon from '../components/text-field/TextFieldWithIcon.tsx';

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export default function Register() {
  const mobile = useMediaQuery(isMobile);
  const navigate = useNavigate();

  const { register, user, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
    passwordConfirmation?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleRegisterSubmit = async () => {
    setSubmitError(null);
    if (!formValid) {
      setSubmitError('Nicht alle Eingabefelder sind korrekt ausgefüllt.');
      return;
    }
    setSubmitting(true);
    await register(username, password)
      .then(() => navigate('/home', { replace: true }))
      .catch((error) => {
        if (!(error instanceof ApiError)) {
          setSubmitError(
            'Unbekannter Fehler bei der Registrierung. Bitte versuche es später erneut.',
          );
          return;
        }
        switch (error.status) {
          case 409: {
            setSubmitError('Dieser Benutzername ist bereits vergeben.');
            break;
          }
          default: {
            setSubmitError(
              'Unbekannter Fehler bei der Registrierung. Bitte versuche es später erneut.',
            );
          }
        }
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        height: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="column"
        sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', mb: 4 }}
      >
        <img
          src="/public/assets/TerminPilot.png"
          alt="TerminPilot Logo"
          style={{ width: mobile ? 300 : 400 }}
        />
        <Typography variant={mobile ? 'h4' : 'h3'} component="h1" sx={{ mt: 0 }}>
          TerminPilot
        </Typography>
      </Stack>
      <Stack
        component="form"
        onSubmit={async (submit) => {
          submit.preventDefault();
          await handleRegisterSubmit();
        }}
        noValidate
        direction="column"
        spacing={2}
        sx={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}
      >
        {submitError && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {submitError}
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
          loading={submitting}
          disabled={!formValid}
        >
          Konto erstellen
        </Button>
      </Stack>
    </Container>
  );
}
