import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/auth-provider';

export default function LoginScreen() {
  const { signIn, signUp, user, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && user) return <Redirect href="/(tabs)" />;

  const handleSubmit = async () => {
    if (!email || !password || (mode === 'register' && !name)) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos antes de continuar.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signIn({ email, password });
      } else {
        await signUp({ name, email, password });
      }
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível concluir a autenticação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <Text style={styles.title}>EcoTrack</Text>

          {mode === 'register' ? (
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nome" />
          ) : null}
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Senha" autoCapitalize="none" secureTextEntry />

          <Pressable style={styles.primaryButton} onPress={handleSubmit} disabled={submitting}>
            <Text style={styles.primaryText}>{submitting ? 'Carregando...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</Text>
          </Pressable>

          <Pressable onPress={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}>
            <Text style={styles.switchText}>{mode === 'login' ? 'Ainda não tem conta? Cadastre-se.' : 'Já possui conta? Faça login.'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#E6F4FE' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, gap: 14, elevation: 3 },
  title: { fontSize: 32, fontWeight: '700', color: '#1E3A8A' },
  subtitle: { fontSize: 15, lineHeight: 22, color: '#64748B' },
  input: { borderWidth: 1, borderColor: '#D7E2F0', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16 },
  primaryButton: { backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchText: { textAlign: 'center', color: '#2563EB', fontWeight: '600' },
});
