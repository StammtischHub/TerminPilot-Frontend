import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useFormWizard } from '../FormWizardContext';
import { steps, WIZARD_BASE_PATH } from '../steps.config';
import { Box, Paper, TextField, Typography } from '@mui/material';
import { type Dayjs } from 'dayjs';
import { generateSeparateStyle } from '../../../utils/ThemeHelpers.ts';
import {DateTimePicker} from '@mui/x-date-pickers';

export function EventData() {
  const { data, visitedSteps, updateStep, visitStep } = useFormWizard();
  const navigate = useNavigate();

  useEffect(() => {
    visitStep('event-data');
  }, [visitStep]);

  const [title, setTitle] = useState(data.event.title ?? '');
  const [beginDate, setBeginDate] = useState<Dayjs >(
    data.event.begin
  );
  const [endDate, setEndDate] = useState<Dayjs >(
    data.event.end
  );
  const [location, setLocation] = useState(data.event.location ?? '');
  const [notes, setNotes] = useState(data.event.notes ?? '');

  const dateTimeRangeValid = beginDate && endDate && beginDate.isBefore(endDate);

  const canProceed =
    dateTimeRangeValid && title.trim() !== '' && beginDate && endDate;

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateStep('event', { title: newTitle });
  };

  const handleBeginDateChange = (newBeginDate: Dayjs | null) => {
    if (!newBeginDate) return;
    setBeginDate(newBeginDate);
    updateStep('event', { begin: newBeginDate });
  };

  const handleEndDateChange = (newEndDate: Dayjs | null) => {
    if (!newEndDate) return;
    setEndDate(newEndDate);
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
      <Paper elevation={4} sx={{ width: generateSeparateStyle('80%', '60%'), p: 3 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Titel
            </Typography>
            <TextField
              id="title-input"
              placeholder="Titel"
              required
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              variant="outlined"
              label="Titel"
              fullWidth
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Daten
            </Typography>
            <Stack spacing={2}>
              <DateTimePicker
                ampm={false}
                label="Beginn"
                value={beginDate}
                onChange={(newValue) => handleBeginDateChange(newValue)}
                format="DD.MM.YYYY HH:mm"
              />
              <DateTimePicker
                ampm={false}
                label="Bis"
                value={endDate}
                onChange={(newValue) => handleEndDateChange(newValue)}
                format="DD.MM.YYYY HH:mm"
                minDate={beginDate}
              />
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Ort
            </Typography>
            <TextField
              id="location-input"
              placeholder="Ort"
              value={location}
              onChange={(event) => handleLocationChange(event.target.value)}
              variant="outlined"
              label="Ort"
              fullWidth
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Notizen
            </Typography>
            <TextField
              id="notes-input"
              placeholder="Notizen"
              multiline
              minRows={4}
              value={notes}
              onChange={(event) => handleNotesChange(event.target.value)}
              variant="outlined"
              label="Notizen"
              fullWidth
            />
          </Box>
        </Stack>
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
          disabled={!canProceed}
          onClick={() => nextStep && navigate(`${WIZARD_BASE_PATH}/${nextStep.path}`)}
        >
          Weiter
        </Button>
      </Stack>
    </Stack>
  );
}
