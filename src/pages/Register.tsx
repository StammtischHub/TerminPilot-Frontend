import { useState } from 'react';
import { Alert, Button, Link, Stack, Typography } from '@mui/material';
import { PersonAddAlt1 as RegisterIcon, PersonOutlined } from '@mui/icons-material';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext.tsx';
import AuthLayout from '../components/AuthLayout.tsx';
import PasswordTextField from '../components/text-field/PasswordTextField.tsx';
import IconTextField from '../components/text-field/IconTextField.tsx';
import { useSafeSubmit } from '../hooks/useSafeSubmit.ts';
import { validatePassword, validatePasswordConfirmation, validateUsername } from '../utils/Validation.ts';

type Field = 'username' | 'password' | 'passwordConfirmation';
type FieldErrors = Record<Field, string | undefined>;

function validate(username: string, password: string, passwordConfirmation: string): FieldErrors {
  return {
    username: validateUsername(username),
    password: validatePassword(password),
    passwordConfirmation: validatePasswordConfirmation(password, passwordConfirmation),
  };
}

const ALL_TOUCHED: Record<Field, boolean> = {
  username: true,
  password: true,
  passwordConfirmation: true,
};

export default function Register() {
  const navigate = useNavigate();

  const { register, user, isLoading } = useAuth();
  const { submit, isSubmitting, error } = useSafeSubmit();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});

  if (isLoading) return null;
  if (user) return <Navigate to="/home" replace />;

  // Fehler werden bei jedem Render aus den aktuellen Werten abgeleitet, nicht im State gehalten.
  const errors = validate(username, password, passwordConfirmation);
  const formValid = Object.values(errors).every((fieldError) => fieldError === undefined);

  const shownError = (field: Field) => (touched[field] ? errors[field] : undefined);
  const touch = (field: Field) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = () => {
    if (!formValid) {
      setTouched(ALL_TOUCHED);
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
          onBlur={touch('username')}
          error={Boolean(shownError('username'))}
          helperText={shownError('username') ?? '3–50 Zeichen'}
        />

        <PasswordTextField
          id="password-input"
          label="Passwort"
          placeholder="Passwort"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onBlur={touch('password')}
          error={Boolean(shownError('password'))}
          helperText={shownError('password') ?? 'Mindestens 12 Zeichen'}
        />

        <PasswordTextField
          id="password-confirm-input"
          label="Passwort bestätigen"
          placeholder="Passwort wiederholen"
          autoComplete="new-password"
          required
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          onBlur={touch('passwordConfirmation')}
          error={Boolean(shownError('passwordConfirmation'))}
          helperText={shownError('passwordConfirmation')}
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
        >
          Konto erstellen
        </Button>
      </Stack>
    </AuthLayout>
  );
}
