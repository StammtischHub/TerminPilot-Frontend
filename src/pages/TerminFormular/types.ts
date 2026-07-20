export type EventFormData = {
  userSelection: {
    users: number[];
  };
  conditions?: {
    weekdays: Days[];
    datePeriod: {
      start: Date;
      end: Date;
    };
    timePeriod?: {
      start: string;
      end: string;
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

const Days = {
  MONDAY: 'MO',
  TUESDAY: 'DI',
  WEDNESDAY: 'MI',
  THURSDAY: 'DO',
  FRIDAY: 'FR',
  SATURDAY: 'SA',
  SUNDAY: 'SO',
} as const;

type Days = (typeof Days)[keyof typeof Days];

export const initialFormData: EventFormData = {
  userSelection: { users: [] },
  event: { title: '', start: new Date(), end: new Date() },
};

export type StepConfig = {
  path: string;
  label: string;
};
