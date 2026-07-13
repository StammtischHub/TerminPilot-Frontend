// FormWizardContext.tsx
//
// Zentraler State für den gesamten Formular-Wizard.
// - "data": die eigentlichen Formulareingaben aller Steps
// - "visitedSteps": welche Steps bereits besucht wurden (für Stepper-Klickbarkeit)
//
// Dieser Context wird EINMAL oberhalb der Routen gemounted (siehe
// TerminFormularLayout.tsx). Dadurch überlebt der State jeden Routenwechsel,
// egal ob per Klick, "Weiter"-Button oder Browser-Back/Forward.
//
// Zusätzlich wird der State bei jeder Änderung in sessionStorage gespiegelt,
// damit er auch einen versehentlichen Reload (F5) übersteht.

import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { type EventFormData, initialFormData } from './types';

const STORAGE_KEY = 'event-formular-wizard';

type WizardState = {
  data: EventFormData;
  visitedSteps: string[];
};

const initialState: WizardState = {
  data: initialFormData,
  visitedSteps: [],
};

type Action =
  | {
      type: 'UPDATE_STEP';
      step: keyof EventFormData;
      payload: Partial<EventFormData[keyof EventFormData]>;
    }
  | { type: 'VISIT_STEP'; step: string }
  | { type: 'RESET' };

function reducer(state: WizardState, action: Action): WizardState {
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
      return initialState;
    default:
      return state;
  }
}

type FormWizardContextValue = WizardState & {
  updateStep: (
    step: keyof EventFormData,
    payload: Partial<EventFormData[keyof EventFormData]>,
  ) => void;
  visitStep: (step: string) => void;
  reset: () => void;
};

const FormWizardContext = createContext<FormWizardContextValue | null>(null);

export function FormWizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as WizardState) : init;
    } catch {
      return init;
    }
  });

  // Bei jeder Änderung in sessionStorage spiegeln (überlebt Reload/F5)
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // sessionStorage kann z. B. im Privacy-Modus fehlschlagen – bewusst ignoriert
    }
  }, [state]);

  const value: FormWizardContextValue = {
    ...state,
    updateStep: (step, payload) => dispatch({ type: 'UPDATE_STEP', step, payload }),
    visitStep: (step) => dispatch({ type: 'VISIT_STEP', step }),
    reset: () => dispatch({ type: 'RESET' }),
  };

  return <FormWizardContext.Provider value={value}>{children}</FormWizardContext.Provider>;
}

export function useFormWizard() {
  const ctx = useContext(FormWizardContext);
  if (!ctx) {
    throw new Error('useFormWizard muss innerhalb von <FormWizardProvider> verwendet werden');
  }
  return ctx;
}
