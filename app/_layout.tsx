import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { RootNavigator } from '@/components/navigation/root-navigator';
import { BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/providers/auth-provider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const lightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: BrandColors.primaryGreen,
      background: BrandColors.background,
      card: BrandColors.surface,
      text: BrandColors.textPrimary,
      border: BrandColors.border,
      notification: BrandColors.primaryBlue,
    },
  };
  const darkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: BrandColors.lime,
      background: '#0D1D15',
      card: '#10261B',
      text: '#E7F6ED',
      border: '#1F3A2B',
      notification: BrandColors.primaryBlue,
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? darkTheme : lightTheme}>
          <RootNavigator />
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor={colorScheme === 'dark' ? '#0D1D15' : BrandColors.background} />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
