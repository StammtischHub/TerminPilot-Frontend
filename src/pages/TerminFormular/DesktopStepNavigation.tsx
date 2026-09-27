import { StepButton, Step, Stepper } from '@mui/material';
import { useNavigate } from 'react-router';
import { steps, WIZARD_BASE_PATH } from './steps.config.ts';
import { useFormWizard } from './FormWizardContext.tsx';
import {useActiveStepIndex} from "../../hooks/useActiveStepIndex.ts";

export function DesktopStepNavigation() {
  const navigate = useNavigate();
  const { visitedSteps } = useFormWizard();
  const activeIndex = useActiveStepIndex();

  return (
    <Stepper nonLinear activeStep={activeIndex} sx={{ paddingY: 1, paddingX: 2 }}>
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
