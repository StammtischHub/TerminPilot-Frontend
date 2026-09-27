import { useLocation } from 'react-router';
import { steps } from '../pages/TerminFormular/steps.config.ts';

export function useActiveStepIndex() {
  const location = useLocation();
  return steps.findIndex((s) => location.pathname.endsWith(s.path));
}
