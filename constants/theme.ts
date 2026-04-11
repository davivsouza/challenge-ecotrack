/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const BrandColors = {
  primaryGreen: '#139447',
  primaryBlue: '#0A7ED4',
  darkGreen: '#0D6836',
  darkBlue: '#065DA0',
  lime: '#89C930',
  background: '#EAF6EE',
  surface: '#FFFFFF',
  textPrimary: '#0F4F39',
  textSecondary: '#4B6774',
  border: '#CFE4D6',
};

const tintColorLight = BrandColors.primaryGreen;
const tintColorDark = '#E8FFF0';

export const Colors = {
  light: {
    text: BrandColors.textPrimary,
    background: BrandColors.background,
    tint: tintColorLight,
    icon: BrandColors.textSecondary,
    tabIconDefault: BrandColors.textSecondary,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#E7F6ED',
    background: '#0D1D15',
    tint: tintColorDark,
    icon: '#93AD9D',
    tabIconDefault: '#93AD9D',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
