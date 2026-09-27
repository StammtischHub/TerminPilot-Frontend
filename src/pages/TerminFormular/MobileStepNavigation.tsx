import MobileStepper from '@mui/material/MobileStepper';
import Typography from '@mui/material/Typography';
import { steps } from './steps.config.ts';
import {useActiveStepIndex} from "../../hooks/useActiveStepIndex.ts";

export function MobileStepNavigation() {
  const activeIndex = useActiveStepIndex();

  return (
    <>
      <Typography align="center" variant="subtitle2" sx={{ pt: 1 }}>
        {steps[activeIndex]?.label}
      </Typography>
      <MobileStepper
        variant="dots"
        steps={steps.length}
        position="static"
        activeStep={activeIndex}
        backButton={<div/>}
        nextButton={<div/>}
      />
    </>
  );
}
