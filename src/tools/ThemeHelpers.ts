import { theme } from '../theme.ts';

export const isMobile = theme.breakpoints.down('sm');

export function generateSeparateStyle(mobileValue: string, desktopValue: string) {
  return {
    xs: mobileValue,
    md: desktopValue,
  };
}
