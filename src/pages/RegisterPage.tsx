import { useState, type FormEvent } from 'react';
import { Alert, Button, Container, Link, Stack, Typography, useMediaQuery } from '@mui/material';
import {PersonAddAlt1 as RegisterIcon, PersonOutlined} from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext.tsx';
import { ApiError } from '../api/client.ts';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router';
import { isMobile } from '../utils/ThemeHelpers.ts';
import PasswordTextField from '../components/textFields/PasswordTextField.tsx';
import TextFieldWithIcon from "../components/textFields/TextFieldWithIcon.tsx";

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export default function RegisterPage() {
  const mobile = useMediaQuery(isMobile);
  const { register, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
    passwordConfirm?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return null;
  if (user) return <Navigate to="/home" replace />;

  // Spiegelt die Contract-Constraints (RegisterRequest) clientseitig
  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (username.length < 3 || username.length > 50) {
      errors.username = 'Der Benutzername muss 3–50 Zeichen lang sein.';
    } else if (!USERNAME_PATTERN.test(username)) {
      errors.username = 'Erlaubt sind Buchstaben, Zahlen sowie . _ -';
    }
    if (password.length < 12 || password.length > 72) {
      errors.password = 'Das Passwort muss 12–72 Zeichen lang sein.';
    }
    if (passwordConfirm !== password) {
      errors.passwordConfirm = 'Die Passwörter stimmen nicht überein.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(username, password); // registriert + loggt automatisch ein
      navigate('/home', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Dieser Benutzername ist bereits vergeben.');
      } else if (err instanceof ApiError && err.status === 400) {
        setError(
          'Die Eingaben wurden vom Server abgelehnt. Bitte prüfe die Hinweise an den Feldern.',
        );
      } else {
        setError('Registrierung fehlgeschlagen. Bitte versuche es später erneut.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{ height: '100dvh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Stack
        component="form"
        onSubmit={handleSubmit}
        noValidate
        direction="column"
        spacing={2.5}
        sx={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}
      >
        <Typography variant={mobile ? 'h3' : 'h1'} component="h1">
          TerminPilot
        </Typography>

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
          error={Boolean(fieldErrors.username)}
          helperText={fieldErrors.username ?? '3–50 Zeichen'}
        />

        <PasswordTextField
          id="password-input"
          label="Passwort"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={Boolean(fieldErrors.password)}
          helperText={fieldErrors.password ?? 'Mindestens 12 Zeichen'}
        />

        <PasswordTextField
          id="password-confirm-input"
          label="Passwort bestätigen"
          placeholder="Passwort wiederholen"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          error={Boolean(fieldErrors.passwordConfirm)}
          helperText={fieldErrors.passwordConfirm ?? ''}
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
        >
          Konto erstellen
        </Button>
      </Stack>
    </Container>
  );
}
