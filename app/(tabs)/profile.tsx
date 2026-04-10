import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/auth-provider';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Perfil</Text>
        <View style={styles.card}>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/profile/about')}>
          <Text style={styles.secondaryText}>Sobre o app / versão</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={() => void signOut()}>
          <Text style={styles.primaryText}>Sair</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 20, gap: 14 },
  title: { fontSize: 28, fontWeight: '700', color: '#1E3A8A' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 8 },
  name: { fontSize: 18, fontWeight: '700', color: '#1E3A8A' },
  email: { color: '#64748B' },
  secondaryButton: { borderWidth: 1, borderColor: '#2563EB', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  secondaryText: { color: '#2563EB', fontWeight: '700' },
  primaryButton: { backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },
});
