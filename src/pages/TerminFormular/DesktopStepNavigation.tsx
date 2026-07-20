import { StepButton, Step, Stepper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router';
import { steps, WIZARD_BASE_PATH } from './steps.config';
import { useFormWizard } from './FormWizardContext';

export function DesktopStepNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { visitedSteps } = useFormWizard();

  const activeIndex = steps.findIndex((s) => location.pathname.endsWith(s.path));

  return (
    <Stepper nonLinear activeStep={activeIndex} sx={{ padding: 1 }}>
      {steps.map((step, index) => {
        const isVisited = visitedSteps.includes(step.path);
        return (
          <Step key={step.path} completed={isVisited && index < activeIndex}>
            <StepButton
              disabled={!isVisited}
              onClick={() => navigate(`${WIZARD_BASE_PATH}/${step.path}`)}
            >
              {step.label}
            </StepButton>
          </Step>
        );
      })}
    </Stepper>
  );
}
