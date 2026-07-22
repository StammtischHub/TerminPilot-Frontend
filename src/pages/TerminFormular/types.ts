import type {Dayjs} from "dayjs";

export type EventFormData = {
  userSelection: {
    users: number[];
  };
  conditions?: {
    weekdays: Weekday[];
    datePeriod?: {
      start?: Dayjs;
      end?: Dayjs;
    };
    timePeriod?: {
      start?: Dayjs;
      end?: Dayjs;
    };
    durationInMinutes: number;
  };
  event: {
    title: string;
    start: Date;
    end: Date;
    location?: string;
    notes?: string;
  };
};

export type Weekday = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So';

export const initialFormData: EventFormData = {
  userSelection: { users: [] },
  event: { title: '', start: new Date(), end: new Date() },
};

export type StepConfig = {
  path: string;
  label: string;
};
