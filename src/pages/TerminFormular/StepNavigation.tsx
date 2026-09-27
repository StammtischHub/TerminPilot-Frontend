import { DesktopStepNavigation } from './DesktopStepNavigation.tsx';
import { MobileStepNavigation } from './MobileStepNavigation.tsx';
import { isMobile } from '../../utils/ThemeHelpers.ts';
import {Box, useMediaQuery} from '@mui/material';

export function StepNavigation() {
  const mobile = useMediaQuery(isMobile)
  return (
    <Box sx={{ height: 'auto', position: 'sticky', top: 0, zIndex: 5, bgcolor: 'background.default' }}>
      {mobile ? <MobileStepNavigation /> : <DesktopStepNavigation />}
    </Box>
  )
}
