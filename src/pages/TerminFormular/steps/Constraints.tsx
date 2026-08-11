import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useFormWizard } from '../FormWizardContext';
import { steps, WIZARD_BASE_PATH } from '../steps.config';
import {
  Box,
  Divider,
  InputAdornment,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { type Dayjs } from 'dayjs';
import type { DatePeriod, TimePeriod, Weekday } from '../formular.types.ts';
import { generateSeparateStyle } from '../../../utils/ThemeHelpers.ts';
import type { DateValidationError, TimeValidationError } from '@mui/x-date-pickers';
import type { ReactNode } from 'react';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

const WEEKDAYS: Weekday[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const currentDateDayjs = dayjs().hour(0).minute(0).second(0).millisecond(0);

const unixEpochTimeDayjs = dayjs(0).hour(0).minute(0).second(0).millisecond(0);

type DatePeriodErrors = Record<keyof DatePeriod, DateValidationError | null>;
type TimePeriodErrors = Record<keyof TimePeriod, TimeValidationError | null>;

function SectionLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center' }}>
      {icon}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

export function Constraints() {
  const { data, updateStep, visitStep } = useFormWizard();
  const navigate = useNavigate();

  useEffect(() => {
    visitStep('conditions');
  }, [visitStep]);

  const [weekdays, setWeekdays] = useState<Weekday[]>(data.constraints?.weekdays ?? WEEKDAYS);
  const [datePeriod, setDatePeriod] = useState<DatePeriod>(
    data.constraints?.datePeriod ?? {
      start: currentDateDayjs,
      end: currentDateDayjs.add(3, 'months'),
    },
  );
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(
    data.constraints?.timePeriod ?? {
      start: unixEpochTimeDayjs,
      end: unixEpochTimeDayjs.hour(23).minute(59),
    },
  );
  const [durationInMinutes, setDurationInMinutes] = useState<number>(
    data.constraints?.durationInMinutes ?? 60,
  );

  const [dateErrors, setDateErrors] = useState<DatePeriodErrors>({
    start: null,
    end: null,
  });
  const [timeErrors, setTimeErrors] = useState<TimePeriodErrors>({
    start: null,
    end: null,
  });

  const overallMaxDate = currentDateDayjs.add(20, 'years');

  const getStartDateErrorMessage = (reason: DateValidationError | null): string | undefined => {
    switch (reason) {
      case 'invalidDate':
        return 'Ungültiges Datum';
      case 'maxDate':
        return 'Datum muss vor "Bis" liegen';
      case 'disablePast':
        return `Datum darf nicht vor dem ${currentDateDayjs.format('DD.MM.YYYY')} liegen`;
      default:
        return undefined;
    }
  };

  const getEndDateErrorMessage = (reason: DateValidationError | null): string | undefined => {
    switch (reason) {
      case 'invalidDate':
        return 'Ungültiges Datum';
      case 'minDate':
        return 'Datum muss nach "Von" liegen';
      case 'maxDate':
        return `Datum darf nicht nach dem ${overallMaxDate.format('DD.MM.YYYY')} liegen`;
      default:
        return undefined;
    }
  };

  const getTimeErrorMessage = (reason: TimeValidationError | null): string | undefined => {
    switch (reason) {
      case 'invalidDate':
        return 'Ungültige Uhrzeit';
      case 'minTime':
        return 'Uhrzeit muss nach "Von" liegen';
      case 'maxTime':
        return 'Uhrzeit muss vor "Bis" liegen';
      default:
        return undefined;
    }
  };

  const weekdaysValid = weekdays.length > 0;

  const timeWindowMinutes = timePeriod.end.diff(timePeriod.start, 'minute');
  const durationValid = durationInMinutes > 0 && durationInMinutes <= timeWindowMinutes;

  const hasDateError = Boolean(dateErrors.start || dateErrors.end);
  const hasTimeError = Boolean(timeErrors.start || timeErrors.end);

  const dateRangeValid = datePeriod.start.isBefore(datePeriod.end);
  const timeRangeValid = timePeriod.start.isBefore(timePeriod.end);

  const canProceed =
    dateRangeValid &&
    timeRangeValid &&
    !hasDateError &&
    !hasTimeError &&
    weekdaysValid &&
    durationValid;

  const handleWeekdayChange = (_event: React.MouseEvent<HTMLElement>, newWeekdays: Weekday[]) => {
    setWeekdays(newWeekdays);
    updateStep('constraints', { weekdays: newWeekdays });
  };

  const handleDatePeriodChange = (field: keyof DatePeriod, newValue: Dayjs | null) => {
    if (!newValue) return;
    const updated: DatePeriod = { ...datePeriod, [field]: newValue };
    setDatePeriod(updated);
    updateStep('constraints', { datePeriod: updated });
  };

  const handleTimePeriodChange = (field: keyof TimePeriod, newValue: Dayjs | null) => {
    if (!newValue) return;
    const updated: TimePeriod = { ...timePeriod, [field]: newValue };
    setTimePeriod(updated);
    updateStep('constraints', { timePeriod: updated });
  };

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setDurationInMinutes(value);
    updateStep('constraints', { durationInMinutes: value });
  };

  const currentStepIndex = steps.findIndex((step) => step.path === 'conditions');
  const previousStep = steps[currentStepIndex - 1];
  const nextStep = steps[currentStepIndex + 1];

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', marginY: 3 }}>
      <Paper elevation={4} sx={{ width: generateSeparateStyle('80%', '60%'), p: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Neuer Termin
            </Typography>
            <Typography variant="h4">
              Rahmenbedingungen
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Lege fest, in welchem Rahmen ein passender Termin gesucht werden soll.
            </Typography>
          </Box>

          <Divider />

          <Box>
            <SectionLabel icon={<EventRepeatIcon color="action" fontSize="small" />}>
              Wochentage
            </SectionLabel>
            <ToggleButtonGroup
              value={weekdays}
              onChange={handleWeekdayChange}
              aria-label="Wochentage auswaehlen"
              size="medium"
              sx={{ flexWrap: 'wrap' }}
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
                    fontWeight: 'normal',
                    '&.Mui-selected, &.Mui-selected:hover': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      borderColor: 'primary.secondary',
                    },
                  }}
                >
                  {day}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {!weekdaysValid && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                Bitte mindestens einen Wochentag auswählen
              </Typography>
            )}
          </Box>

          <Box>
            <SectionLabel icon={<DateRangeIcon color="action" fontSize="small" />}>
              Möglicher Datum-Rahmen
            </SectionLabel>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DatePicker
                label="Von"
                value={datePeriod.start}
                onChange={(newValue) => handleDatePeriodChange('start', newValue)}
                onError={(reason) => {
                  setDateErrors((prev) => ({ ...prev, start: reason }));
                }}
                format="DD.MM.YYYY"
                disablePast
                maxDate={datePeriod.end}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(dateErrors.start),
                    helperText: getStartDateErrorMessage(dateErrors.start),
                  },
                }}
              />
              <DatePicker
                label="Bis"
                value={datePeriod.end}
                onChange={(newValue) => handleDatePeriodChange('end', newValue)}
                onError={(reason) => {
                  setDateErrors((prev) => ({ ...prev, end: reason }));
                }}
                format="DD.MM.YYYY"
                disablePast
                minDate={datePeriod.start}
                maxDate={overallMaxDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(dateErrors.end),
                    helperText: getEndDateErrorMessage(dateErrors.end),
                  },
                }}
              />
            </Stack>
          </Box>

          <Box>
            <SectionLabel icon={<AccessTimeIcon color="action" fontSize="small" />}>
              Möglicher Uhrzeit-Rahmen
            </SectionLabel>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TimePicker
                label="Von"
                value={timePeriod.start}
                onChange={(newValue) => handleTimePeriodChange('start', newValue)}
                onError={(reason) => setTimeErrors((prev) => ({ ...prev, start: reason }))}
                ampm={false}
                maxTime={timePeriod.end}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(timeErrors.start),
                    helperText: getTimeErrorMessage(timeErrors.start),
                  },
                }}
              />
              <TimePicker
                label="Bis"
                value={timePeriod.end}
                onChange={(newValue) => handleTimePeriodChange('end', newValue)}
                onError={(reason) => setTimeErrors((prev) => ({ ...prev, end: reason }))}
                ampm={false}
                minTime={timePeriod.start}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(timeErrors.end),
                    helperText: getTimeErrorMessage(timeErrors.end),
                  },
                }}
              />
            </Stack>
          </Box>

          <Box>
            <SectionLabel icon={<HourglassBottomIcon color="action" fontSize="small" />}>
              Dauer
            </SectionLabel>
            <TextField
              type="number"
              label="Dauer"
              value={durationInMinutes}
              onChange={handleDurationChange}
              fullWidth
              error={!durationValid}
              helperText={
                !durationValid
                  ? durationInMinutes <= 0
                    ? 'Dauer muss größer als 0 sein'
                    : `Dauer passt nicht in den gewählten Zeitrahmen (max. ${timeWindowMinutes} Min.)`
                  : undefined
              }
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">Min.</InputAdornment>,
                },
              }}
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
