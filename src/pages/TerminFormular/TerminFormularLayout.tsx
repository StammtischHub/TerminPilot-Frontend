import { Outlet } from 'react-router';
import { FormWizardProvider } from './FormWizardProvider.tsx';
import { StepNavigation } from './StepNavigation';
import AppBarsWrapper from '../../components/AppBarsWrapper.tsx';
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";

export function TerminFormularLayout() {
  return (
    <AppBarsWrapper>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
        <FormWizardProvider>
          <StepNavigation />
          <Outlet />
        </FormWizardProvider>
      </LocalizationProvider>
    </AppBarsWrapper>
  );
}
