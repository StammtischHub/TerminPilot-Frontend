import dayjs, {type Dayjs} from "dayjs";

export type Weekday = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So';

export type DatePeriod = {
  start: Dayjs;
  end: Dayjs;
}

export type TimePeriod = {
  start: Dayjs;
  end: Dayjs;
}

export type EventFormData = {
  userSelection: {
    users: number[];
  };
  conditions?: {
    weekdays: Weekday[];
    datePeriod: DatePeriod
    timePeriod: TimePeriod
    durationInMinutes: number;
  };
  event: {
    title: string;
    start: Dayjs;
    end: Dayjs;
    location?: string;
    notes?: string;
  };
};

export const initialFormData: EventFormData = {
  userSelection: { users: [] },
  event: { title: '', start: dayjs(), end: dayjs().add(1, 'hour') },
};
