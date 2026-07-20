import type { StepConfig } from './types';

export const steps: StepConfig[] = [
  { path: 'user-selection', label: 'Personenauswahl' },
  { path: 'conditions', label: 'Rahmenbedingungen' },
  { path: 'event-suggestions', label: 'Terminvorschläge' },
  { path: 'event-data', label: 'Termindaten' },
  { path: 'overview', label: 'Übersicht' },
];

export const WIZARD_BASE_PATH = '/event';
