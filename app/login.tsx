import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';
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
        <View style={styles.brandContainer}>
          <Image source={require('../assets/images/logo-ecotrack.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandText}>Saúde e Sustentabilidade</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}</Text>
          <Text style={styles.subtitle}>Acompanhe o impacto dos produtos que você consome.</Text>

          {mode === 'register' ? (
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nome" placeholderTextColor={BrandColors.textSecondary} />
          ) : null}
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={BrandColors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Senha"
            placeholderTextColor={BrandColors.textSecondary}
            autoCapitalize="none"
            secureTextEntry
          />

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
  safeArea: { flex: 1, backgroundColor: BrandColors.background },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 12 },
  brandContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 220, height: 170 },
  brandText: { fontSize: 16, color: BrandColors.darkGreen, fontWeight: '600' },
  card: {
    backgroundColor: BrandColors.surface,
    borderRadius: 24,
    padding: 24,
    gap: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  title: { fontSize: 29, fontWeight: '700', color: BrandColors.darkBlue },
  subtitle: { fontSize: 15, lineHeight: 22, color: BrandColors.textSecondary, marginBottom: 2 },
  input: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: BrandColors.textPrimary,
    backgroundColor: BrandColors.surface,
  },
  primaryButton: { backgroundColor: BrandColors.primaryGreen, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: BrandColors.surface, fontWeight: '700', fontSize: 16 },
  switchText: { textAlign: 'center', color: BrandColors.primaryBlue, fontWeight: '600' },
});
