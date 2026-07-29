import { createContext, useContext } from 'react';
import {createInitialFormData, type EventFormData} from './formular.types.ts';

export type WizardState = {
  data: EventFormData;
  visitedSteps: string[];
};

export function createInitialState(): WizardState {
  return {
    data: createInitialFormData(),
    visitedSteps: [],
  };
}

export type Action =
  | {
      type: 'UPDATE_STEP';
      step: keyof EventFormData;
      payload: Partial<EventFormData[keyof EventFormData]>;
    }
  | { type: 'VISIT_STEP'; step: string }
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
  updateStep: (
    step: keyof EventFormData,
    payload: Partial<EventFormData[keyof EventFormData]>,
  ) => void;
  visitStep: (step: string) => void;
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
