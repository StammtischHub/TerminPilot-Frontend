import MobileStepper from '@mui/material/MobileStepper';
import Typography from '@mui/material/Typography';
import { useLocation } from 'react-router';
import { steps } from './steps.config';

export function MobileStepNavigation() {
  const location = useLocation();

  const activeIndex = steps.findIndex((s) => location.pathname.endsWith(s.path));


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
