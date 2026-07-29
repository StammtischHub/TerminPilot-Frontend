import { useEffect, useReducer, type ReactNode } from 'react';
import {
  FormWizardContext,
  reducer,
  type WizardState,
  type FormWizardContextValue, createInitialState,
} from './FormWizardContext';
import {reviveEventFormDates} from "./formular.types.ts";

const STORAGE_KEY = 'event-formular-wizard';

export function FormWizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, createInitialState(), (init) => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved, reviveEventFormDates) as WizardState) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // sessionStorage kann z. B. im Privacy-Modus fehlschlagen – bewusst ignoriert
    }
  }, [state]);

  useEffect(() => {
    return () => {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignorieren
      }
    };
  }, []);

  const value: FormWizardContextValue = {
    ...state,
    updateStep: (step, payload) => dispatch({ type: 'UPDATE_STEP', step, payload }),
    visitStep: (step) => dispatch({ type: 'VISIT_STEP', step }),
    reset: () => dispatch({ type: 'RESET' }),
  };

  return <FormWizardContext.Provider value={value}>{children}</FormWizardContext.Provider>;
}
