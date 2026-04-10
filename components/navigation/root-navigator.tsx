import { Redirect, Stack, useSegments } from 'expo-router';

import { useAuth } from '@/providers/auth-provider';

export function RootNavigator() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const isAuthRoute = segments[0] === 'login';

  if (!isLoading && !user && !isAuthRoute) {
    return <Redirect href="/login" />;
  }

  if (!isLoading && user && isAuthRoute) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1E3A8A',
        headerTitleStyle: { color: '#1E3A8A', fontWeight: '700' },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Produto' }} />
      <Stack.Screen name="profile/about" options={{ title: 'Sobre o app' }} />
    </Stack>
  );
}
