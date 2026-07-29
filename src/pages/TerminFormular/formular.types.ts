import dayjs, { type Dayjs } from 'dayjs';

export type Weekday = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So';

export type DatePeriod = {
  start: Dayjs;
  end: Dayjs;
};

export type TimePeriod = {
  start: Dayjs;
  end: Dayjs;
};

export type EventFormData = {
  userSelection: {
    users: number[];
  };
  conditions?: {
    weekdays: Weekday[];
    datePeriod: DatePeriod;
    timePeriod: TimePeriod;
    durationInMinutes: number;
  };
  event: {
    title: string;
    begin: Dayjs;
    end: Dayjs;
    location?: string;
    notes?: string;
  };
};

const DATE_FIELD_KEYS = new Set(['begin', 'end', 'start']);

export function reviveEventFormDates(key: string, value: unknown): unknown {
  if (DATE_FIELD_KEYS.has(key) && typeof value === 'string') {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : value;
  }
  return value;
}

export function createInitialFormData(): EventFormData {
  return {
    userSelection: { users: [] },
    event: { title: '', begin: dayjs().add(1, 'hour').minute(30), end: dayjs().add(2, 'hour').minute(30) },
  };
}
