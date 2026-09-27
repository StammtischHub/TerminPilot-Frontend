import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import {
  FormWizardContext,
  reducer,
  type WizardState,
  type FormWizardContextValue,
  type Action,
  createInitialState,
} from './FormWizardContext.tsx';
import { reviveTemporalTypes, replaceTemporalTypes, type FormData } from './formular.types.ts';

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
    } catch {}
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

  const updateStep = useCallback(
    (step: keyof FormData, payload: Partial<FormData[keyof FormData]>) =>
      dispatch({ type: 'UPDATE_STEP', step, payload } as Action),
    []
  ) as FormWizardContextValue['updateStep'];
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
