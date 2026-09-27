import { createContext, useContext } from 'react';
import { createInitialFormData, type FormData } from './formular.types.ts';
import type { StepPath } from './steps.config.ts';

export type WizardState = {
  data: FormData;
  visitedSteps: StepPath[];
};

export function createInitialState(): WizardState {
  return {
    data: createInitialFormData(),
    visitedSteps: [],
  };
}

export type Action =
  | {
      [K in keyof FormData]: { type: 'UPDATE_STEP'; step: K; payload: Partial<FormData[K]> };
    }[keyof FormData]
  | { type: 'VISIT_STEP'; step: StepPath }
  | { type: 'RESET' };

export function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case 'UPDATE_STEP':
      return {
        ...state,
        data: {
          ...state.data,
          [action.step]: { ...state.data[action.step], ...action.payload },
        },
      };
    case 'VISIT_STEP':
      return state.visitedSteps.includes(action.step)
        ? state
        : { ...state, visitedSteps: [...state.visitedSteps, action.step] };
    case 'RESET':
      return createInitialState();
    default:
      return state;
  }
}

export type FormWizardContextValue = WizardState & {
  updateStep: <K extends keyof FormData>(step: K, payload: Partial<FormData[K]>) => void;
  visitStep: (step: StepPath) => void;
  reset: () => void;
};

export const FormWizardContext = createContext<FormWizardContextValue | null>(null);

export function useFormWizard() {
  const ctx = useContext(FormWizardContext);
  if (!ctx) {
    throw new Error('useFormWizard muss innerhalb von <FormWizardProvider> verwendet werden');
  }
  return ctx;
}
