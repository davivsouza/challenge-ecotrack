import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

export function TabsNavigator() {
  const { isLoading, user } = useAuth();

  if (!isLoading && !user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: BrandColors.primaryGreen, headerShown: false, tabBarButton: HapticTab }}>
      <Tabs.Screen name="index" options={{ title: 'Escanear', tabBarIcon: ({ color }) => <MaterialIcons name="qr-code-scanner" size={24} color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: 'Produtos', tabBarIcon: ({ color }) => <MaterialIcons name="inventory-2" size={24} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'Histórico', tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} /> }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favoritos', tabBarIcon: ({ color }) => <MaterialIcons name="favorite" size={24} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} /> }} />
    </Tabs>
  );
}
