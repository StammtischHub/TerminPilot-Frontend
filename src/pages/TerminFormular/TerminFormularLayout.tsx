import { Outlet } from 'react-router';
import { FormWizardProvider } from './FormWizardProvider.tsx';
import { StepNavigation } from './StepNavigation';
import AppBarsWrapper from '../../components/AppBarsWrapper.tsx';
import {TemporalRootProvider} from "mui-temporal-pickers";

export function TerminFormularLayout() {
  return (
    <AppBarsWrapper>
      <TemporalRootProvider locale="de-DE" dateFormats={{ keyboardDate: 'yyyy.mm.dd', keyboardDateTime24h: 'yyyy.mm.dd HH:mm', fullTime24h: 'HH:mm' }}>
        <FormWizardProvider>
          <StepNavigation />
          <Outlet />
        </FormWizardProvider>
      </TemporalRootProvider>
    </AppBarsWrapper>
  );
}
