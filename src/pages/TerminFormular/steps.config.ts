export const steps = [
  { path: 'user-selection', label: 'Personenauswahl' },
  { path: 'constraints', label: 'Rahmenbedingungen' },
  { path: 'event-suggestions', label: 'Terminvorschläge' },
  { path: 'event-data', label: 'Termindaten' },
  { path: 'overview', label: 'Übersicht' },
] as const;

export type StepPath = (typeof steps)[number]['path'];

export const WIZARD_BASE_PATH = '/event';
