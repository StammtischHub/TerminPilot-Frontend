import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useFormWizard } from '../FormWizardContext';
import { steps, WIZARD_BASE_PATH } from '../steps.config';
import {
  Box,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import type { Dayjs } from 'dayjs';
import type { Weekday } from '../types';
import { generateSeparateStyle } from '../../../tools/ThemeHelpers.ts';

const WEEKDAYS: Weekday[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

type Period = { start?: Dayjs; end?: Dayjs };

export function Conditions() {
  const { data, updateStep, visitStep } = useFormWizard();
  const navigate = useNavigate();

  useEffect(() => {
    visitStep('conditions');
  }, [visitStep]);

  // Lokaler State, gespiegelt aus dem (gesamten optionalen!) data.conditions
  const [weekdays, setWeekdays] = useState<Weekday[]>(data.conditions?.weekdays ?? []);
  const [datePeriod, setDatePeriod] = useState<Period>(data.conditions?.datePeriod ?? {});
  const [timePeriod, setTimePeriod] = useState<Period>(data.conditions?.timePeriod ?? {});
  const [durationInMinutes, setDurationInMinutes] = useState<number>(
    data.conditions?.durationInMinutes ?? 30,
  );

  // Die Seite ist komplett optional – "Weiter" bleibt also auch nutzbar,
  // wenn nichts ausgefüllt wurde. Blockiert wird nur ein widersprüchlicher
  // Bereich (z.B. "Von" liegt nach "Bis").
  const dateRangeValid =
    !datePeriod.start || !datePeriod.end || !datePeriod.start.isAfter(datePeriod.end);
  const timeRangeValid =
    !timePeriod.start || !timePeriod.end || !timePeriod.start.isAfter(timePeriod.end);
  const canProceed = dateRangeValid && timeRangeValid;

  const handleWeekdayChange = (_event: React.MouseEvent<HTMLElement>, newWeekdays: Weekday[]) => {
    setWeekdays(newWeekdays);
    updateStep('conditions', { weekdays: newWeekdays });
  };

  // datePeriod / timePeriod sind verschachtelte Objekte. Der Reducer merged
  // in FormWizardContext nur auf oberster Ebene (state.data.conditions),
  // daher muss start/end hier lokal zusammengeführt werden, bevor das ganze
  // "datePeriod"-Objekt an updateStep übergeben wird – sonst würde z.B. das
  // Setzen von "start" das zuvor gesetzte "end" überschreiben.
  const handleDatePeriodChange = (field: keyof Period, newValue: Dayjs | null) => {
    const updated: Period = { ...datePeriod, [field]: newValue ?? undefined };
    setDatePeriod(updated);
    updateStep('conditions', { datePeriod: updated });
  };

  const handleTimePeriodChange = (field: keyof Period, newValue: Dayjs | null) => {
    const updated: Period = { ...timePeriod, [field]: newValue ?? undefined };
    setTimePeriod(updated);
    updateStep('conditions', { timePeriod: updated });
  };

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setDurationInMinutes(value);
    updateStep('conditions', { durationInMinutes: value });
  };

  // Step-Index über den Pfad statt hart codiert ermitteln, damit es
  // unabhängig von der Position in steps.config.ts funktioniert.
  const currentStepIndex = steps.findIndex((step) => step.path === 'conditions');
  const previousStep = steps[currentStepIndex - 1];
  const nextStep = steps[currentStepIndex + 1];

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', mt: '24px', mb: '24px' }}>
      <Paper elevation={4} sx={{ width: generateSeparateStyle('80%', '60%'), p: 3 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Wochentage
            </Typography>
            <ToggleButtonGroup
              value={weekdays}
              onChange={handleWeekdayChange}
              aria-label="Wochentage auswählen"
              size="medium"
            >
              {WEEKDAYS.map((day) => (
                <ToggleButton
                  key={day}
                  value={day}
                  aria-label={day}
                  sx={{
                    height: 44,
                    minWidth: 44,
                    color: 'text.primary',
                    fontWeight: "normal",
                    '&.Mui-selected, &.Mui-selected:hover': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {day}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Möglicher Zeitrahmen */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Möglicher Zeitrahmen
            </Typography>
            <Stack spacing={2}>
              <DatePicker
                label="Von"
                value={datePeriod.start ?? null}
                onChange={(newValue) => handleDatePeriodChange('start', newValue)}
                format="MM/DD/YYYY"
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="Bis"
                value={datePeriod.end ?? null}
                onChange={(newValue) => handleDatePeriodChange('end', newValue)}
                format="MM/DD/YYYY"
                minDate={datePeriod.start}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </Box>

          {/* Mögliche Uhrzeit */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Mögliche Uhrzeit
            </Typography>
            <Stack spacing={2}>
              <TimePicker
                label="Von"
                value={timePeriod.start ?? null}
                onChange={(newValue) => handleTimePeriodChange('start', newValue)}
                ampm={false}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TimePicker
                label="Bis"
                value={timePeriod.end ?? null}
                onChange={(newValue) => handleTimePeriodChange('end', newValue)}
                ampm={false}
                minTime={timePeriod.start}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </Box>

          {/* Dauer */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Dauer
            </Typography>
            <TextField type="number" label="Dauer" value={durationInMinutes} onChange={handleDurationChange} fullWidth />
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
