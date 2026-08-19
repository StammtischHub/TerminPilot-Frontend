import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useFormWizard } from '../FormWizardContext';
import { steps, WIZARD_BASE_PATH } from '../steps.config';
import {
  Box,
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
  Typography,
} from '@mui/material';
import { generateSeparateStyle } from '../../../utils/ThemeHelpers.ts';
import { api } from '../../../api/client.ts';
import type { Schema } from '../../../api/types.ts';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

type Suggestion = Schema<'Suggestion'>;

type EventProposal = {
  id: string;
  start: Temporal.PlainDateTime;
  end: Temporal.PlainDateTime;
};

export function EventSuggestions() {
  const { data, updateStep, visitStep } = useFormWizard();
  const navigate = useNavigate();

  const [proposals, setProposals] = useState<EventProposal[]>([{
    id: '1',
    start: Temporal.PlainDateTime.from('2024-01-01T17:00:00'),
    end: Temporal.PlainDateTime.from('2024-01-01T18:00:00'),
  },
    {
      id: '2',
      start: Temporal.PlainDateTime.from('2024-01-02T17:00:00'),
      end: Temporal.PlainDateTime.from('2024-01-02T18:00:00'),
    }]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    visitStep('event-suggestions');
  }, [visitStep]);

  useEffect(() => {
    api
      .POST('/api/events/suggestions', {
        body: {
          constraints: {
            weekdays: data.constraints.weekdays,
            dateRange: {
              start: data.constraints.datePeriod.start.toString(),
              end: data.constraints.datePeriod.end.toString(),
            },
            timeRange: {
              start: data.constraints.timePeriod.start.toString(),
              end: data.constraints.timePeriod.end.toString(),
            },
            durationMinutes: data.constraints.durationInMinutes
          },
          participants: data.event.users.map((user) => user.id),
        },
      })
      .then(({ data }) => {
        const mapped: EventProposal[] = (data?.suggestions ?? []).map(
          (suggestion: Suggestion, index: number) => ({
            id: String(index),
            start: Temporal.PlainDateTime.from(suggestion.start),
            end: Temporal.PlainDateTime.from(suggestion.end),
          }),
        );
        setProposals(mapped);
      })
      .finally(() => setIsLoading(false));
  }, [data]);

  const groupedProposals = useMemo(() => {
    const groups = new Map<string, EventProposal[]>();
    proposals.forEach((proposal) => {
      const key = proposal.start.toString().split('T')[0];
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

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', marginY: 3 }}>
      <Paper
        elevation={4}
        sx={{
          width: generateSeparateStyle('80%', '60%'),
          maxHeight: 'calc(100vh - 220px)',
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
          <Typography variant="h4">
            Terminvorschlag wählen
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isLoading
              ? 'Suche nach passenden Terminen …'
              : `${proposals.length} passende ${proposals.length === 1 ? 'Termin' : 'Termine'} gefunden · wähle einen aus`}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

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
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <Skeleton variant="rounded" width="100%" height={56} />
              </ListItem>
            ))
          ) : groupedProposals.length === 0 ? (
            <ListItem sx={{ py: 4 }}>
              <Stack spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
                <EventBusyIcon color="disabled" fontSize="large" />
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Keine passenden Terminvorschläge gefunden.
                  <br />
                  Passe deine Rahmenbedingungen an und versuche es erneut.
                </Typography>
              </Stack>
            </ListItem>
          ) : (
            groupedProposals.map(([dateKey, proposalsOfDay], groupIndex) => (
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
                  {proposalsOfDay[0].start.toString()}
                </ListSubheader>

                <Stack spacing={1}>
                  {proposalsOfDay.map((proposal) => {
                    const isSelected = proposal.id === selectedId;
                    const durationMinutes = proposal.start.until(proposal.end, { largestUnit: 'minutes' }).minutes;

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
                              input: {
                                'aria-label': `Vorschlag ${proposal.start.toString()} auswählen`,
                              },
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
                            <AccessTimeIcon color={isSelected ? 'primary' : 'action'} />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${proposal.start.toString().split('T')[1].slice(0, 5)} – ${proposal.end.toString().split('T')[1].slice(0, 5)} Uhr`}
                            secondary={`${durationMinutes} Min.`}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </Stack>
              </Box>
            ))
          )}
        </List>
      </Paper>

      <Stack direction="row" spacing={2}>
        {previousStep && (
          <Button variant="outlined" onClick={() => navigate(`${WIZARD_BASE_PATH}/${previousStep.path}`)}>
            Zurück
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<EventAvailableIcon />}
          disabled={!selectedProposal}
          onClick={handleConfirm}
        >
          Terminvorschlag wählen
        </Button>
      </Stack>
    </Stack>
  );
}
