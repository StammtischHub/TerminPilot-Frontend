import { useEffect, useReducer, type ReactNode } from 'react';
import {
  FormWizardContext,
  initialState,
  reducer,
  type WizardState,
  type FormWizardContextValue,
} from './FormWizardContext';

const STORAGE_KEY = 'event-formular-wizard';

export function FormWizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as WizardState) : init;
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

  const value: FormWizardContextValue = {
    ...state,
    updateStep: (step, payload) => dispatch({ type: 'UPDATE_STEP', step, payload }),
    visitStep: (step) => dispatch({ type: 'VISIT_STEP', step }),
    reset: () => dispatch({ type: 'RESET' }),
  };

  return <FormWizardContext.Provider value={value}>{children}</FormWizardContext.Provider>;
}
