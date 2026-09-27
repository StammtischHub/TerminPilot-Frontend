import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import {steps, WIZARD_BASE_PATH} from "../steps.config.ts";
import {useFormWizard} from "../FormWizardContext.tsx";
import {useEffect} from "react";
import type {ReactNode} from "react";
import {useNavigate} from "react-router";
import {generateSeparateStyle} from "../../../utils/ThemeHelpers.ts";
import {Alert, Box, Chip, CircularProgress, Divider, Paper, Typography} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotesIcon from "@mui/icons-material/Notes";
import GroupIcon from "@mui/icons-material/Group";
import {useAuthedUser} from "../../../auth/useAuthedUser.ts";
import {api} from "../../../api/client.ts";
import type {Schema} from "../../../api/types.ts";
import {useSafeSubmit} from "../../../hooks/useSafeSubmit.ts";

type CreateEventRequest = Schema<'CreateEventRequest'>;

function OverviewRow({icon, label, children}: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
      <Box sx={{ color: "text.secondary", mt: "2px" }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          {label}
        </Typography>
        <Box sx={{ mt: 0.5 }}>{children}</Box>
      </Box>
    </Stack>
  );
}

export function Overview() {
  const { data, visitedSteps, visitStep, reset } = useFormWizard();
  const { id } = useAuthedUser();
  const navigate = useNavigate();
  const { submit, isSubmitting, error } = useSafeSubmit();

  const beginDatePlain = data.event.begin.toPlainDate();
  const endDatePlain = data.event.end.toPlainDate();
  const beginDate = beginDatePlain.toString();
  const endDate = endDatePlain.equals(beginDatePlain) ? null : endDatePlain.toString();

  const beginTime = data.event.begin.toPlainTime().toString({ smallestUnit: 'minute' });
  const endTime = data.event.end.toPlainTime().toString({ smallestUnit: 'minute' });

  useEffect(() => {
    visitStep('overview');
  }, [visitStep]);

  const currentStepIndex = steps.findIndex((step) => step.path === 'overview');
  const previousStep = steps.findLast((step, index) => index < currentStepIndex && visitedSteps.includes(step.path));

  const tz = Temporal.Now.timeZoneId();

  const handleSubmit = () => {
    const body: CreateEventRequest = {
      title: data.event.title,
      start: data.event.begin
        .toZonedDateTime(tz)
        .toString({ smallestUnit: 'second', timeZoneName: 'never' }),
      end: data.event.end
        .toZonedDateTime(tz)
        .toString({ smallestUnit: 'second', timeZoneName: 'never' }),
      location: data.event.location || undefined,
      notes: data.event.notes || undefined,
      participants: data.event.users.map((user) => user.id),
    };

    return submit(
      () => api.POST('/api/events', { body }).then(({ response }) => response),
      {
        errorMessages: {
          400: 'Die eingegebenen Daten sind ungültig. Bitte überprüfe deine Angaben.',
          401: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.',
          404: 'Mindestens einer der ausgewählten Teilnehmer existiert nicht mehr.',
          422: 'Der gewählte Zeitraum ist nicht gültig (Ende muss nach dem Start liegen).',
          502: 'Kalenderzugriff für mindestens einen Teilnehmer ist fehlgeschlagen. Bitte später erneut versuchen.',
          504: 'Zeitüberschreitung beim Abrufen eines Teilnehmerkalenders. Bitte erneut versuchen.',
        },
        onSuccess: () => {
          reset();
          navigate('/');
        },
      },
    );
  };

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', marginY: 3 }}>
      <Paper elevation={4} sx={{ width: generateSeparateStyle('80%', '60%'), p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Terminübersicht
            </Typography>
            <Typography variant="h4">
              {data.event.title || "Ohne Titel"}
            </Typography>
          </Box>

          <Divider />

          <OverviewRow icon={<EventIcon />} label="Datum">
            <Typography variant="body1">
              {beginDate}{endDate ? ` – ${endDate}` : ''}
            </Typography>
          </OverviewRow>

          <OverviewRow icon={<AccessTimeIcon />} label="Uhrzeit">
            <Typography variant="body1">
              {beginTime} – {endTime} Uhr
            </Typography>
          </OverviewRow>

          {data.event.location && (
            <OverviewRow icon={<LocationOnIcon />} label="Ort">
              <Typography variant="body1">{data.event.location}</Typography>
            </OverviewRow>
          )}

          {data.event.notes && (
            <OverviewRow icon={<NotesIcon />} label="Notizen">
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {data.event.notes}
              </Typography>
            </OverviewRow>
          )}

          <OverviewRow icon={<GroupIcon />} label={`Teilnehmer (${data.event.users.length})`}>
            {data.event.users.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {data.event.users.map((checkedUser) => (
                  <Chip key={checkedUser.id} label={checkedUser.id === id ? `${checkedUser.name} (Du)` : checkedUser.name} size="small" />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Keine Teilnehmer ausgewählt
              </Typography>
            )}
          </OverviewRow>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ width: generateSeparateStyle('80%', '60%') }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2}>
        {previousStep && (
          <Button
            variant="outlined"
            disabled={isSubmitting}
            onClick={() => navigate(`${WIZARD_BASE_PATH}/${previousStep.path}`)}
          >
            Zurück
          </Button>
        )}
        <Button
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          onClick={handleSubmit}
        >
          Termine einstellen
        </Button>
      </Stack>
    </Stack>
  );
}
