import Constants from 'expo-constants';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const commitHash = process.env.EXPO_PUBLIC_APP_COMMIT ?? 'dev-build';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Sobre o app</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Versão</Text>
          <Text style={styles.value}>{version}</Text>
          <Text style={styles.label}>Commit de referência</Text>
          <Text style={styles.value}>{commitHash}</Text>
          <Text style={styles.description}>Esta tela atende ao requisito da Sprint 4 de identificação explícita da versão publicada.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7f6' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#163d2e', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 10 },
  label: { fontWeight: '700', color: '#163d2e' },
  value: { color: '#52625a' },
  description: { marginTop: 8, color: '#52625a', lineHeight: 22 },
});
