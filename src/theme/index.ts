import { lightPalette, darkPalette, ColorPalette } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows } from './shadows';
import { animations } from './animations';

export interface Theme {
  colors: ColorPalette;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  animations: typeof animations;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors: lightPalette,
  typography,
  spacing,
  radius,
  shadows,
  animations,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkPalette,
  typography,
  spacing,
  radius,
  shadows,
  animations,
  isDark: true,
};

export { lightPalette, darkPalette, typography, spacing, radius, shadows, animations };
