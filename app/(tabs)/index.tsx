import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { notificationService } from '@/services/notificationService';
import { useCreateHistory, useLookupProduct } from '@/hooks/useProducts';

export default function ScanScreen() {
  const [barcode, setBarcode] = useState('7891234567890');
  const lookupProduct = useLookupProduct();
  const createHistory = useCreateHistory();

  const handleScan = async () => {
    try {
      const product = await lookupProduct.mutateAsync(barcode.trim());
      await createHistory.mutateAsync({ productId: product.id });
      await notificationService.notifyProductScanned(product.name);
      router.push(`/product/${product.id}`);
    } catch (error) {
      Alert.alert('Falha ao consultar o produto', error instanceof Error ? error.message : 'Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Escanear produto</Text>
        <Text style={styles.subtitle}>Nesta sprint o fluxo é real: busca HTTP, gravação no histórico pela API e atualização automática via TanStack Query.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Código de barras</Text>
          <TextInput style={styles.input} value={barcode} onChangeText={setBarcode} keyboardType="number-pad" placeholder="Ex.: 7891234567890" />
          <Pressable style={styles.button} onPress={handleScan} disabled={lookupProduct.isPending || createHistory.isPending}>
            <Text style={styles.buttonText}>{lookupProduct.isPending || createHistory.isPending ? 'Processando...' : 'Consultar produto'}</Text>
          </Pressable>
        </View>

        <View style={styles.helper}>
          <Text style={styles.helperTitle}>Sugestões para teste</Text>
          {['7891234567890', '7891234567892', '7891234567893', '7891234567894'].map((item) => (
            <Pressable key={item} onPress={() => setBarcode(item)} style={styles.codeChip}>
              <Text style={styles.codeText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7f6' },
  container: { padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#163d2e' },
  subtitle: { color: '#52625a', lineHeight: 22 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 20, gap: 12 },
  label: { fontWeight: '700', color: '#163d2e' },
  input: { borderWidth: 1, borderColor: '#cfdad4', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: '#fbfcfb' },
  button: { backgroundColor: '#1D7C4D', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  helper: { backgroundColor: '#fff', padding: 20, borderRadius: 20, gap: 10 },
  helperTitle: { fontWeight: '700', color: '#163d2e' },
  codeChip: { padding: 12, borderRadius: 14, backgroundColor: '#eef7f1' },
  codeText: { color: '#1D7C4D', fontWeight: '600' },
});
