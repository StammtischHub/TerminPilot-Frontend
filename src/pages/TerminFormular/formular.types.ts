import { Temporal } from "temporal-polyfill";
import type {Schema} from "../../api/types.ts";

type Weekday = Schema<'Weekday'>;

export const ALL_WEEKDAYS: Weekday[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export type FormUser = { id: number; name: string };

export type FormData = {
  constraints: {
    weekdays: Weekday[];
    datePeriod: { start: Temporal.PlainDate; end: Temporal.PlainDate };
    timePeriod: { start: Temporal.PlainTime; end: Temporal.PlainTime };
    durationInMinutes: number;
  };
  event: {
    title: string;
    begin: Temporal.PlainDateTime;
    end: Temporal.PlainDateTime;
    users: FormUser[];
    location?: string;
    notes?: string;
  };
};

export function createInitialFormData(): FormData {
  const defaultStartDateTime = Temporal.Now.plainDateTimeISO().add({ hours: 1 }).with({ minute: 30 })
  const currentPlainDate = Temporal.Now.plainDateISO();

  return {
    constraints: {
      weekdays: ALL_WEEKDAYS,
      datePeriod: {
        start: currentPlainDate,
        end: currentPlainDate.add({ months: 3 }),
      },
      timePeriod: {
        start: Temporal.PlainTime.from('00:00'),
        end: Temporal.PlainTime.from('23:59'),
      },
      durationInMinutes: 60,
    },
    event: {
      title: '',
      begin: defaultStartDateTime,
      end: defaultStartDateTime.add({ hours: 1 }),
      users: [],
      location: '',
      notes: '',
    },
  };
}

const TEMPORAL_CLASSES = {
  PlainDate: Temporal.PlainDate,
  PlainTime: Temporal.PlainTime,
  PlainDateTime: Temporal.PlainDateTime,
  ZonedDateTime: Temporal.ZonedDateTime,
  Instant: Temporal.Instant,
  Duration: Temporal.Duration,
} as const;

type TemporalTypeName = keyof typeof TEMPORAL_CLASSES;
const TAG = "__temporal";

export function replaceTemporalTypes(this: unknown, key: string, value: unknown): unknown {
  const original = (this as Record<string, unknown>)[key];

  for (const [name, cls] of Object.entries(TEMPORAL_CLASSES)) {
    if (original instanceof cls) {
      return { [TAG]: name as TemporalTypeName, value: original.toString() };
    }
  }
  return value;
}

export function reviveTemporalTypes(_key: string, value: unknown): unknown {
  if (typeof value === "object" && value !== null && TAG in value) {
    const typeName = (value as Record<string, unknown>)[TAG] as TemporalTypeName;
    const raw = (value as Record<string, unknown>).value as string;
    return TEMPORAL_CLASSES[typeName].from(raw);
  }
  return value;
}
