import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useFormWizard } from '../FormWizardContext';
import { steps, WIZARD_BASE_PATH } from '../steps.config';
import { Box, Divider, Paper, TextField, Typography } from '@mui/material';
import { generateSeparateStyle } from '../../../utils/ThemeHelpers.ts';
import {DateTimePicker, renderTimeViewClock} from '@mui/x-date-pickers';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {TemporalPlainDateTimeProvider} from "mui-temporal-pickers";

export function EventData() {
  const { data, visitedSteps, updateStep, visitStep } = useFormWizard();
  const navigate = useNavigate();

  useEffect(() => {
    visitStep('event-data');
  }, [visitStep]);

  const [title, setTitle] = useState(data.event.title ?? '');
  const [beginDateTime, setBeginDateTime] = useState<Temporal.PlainDateTime>(
    data.event.begin
  );
  const [endDateTime, setEndDateTime] = useState<Temporal.PlainDateTime>(
    data.event.end
  );
  const [location, setLocation] = useState(data.event.location ?? '');
  const [notes, setNotes] = useState(data.event.notes ?? '');

  const dateTimeRangeValid = beginDateTime.until(endDateTime).total('minutes') > 0;

  const canProceed =
    dateTimeRangeValid && title.trim() !== '' && beginDateTime && endDateTime;

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateStep('event', { title: newTitle });
  };

  const handleBeginDateChange = (newBeginDate: Temporal.PlainDateTime | null) => {
    if (!newBeginDate) return;
    setBeginDateTime(newBeginDate);
    updateStep('event', { begin: newBeginDate });
  };

  const handleEndDateChange = (newEndDate: Temporal.PlainDateTime | null) => {
    if (!newEndDate) return;
    setEndDateTime(newEndDate);
    updateStep('event', { end: newEndDate });
  }

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    updateStep('event', { location: newLocation });
  }

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    updateStep('event', { notes: newNotes });
  }

  const currentStepIndex = steps.findIndex((step) => step.path === 'event-data');
  const previousStep = steps.findLast((step, index) => index < currentStepIndex && visitedSteps.includes(step.path));
  const nextStep = steps[currentStepIndex + 1];

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', marginY: 3 }}>
      <Paper elevation={4} sx={{ width: generateSeparateStyle('80%', '60%'), p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Neuer Termin
            </Typography>
            <Typography variant="h4">
              Termindetails
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Lege weitere Informationen zum Termin fest.
            </Typography>
          </Box>

          <Divider />

          <TextField
            id="title-input"
            label="Titel"
            required
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            variant="outlined"
            fullWidth
          />

          <Box>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center' }}>
              <EventIcon color="action" fontSize="small" />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Zeitraum
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TemporalPlainDateTimeProvider>
                <DateTimePicker
                  ampm={false}
                  label="Start"
                  key="begin-date-time-picker"
                  value={beginDateTime}
                  onChange={(newValue) => handleBeginDateChange(newValue)}
                  format="dd.MM.yyyy HH:mm"
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                    },
                  }}
                />
                <DateTimePicker
                  ampm={false}
                  label="Ende"
                  key="end-date-time-picker"
                  value={endDateTime}
                  onChange={(newValue) => handleEndDateChange(newValue)}
                  format="dd.MM.yyyy HH:mm"
                  minDate={beginDateTime}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                    seconds: renderTimeViewClock,
                  }}
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                    },
                  }}
                />
              </TemporalPlainDateTimeProvider>
            </Stack>
          </Box>

          <TextField
            id="location-input"
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <LocationOnIcon fontSize="small" sx={{ display: 'block' }} />
                <span>Ort</span>
              </Box>
            }
            value={location}
            onChange={(event) => handleLocationChange(event.target.value)}
            variant="outlined"
            fullWidth
          />

          <TextField
            id="notes-input"
            label="Notizen"
            multiline
            minRows={4}
            value={notes}
            onChange={(event) => handleNotesChange(event.target.value)}
            variant="outlined"
            fullWidth
          />
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          onClick={() => previousStep && navigate(`${WIZARD_BASE_PATH}/${previousStep.path}`)}
        >
          Zurück
        </Button>
        <Button
          variant="contained"
          disabled={!canProceed}
          onClick={() => nextStep && navigate(`${WIZARD_BASE_PATH}/${nextStep.path}`)}
        >
          Weiter
        </Button>
      </Stack>
    </Stack>
  );
}
