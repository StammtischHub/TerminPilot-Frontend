import { useState } from 'react';
import { Alert, Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { Lock, LockReset, ManageAccounts, PersonOutlined, Save } from '@mui/icons-material';
import AppBarsWrapper from '../components/AppBarsWrapper.tsx';
import FeedbackSnackbar, { type Feedback } from '../components/FeedbackSnackbar.tsx';
import SectionHeader from '../components/SectionHeader.tsx';
import IconTextField from '../components/text-field/IconTextField.tsx';
import PasswordTextField from '../components/text-field/PasswordTextField.tsx';
import { generateSeparateStyle } from '../utils/ThemeHelpers.ts';
import {
  validatePassword,
  validatePasswordConfirmation,
  validateUsername,
} from '../utils/Validation.ts';
import { api } from '../api/client.ts';
import type { Schema } from '../api/types.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import { useAuthedUser } from '../auth/useAuthedUser.ts';
import { useSafeSubmit } from '../hooks/useSafeSubmit.ts';

type UserResponse = Schema<'UserResponse'>;

interface SectionProps {
  user: UserResponse;
  onSuccess: (message: string) => void;
}

export default function AccountSettingsPage() {
  const user = useAuthedUser();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const showSuccess = (message: string) => setFeedback({ severity: 'success', message });

  return (
    <AppBarsWrapper>
      <Stack spacing={3} sx={{ alignItems: 'center', marginY: 3 }}>
        <Paper elevation={4} sx={{ width: generateSeparateStyle('80%', '60%'), p: 4 }}>
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="overline" color="text.secondary">
              Konto
            </Typography>
            <Typography variant="h4">Einstellungen</Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <UsernameSection user={user} onSuccess={showSuccess} />

          <Divider sx={{ my: 4 }} />

          <PasswordSection user={user} onSuccess={showSuccess} />
        </Paper>
      </Stack>

      <FeedbackSnackbar feedback={feedback} onClose={() => setFeedback(null)} />
    </AppBarsWrapper>
  );
}

function UsernameSection({ user, onSuccess }: SectionProps) {
  const { updateUser } = useAuth();
  const { submit, isSubmitting, error } = useSafeSubmit();

  const [username, setUsername] = useState(user.username);
  const [touched, setTouched] = useState(false);

  const validationError = validateUsername(username);
  const shownError = touched ? validationError : undefined;
  const isUnchanged = username === user.username;

  const handleSubmit = () => {
    if (validationError) {
      setTouched(true);
      return;
    }
    return submit(
      async () => {
        const { data, response } = await api.PATCH('/api/users/{user-id}/username', {
          params: { path: { 'user-id': user.id } },
          body: { username },
        });
        if (data && response.ok) updateUser(data);
        return response;
      },
      {
        errorMessages: {
          400: 'Ungültiger Benutzername.',
          409: 'Dieser Benutzername ist bereits vergeben.',
        },
        onSuccess: () => {
          setTouched(false);
          onSuccess('Dein Benutzername wurde geändert.');
        },
      },
    );
  };

  return (
    <Stack
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isUnchanged) void handleSubmit();
      }}
      noValidate
      spacing={2}
    >
      <SectionHeader
        icon={<ManageAccounts color="action" fontSize="small" />}
        title="Benutzername"
      />

      {error && (
        <Alert severity="error" sx={{ width: '80%' }}>
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
        onBlur={() => setTouched(true)}
        error={Boolean(shownError)}
        helperText={shownError ?? '3–50 Zeichen'}
      />

      <Button
        type="submit"
        variant="contained"
        startIcon={<Save />}
        disabled={isUnchanged}
        loading={isSubmitting}
        sx={{ alignSelf: 'flex-end' }}
      >
        Benutzername speichern
      </Button>
    </Stack>
  );
}

type PasswordField = 'currentPassword' | 'newPassword' | 'newPasswordConfirmation';

function validatePasswordChange(
  currentPassword: string,
  newPassword: string,
  newPasswordConfirmation: string,
): Record<PasswordField, string | undefined> {
  return {
    currentPassword:
      currentPassword.length === 0 ? 'Bitte gib dein aktuelles Passwort ein.' : undefined,
    newPassword:
      validatePassword(newPassword) ??
      (newPassword === currentPassword
        ? 'Das neue Passwort muss sich vom aktuellen unterscheiden.'
        : undefined),
    newPasswordConfirmation: validatePasswordConfirmation(newPassword, newPasswordConfirmation),
  };
}

function PasswordSection({ user, onSuccess }: SectionProps) {
  const { submit, isSubmitting, error } = useSafeSubmit();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [touched, setTouched] = useState<Partial<Record<PasswordField, boolean>>>({});

  const errors = validatePasswordChange(currentPassword, newPassword, newPasswordConfirmation);
  const formValid = Object.values(errors).every((fieldError) => fieldError === undefined);

  const shownError = (field: PasswordField) => (touched[field] ? errors[field] : undefined);
  const touch = (field: PasswordField) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setNewPasswordConfirmation('');
    setTouched({});
  };

  const handleSubmit = () => {
    if (!formValid) return;

    return submit(
      async () =>
        (
          await api.PATCH('/api/users/{user-id}/password', {
            params: { path: { 'user-id': user.id } },
            body: { oldPassword: currentPassword, newPassword },
          })
        ).response,
      {
        errorMessages: {
          400: 'Das neue Passwort erfüllt nicht die Anforderungen.',
          401: 'Das aktuelle Passwort ist falsch.',
        },
        onSuccess: () => {
          resetForm();
          onSuccess('Dein Passwort wurde geändert.');
        },
      },
    );
  };

  return (
    <Stack
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
      noValidate
      spacing={2}
    >
      <SectionHeader icon={<Lock color="action" fontSize="small" />} title="Passwort" />

      {/* Verstecktes Feld, damit Passwort-Manager wissen, zu welchem Konto das Passwort gehört. */}
      <input
        type="text"
        name="username"
        autoComplete="username"
        value={user.username}
        readOnly
        hidden
      />

      {error && (
        <Alert severity="error" sx={{ width: '80%' }}>
          {error}
        </Alert>
      )}

      <PasswordTextField
        id="current-password-input"
        label="Aktuelles Passwort"
        placeholder="Aktuelles Passwort"
        autoComplete="current-password"
        required
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
        onBlur={touch('currentPassword')}
        error={Boolean(shownError('currentPassword'))}
        helperText={shownError('currentPassword')}
      />

      <PasswordTextField
        id="new-password-input"
        label="Neues Passwort"
        placeholder="Neues Passwort"
        autoComplete="new-password"
        required
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        onBlur={touch('newPassword')}
        error={Boolean(shownError('newPassword'))}
        helperText={shownError('newPassword') ?? 'Mindestens 12 Zeichen'}
      />

      <PasswordTextField
        id="new-password-confirm-input"
        label="Neues Passwort bestätigen"
        placeholder="Neues Passwort wiederholen"
        autoComplete="new-password"
        required
        value={newPasswordConfirmation}
        onChange={(event) => setNewPasswordConfirmation(event.target.value)}
        onBlur={touch('newPasswordConfirmation')}
        error={Boolean(shownError('newPasswordConfirmation'))}
        helperText={shownError('newPasswordConfirmation')}
      />

      <Button
        type="submit"
        variant="contained"
        startIcon={<LockReset />}
        loading={isSubmitting}
        disabled={!formValid}
        sx={{ alignSelf: 'flex-end' }}
      >
        Passwort ändern
      </Button>
    </Stack>
  );
}
