import { Outlet } from 'react-router';
import { FormWizardProvider } from './FormWizardContext';
import { StepNavigation } from './StepNavigation';
import AppBarsWrapper from '../components/AppBarsWrapper.tsx';

export function TerminFormularLayout() {
  return (
    <FormWizardProvider>
      <AppBarsWrapper>
        <StepNavigation />
        <Outlet />
      </AppBarsWrapper>
    </FormWizardProvider>
  );
}
