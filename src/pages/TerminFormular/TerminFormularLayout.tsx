import { Outlet } from 'react-router';
import { FormWizardProvider } from './FormWizardProvider.tsx';
import { StepNavigation } from './StepNavigation';
import AppBarsWrapper from '../../components/AppBarsWrapper.tsx';
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export function TerminFormularLayout() {
  return (
    <AppBarsWrapper>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={dayjs.locale("de")}>
        <FormWizardProvider>
          <StepNavigation />
          <Outlet />
        </FormWizardProvider>
      </LocalizationProvider>
    </AppBarsWrapper>
  );
}
