import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/auth-provider';

export default function LoginScreen() {
  const { signIn, signUp, user, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@ecotrack.com');
  const [password, setPassword] = useState('123456');
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
          <Text style={styles.subtitle}>Login real com persistência de sessão, navegação protegida e integração HTTP.</Text>

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

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Conta pronta para testes</Text>
            <Text style={styles.demoText}>Email: demo@ecotrack.com</Text>
            <Text style={styles.demoText}>Senha: 123456</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F7F4' },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, gap: 14, elevation: 3 },
  title: { fontSize: 32, fontWeight: '700', color: '#123524' },
  subtitle: { fontSize: 15, lineHeight: 22, color: '#52625a' },
  input: { borderWidth: 1, borderColor: '#d4dfd8', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16 },
  primaryButton: { backgroundColor: '#1D7C4D', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchText: { textAlign: 'center', color: '#1D7C4D', fontWeight: '600' },
  demoBox: { backgroundColor: '#eef7f1', padding: 16, borderRadius: 16, gap: 4 },
  demoTitle: { fontWeight: '700', color: '#123524' },
  demoText: { color: '#52625a' },
});
