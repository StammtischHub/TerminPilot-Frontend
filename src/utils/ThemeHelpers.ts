import { theme } from '../theme.ts';

export const isMobile = theme.breakpoints.down('md');

export function generateSeparateStyle(mobileValue: string|number, desktopValue: string|number) {
  return {
    xs: mobileValue,
    md: desktopValue,
  };
}
