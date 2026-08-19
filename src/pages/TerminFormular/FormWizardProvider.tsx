import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import {
  FormWizardContext,
  reducer,
  type WizardState,
  type FormWizardContextValue,
  createInitialState,
} from './FormWizardContext';
import { reviveTemporalTypes, replaceTemporalTypes } from './formular.types.ts';

const STORAGE_KEY = 'event-formular-wizard';

export function FormWizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, createInitialState(), (init) => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved, reviveTemporalTypes) as WizardState) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state, replaceTemporalTypes));
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

  const updateStep = useCallback<FormWizardContextValue['updateStep']>(
    (step, payload) => dispatch({ type: 'UPDATE_STEP', step, payload }),
    []
  );
  const visitStep = useCallback<FormWizardContextValue['visitStep']>(
    (step) => dispatch({ type: 'VISIT_STEP', step }),
    []
  );
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const value = useMemo<FormWizardContextValue>(
    () => ({ ...state, updateStep, visitStep, reset }),
    [state, updateStep, visitStep, reset]
  );

  return <FormWizardContext.Provider value={value}>{children}</FormWizardContext.Provider>;
}
