import { DesktopStepNavigation } from './DesktopStepNavigation';
import { MobileStepNavigation } from './MobileStepNavigation';
import { isMobile } from '../../tools/ThemeHelpers.ts';
import { useMediaQuery } from '@mui/material';

export function StepNavigation() {
  return useMediaQuery(isMobile) ? <MobileStepNavigation /> : <DesktopStepNavigation />;
}
