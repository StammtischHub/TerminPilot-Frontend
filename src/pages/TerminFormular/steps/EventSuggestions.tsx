import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Paper,
  Radio,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { AccessTime, EventAvailable, EventBusy } from '@mui/icons-material';
import { Temporal } from 'temporal-polyfill';
import { useFormWizard } from '../FormWizardContext.tsx';
import { steps, WIZARD_BASE_PATH } from '../steps.config.ts';
import { generateSeparateStyle } from '../../../utils/ThemeHelpers.ts';
import { api } from '../../../api/client.ts';
import type { Schema } from '../../../api/types.ts';

type Suggestion = Schema<'Suggestion'>;

type EventProposal = {
  id: string;
  start: Temporal.PlainDateTime;
  end: Temporal.PlainDateTime;
};

const UNKNOWN_ERROR = 'Unbekannter Fehler. Bitte versuche es erneut.';
const NETWORK_ERROR = 'Das System kann nicht erreicht werden. Bitte versuche es später erneut.';
const PARSE_ERROR = 'Die Terminvorschläge konnten nicht verarbeitet werden.';

const ERROR_MESSAGES: Partial<Record<number, string>> = {
  400: 'Die Rahmenbedingungen sind ungültig. Bitte überprüfe deine Angaben.',
  404: 'Mindestens einer der ausgewählten Teilnehmer existiert nicht mehr.',
  422: 'Die gewählte Dauer passt nicht in den Zeitrahmen. Bitte Rahmenbedingungen anpassen.',
  502: 'Kalenderzugriff für mindestens einen Teilnehmer ist fehlgeschlagen. Bitte später erneut versuchen.',
  504: 'Zeitüberschreitung beim Abrufen eines Teilnehmerkalenders. Bitte erneut versuchen.',
};

/** Endet der String auf "Z" oder einen Offset (optional gefolgt von "[Zeitzone]")? */
const HAS_OFFSET_PATTERN = /(?:[zZ]|[+-]\d{2}:?\d{2})(?:\[[^\]]+\])?$/;

/**
 * Wandelt einen Zeitstempel aus dem Backend in eine lokale PlainDateTime um.
 * - Mit Offset oder "Z" (Instant, OffsetDateTime, ZonedDateTime): in die Zeitzone des Browsers
 *   umrechnen. PlainDateTime.from würde bei "Z" werfen und einen Offset stillschweigend ignorieren.
 * - Ohne Offset (LocalDateTime): direkt übernehmen.
 */
function toLocalDateTime(value: string): Temporal.PlainDateTime {
  if (HAS_OFFSET_PATTERN.test(value)) {
    return Temporal.Instant.from(value)
      .toZonedDateTimeISO(Temporal.Now.timeZoneId())
      .toPlainDateTime();
  }
  return Temporal.PlainDateTime.from(value);
}

function toProposals(suggestions: Suggestion[]): EventProposal[] {
  return suggestions.map((suggestion, index) => ({
    id: String(index),
    start: toLocalDateTime(suggestion.start),
    end: toLocalDateTime(suggestion.end),
  }));
}

export function EventSuggestions() {
  const { data, updateStep, visitStep } = useFormWizard();
  const navigate = useNavigate();

  const [proposals, setProposals] = useState<EventProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    visitStep('event-suggestions');
  }, [visitStep]);

  const { constraints } = data;
  const participants = data.event.users;

  useEffect(() => {
    const controller = new AbortController();

    api
      .POST('/api/events/suggestions', {
        body: {
          constraints: {
            weekdays: constraints.weekdays,
            dateRange: {
              start: constraints.datePeriod.start.toString(),
              end: constraints.datePeriod.end.toString(),
            },
            timeRange: {
              start: constraints.timePeriod.start.toString({ smallestUnit: 'minute' }),
              end: constraints.timePeriod.end.toString({ smallestUnit: 'minute' }),
            },
            durationMinutes: constraints.durationInMinutes,
          },
          participants: participants.map((user) => user.id),
        },
        signal: controller.signal,
      })
      .then(({ data: body, response }) => {
        if (!response.ok) {
          setLoadError(ERROR_MESSAGES[response.status] ?? UNKNOWN_ERROR);
          return;
        }

        try {
          setProposals(toProposals(body?.suggestions ?? []));
          setLoadError(null);
        } catch (parseError) {
          console.error('Terminvorschläge konnten nicht geparst werden:', parseError, body);
          setLoadError(PARSE_ERROR);
        }
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        console.error('Terminvorschläge konnten nicht geladen werden:', requestError);
        setLoadError(NETWORK_ERROR);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [constraints, participants]);

  const groupedProposals = useMemo(() => {
    const groups = new Map<string, EventProposal[]>();
    proposals.forEach((proposal) => {
      const key = proposal.start.toPlainDate().toString();
      groups.set(key, [...(groups.get(key) ?? []), proposal]);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [proposals]);

  const selectedProposal = proposals.find((proposal) => proposal.id === selectedId) ?? null;

  const currentStepIndex = steps.findIndex((step) => step.path === 'event-suggestions');
  const previousStep = steps[currentStepIndex - 1];
  const nextStep = steps[currentStepIndex + 1];

  const handleConfirm = () => {
    if (!selectedProposal || !nextStep) return;
    updateStep('event', { begin: selectedProposal.start, end: selectedProposal.end });
    navigate(`${WIZARD_BASE_PATH}/${nextStep.path}`);
  };

  const subtitle = () => {
    if (isLoading) return 'Suche nach passenden Terminen …';
    if (loadError) return 'Die Suche ist fehlgeschlagen.';
    const count = proposals.length;
    return `${count} passende ${count === 1 ? 'Termin' : 'Termine'} gefunden · wähle einen aus`;
  };

  const renderProposals = () => {
    if (isLoading) {
      return Array.from({ length: 4 }).map((_, index) => (
        <ListItem key={index} sx={{ py: 1 }}>
          <Skeleton variant="rounded" width="100%" height={56} />
        </ListItem>
      ));
    }

    // Bei einem Fehler zeigt das Alert oberhalb der Liste bereits alles Nötige.
    if (loadError) return null;

    if (groupedProposals.length === 0) {
      return (
        <ListItem sx={{ py: 4 }}>
          <Stack spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
            <EventBusy color="disabled" fontSize="large" />
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Keine passenden Terminvorschläge gefunden.
              <br />
              Passe deine Rahmenbedingungen an und versuche es erneut.
            </Typography>
          </Stack>
        </ListItem>
      );
    }

    return groupedProposals.map(([dateKey, proposalsOfDay], groupIndex) => (
      <Box key={dateKey}>
        <ListSubheader
          disableSticky
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontSize: 12,
            lineHeight: 'normal',
            pl: 0,
            mt: groupIndex === 0 ? 0 : 3,
            mb: 0.5,
          }}
        >
          {proposalsOfDay[0].start.toPlainDate().toLocaleString('de-DE', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </ListSubheader>

        <Stack spacing={1}>
          {proposalsOfDay.map((proposal) => {
            const isSelected = proposal.id === selectedId;
            const durationMinutes = proposal.start.until(proposal.end, {
              largestUnit: 'minutes',
            }).minutes;
            const startTime = proposal.start.toPlainTime().toString({ smallestUnit: 'minute' });
            const endTime = proposal.end.toPlainTime().toString({ smallestUnit: 'minute' });

            return (
              <ListItem
                key={proposal.id}
                disablePadding
                secondaryAction={
                  <Radio
                    checked={isSelected}
                    onChange={() => setSelectedId(proposal.id)}
                    value={proposal.id}
                    name="event-proposal"
                    slotProps={{
                      input: { 'aria-label': `Vorschlag ${proposal.start.toString()} auswählen` },
                    }}
                  />
                }
                sx={{
                  border: '2px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  bgcolor: isSelected ? 'action.selected' : 'transparent',
                  transition: 'border-color 0.15s ease, background-color 0.15s ease',
                }}
              >
                <ListItemButton onClick={() => setSelectedId(proposal.id)} sx={{ borderRadius: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <AccessTime color={isSelected ? 'primary' : 'action'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${startTime} – ${endTime} Uhr`}
                    secondary={`${durationMinutes} Min.`}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </Stack>
      </Box>
    ));
  };

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', marginY: 3 }}>
      <Paper
        elevation={4}
        sx={{
          width: generateSeparateStyle('80%', '60%'),
          maxHeight: 'calc(100dvh - 220px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          p: 4,
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <Typography variant="overline" color="text.secondary">
            Neuer Termin
          </Typography>
          <Typography variant="h4">Terminvorschlag wählen</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle()}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {loadError && (
          <Alert severity="error" sx={{ mb: 2, flexShrink: 0 }}>
            {loadError}
          </Alert>
        )}

        <List
          sx={{
            bgcolor: 'background.paper',
            width: '100%',
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            py: 0,
            mt: 0,
          }}
        >
          {renderProposals()}
        </List>
      </Paper>

      <Stack direction="row" spacing={2}>
        {previousStep && (
          <Button
            variant="outlined"
            onClick={() => navigate(`${WIZARD_BASE_PATH}/${previousStep.path}`)}
          >
            Zurück
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<EventAvailable />}
          disabled={!selectedProposal}
          onClick={handleConfirm}
        >
          Terminvorschlag wählen
        </Button>
      </Stack>
    </Stack>
  );
}
