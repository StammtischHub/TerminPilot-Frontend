import { useEffect, useState } from 'react';
import { Alert, Box, Button, Divider, Link, Paper, Stack, Typography } from '@mui/material';
import { AlternateEmail, CloudOutlined, EventAvailable, Google } from '@mui/icons-material';
import { useSearchParams } from 'react-router';
import AppBarsWrapper from '../components/AppBarsWrapper.tsx';
import FeedbackSnackbar, { type Feedback } from '../components/FeedbackSnackbar.tsx';
import SectionHeader from '../components/SectionHeader.tsx';
import IconTextField from '../components/text-field/IconTextField.tsx';
import PasswordTextField from '../components/text-field/PasswordTextField.tsx';
import { generateSeparateStyle } from '../utils/ThemeHelpers.ts';
import { useSafeSubmit } from '../hooks/useSafeSubmit.ts';

/** Query-Parameter, mit dem das Backend nach dem OAuth-Flow zurück auf diese Seite leitet. */
const GOOGLE_RESULT_PARAM = 'google';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APP_SPECIFIC_PASSWORD_PATTERN = /^[a-z]{4}-[a-z]{4}-[a-z]{4}-[a-z]{4}$/;

const GOOGLE_RESULT_FEEDBACK: Partial<Record<string, Feedback>> = {
  connected: { severity: 'success', message: 'Dein Google Kalender wurde erfolgreich verbunden.' },
  error: {
    severity: 'error',
    message: 'Die Verbindung mit Google ist fehlgeschlagen. Bitte versuche es erneut.',
  },
};

export default function CalendarSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const googleResult = searchParams.get(GOOGLE_RESULT_PARAM);
  const googleFeedback = googleResult ? GOOGLE_RESULT_FEEDBACK[googleResult] : undefined;
  const shownFeedback = feedback ?? googleFeedback ?? null;

  const closeFeedback = () => {
    setFeedback(null);
    if (googleResult) {
      setSearchParams(
        (prev) => {
          prev.delete(GOOGLE_RESULT_PARAM);
          return prev;
        },
        { replace: true },
      );
    }
  };

  return (
    <AppBarsWrapper>
      <Stack spacing={3} sx={{ alignItems: 'center', marginY: 3 }}>
        <Paper elevation={4} sx={{ width: generateSeparateStyle('80%', '60%'), p: 4 }}>
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="overline" color="text.secondary">
              Konto
            </Typography>
            <Typography variant="h4">Kalender verwalten</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Verbinde deine Kalender, damit TerminPilot deine freien Zeiten kennt und Termine für
              dich planen kann.
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <GoogleCalendarSection />

          <Divider sx={{ my: 4 }} />

          <CalDavSection />
        </Paper>
      </Stack>

      <FeedbackSnackbar feedback={shownFeedback} onClose={closeFeedback} autoHideDuration={6000} />
    </AppBarsWrapper>
  );
}

/**
 * OAuth-Autorisierung bei Google.
 *
 * Der Endpoint leitet per Redirect zur Google-Einwilligungsseite weiter. Das muss eine echte
 * Seitennavigation sein (Link mit href), kein fetch: fetch kann einem Redirect auf eine fremde
 * Domain nicht folgen (CORS), und Google zeigt seine Einwilligungsseite nur im Top-Level-Fenster.
 */
function GoogleCalendarSection() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Kommt der Nutzer per Zurück-Button von Google zurück, stellt der Browser die Seite evtl.
  // aus dem Back-Forward-Cache wieder her – inklusive Ladezustand. Den hier zurücksetzen.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setIsRedirecting(false);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  return (
    <Stack spacing={2}>
      <SectionHeader
        icon={<EventAvailable color="action" fontSize="small" />}
        title="Google Kalender"
      />

      <Typography variant="body2" color="text.secondary">
        Du wirst zu Google weitergeleitet und bestätigst dort, dass TerminPilot auf deinen Kalender
        zugreifen darf. Danach kommst du automatisch hierher zurück. Den Zugriff kannst du jederzeit
        in deinem Google-Konto unter „Drittanbieter-Apps und -Dienste" widerrufen.
      </Typography>

      <Button
        component="a"
        href={'/api/google/authorize'}
        variant="outlined"
        color="inherit"
        startIcon={<Google />}
        loading={isRedirecting}
        onClick={() => setIsRedirecting(true)}
        sx={{
          alignSelf: 'flex-start',
          textTransform: 'none',
          borderColor: 'divider',
          backgroundColor: 'background.default',
        }}
      >
        Mit Google verbinden
      </Button>
    </Stack>
  );
}

type CalDavField = 'icloudMail' | 'appSpecificPassword';

function validateCalDav(
  icloudMail: string,
  appSpecificPassword: string,
): Record<CalDavField, string | undefined> {
  return {
    icloudMail: EMAIL_PATTERN.test(icloudMail)
      ? undefined
      : 'Bitte gib eine gültige E-Mail-Adresse ein.',
    appSpecificPassword: APP_SPECIFIC_PASSWORD_PATTERN.test(appSpecificPassword)
      ? undefined
      : 'Das Passwort hat das Format xxxx-xxxx-xxxx-xxxx.',
  };
}

function CalDavSection() {
  const { isSubmitting, error } = useSafeSubmit();

  const [icloudMail, setIcloudMail] = useState('');
  const [appSpecificPassword, setAppSpecificPassword] = useState('');
  const [touched, setTouched] = useState<Partial<Record<CalDavField, boolean>>>({});

  const trimmedMail = icloudMail.trim();
  const trimmedPassword = appSpecificPassword.trim();

  const errors = validateCalDav(trimmedMail, trimmedPassword);
  const formValid = Object.values(errors).every((fieldError) => fieldError === undefined);

  const shownError = (field: CalDavField) => (touched[field] ? errors[field] : undefined);
  const touch = (field: CalDavField) => () => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = () => {
    if (!formValid) return;

    return;
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
      <SectionHeader
        icon={<CloudOutlined color="action" fontSize="small" />}
        title="iCloud Kalender"
      />

      <Typography variant="body2" color="text.secondary">
        Für iCloud brauchst du ein app-spezifisches Passwort, nicht dein normales Apple-Passwort. Du
        erstellst es unter{' '}
        <Link href="https://account.apple.com" target="_blank" rel="noopener noreferrer">
          account.apple.com
        </Link>{' '}
        im Bereich „Anmeldung und Sicherheit" → „App-spezifische Passwörter".
      </Typography>

      {error && (
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      )}

      <IconTextField
        id="icloud-mail-input"
        label="iCloud E-Mail"
        icon={<AlternateEmail fontSize="small" />}
        placeholder="name@icloud.com"
        type="email"
        autoComplete="email"
        required
        value={icloudMail}
        onChange={(event) => setIcloudMail(event.target.value)}
        onBlur={touch('icloudMail')}
        error={Boolean(shownError('icloudMail'))}
        helperText={shownError('icloudMail')}
      />

      <PasswordTextField
        id="app-specific-password-input"
        label="App-spezifisches Passwort"
        placeholder="xxxx-xxxx-xxxx-xxxx"
        autoComplete="off"
        required
        value={appSpecificPassword}
        onChange={(event) => setAppSpecificPassword(event.target.value)}
        onBlur={touch('appSpecificPassword')}
        error={Boolean(shownError('appSpecificPassword'))}
        helperText={shownError('appSpecificPassword') ?? 'Format: xxxx-xxxx-xxxx-xxxx'}
      />

      <Button
        type="submit"
        variant="contained"
        startIcon={<CloudOutlined />}
        disabled={!formValid}
        loading={isSubmitting}
        sx={{ alignSelf: 'flex-end' }}
      >
        iCloud verbinden
      </Button>
    </Stack>
  );
}
