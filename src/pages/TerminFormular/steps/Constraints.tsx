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
import {ALL_WEEKDAYS, type Weekday} from '../formular.types.ts';
import { generateSeparateStyle } from '../../../utils/ThemeHelpers.ts';
import type { DateValidationError, TimeValidationError } from '@mui/x-date-pickers';
import type { ReactNode } from 'react';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import {TemporalPlainDateProvider, TemporalPlainTimeProvider} from "mui-temporal-pickers";

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

  const currentPlainDate = Temporal.Now.plainDateISO();
  const overallMaxDate = currentPlainDate.add({ years: 10 });

  const [weekdays, setWeekdays] = useState<Weekday[]>(data.constraints.weekdays);
  const [startDate, setStartDate] = useState<Temporal.PlainDate>(data.constraints.datePeriod.start);
  const [endDate, setEndDate] = useState<Temporal.PlainDate>(data.constraints.datePeriod.end);
  const [startTime, setStartTime] = useState<Temporal.PlainTime>(data.constraints.timePeriod.start);
  const [endTime, setEndTime] = useState<Temporal.PlainTime>(data.constraints.timePeriod.end);
  const [durationInMinutes, setDurationInMinutes] = useState<number>(
    data.constraints?.durationInMinutes ?? 60,
  );

  type DatePeriodErrors = Record<keyof typeof data.constraints.datePeriod, DateValidationError | null>;
  type TimePeriodErrors = Record<keyof typeof data.constraints.timePeriod, TimeValidationError | null>;

  const [dateErrors, setDateErrors] = useState<DatePeriodErrors>({
    start: null,
    end: null,
  });
  const [timeErrors, setTimeErrors] = useState<TimePeriodErrors>({
    start: null,
    end: null,
  });

  const getStartDateErrorMessage = (reason: DateValidationError | null): string | undefined => {
    switch (reason) {
      case 'invalidDate':
        return 'Ungültiges Datum';
      case 'maxDate':
        return 'Datum muss vor "Bis" liegen';
      case 'disablePast':
        return `Datum darf nicht vor dem ${currentPlainDate.toString()} liegen`;
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
        return `Datum darf nicht nach dem ${overallMaxDate.toString()} liegen`;
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

  const timeWindowMinutes = startTime.until(endTime, { largestUnit: 'minutes' }).total('minutes');
  const durationValid = durationInMinutes > 0 && durationInMinutes <= timeWindowMinutes;

  const hasDateError = Boolean(dateErrors.start || dateErrors.end);
  const hasTimeError = Boolean(timeErrors.start || timeErrors.end);

  const dateRangeValid = startDate.until(endDate, { largestUnit: 'days' }).total('days') >= 0;
  const timeRangeValid = startTime.until(endTime, { largestUnit: 'minutes' }).total('minutes') > 0;

  const canProceed =
    dateRangeValid &&
    timeRangeValid &&
    !hasDateError &&
    !hasTimeError &&
    weekdaysValid &&
    durationValid;

  const handleWeekdayChange = (newWeekdays: Weekday[]) => {
    setWeekdays(newWeekdays);
    updateStep('constraints', { weekdays: newWeekdays });
  };

  const handleStartDateChange = (newValue: Temporal.PlainDate | null) => {
    if (!newValue) return;
    setStartDate(newValue);
    updateStep('constraints', { datePeriod: { ...data.constraints.datePeriod , start: newValue } });
  };

  const handleEndDateChange = (newValue: Temporal.PlainDate | null) => {
    if (!newValue) return;
    setEndDate(newValue);
    updateStep('constraints', { datePeriod: { ...data.constraints.datePeriod, end: newValue } });
  };

  const handleStartTimeChange = (newValue: Temporal.PlainTime | null) => {
    if (!newValue) return;
    setStartTime(newValue);
    updateStep('constraints', { timePeriod: { ...data.constraints.timePeriod, start: newValue } });
  };

  const handleEndTimeChange = (newValue: Temporal.PlainTime | null) => {
    if (!newValue) return;
    setEndTime(newValue);
    updateStep('constraints', { timePeriod: { ...data.constraints.timePeriod, end: newValue } });
  };

  const handleDurationChange = (newValue: number) => {
    setDurationInMinutes(newValue);
    updateStep('constraints', { durationInMinutes: newValue });
  };

  const currentStepIndex = steps.findIndex((step) => step.path === 'constraints');
  const previousStep = steps[currentStepIndex - 1];
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
              onChange={(_, value) => handleWeekdayChange(value)}
              aria-label="Wochentage auswaehlen"
              size="medium"
              sx={{ flexWrap: 'wrap' }}
            >
              {ALL_WEEKDAYS.map((day) => (
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
              <TemporalPlainDateProvider>
                <DatePicker
                  label="Von"
                  value={startDate}
                  onChange={(newValue) => handleStartDateChange(newValue)}
                  onError={(reason) => {
                    setDateErrors((prev) => ({ ...prev, start: reason }));
                  }}
                  format="dd.MM.yyyy"
                  disablePast
                  maxDate={endDate}
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
                  value={endDate}
                  onChange={(newValue) => handleEndDateChange(newValue)}
                  onError={(reason) => {
                    setDateErrors((prev) => ({ ...prev, end: reason }));
                  }}
                  format="dd.MM.yyyy"
                  disablePast
                  minDate={startDate}
                  maxDate={overallMaxDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(dateErrors.end),
                      helperText: getEndDateErrorMessage(dateErrors.end),
                    },
                  }}
                />
              </TemporalPlainDateProvider>
            </Stack>
          </Box>

          <Box>
            <SectionLabel icon={<AccessTimeIcon color="action" fontSize="small" />}>
              Möglicher Uhrzeit-Rahmen
            </SectionLabel>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TemporalPlainTimeProvider>
                <TimePicker
                  label="Von"
                  value={startTime}
                  onChange={(newValue) => handleStartTimeChange(newValue)}
                  onError={(reason) => setTimeErrors((prev) => ({ ...prev, start: reason }))}
                  ampm={false}
                  maxTime={endTime}
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
                  value={endTime}
                  onChange={(newValue) => handleEndTimeChange(newValue)}
                  onError={(reason) => setTimeErrors((prev) => ({ ...prev, end: reason }))}
                  ampm={false}
                  minTime={startTime}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(timeErrors.end),
                      helperText: getTimeErrorMessage(timeErrors.end),
                    },
                  }}
                />
              </TemporalPlainTimeProvider>
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
              onChange={(event) => handleDurationChange(Number(event.target.value))}
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
