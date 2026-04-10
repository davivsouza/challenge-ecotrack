import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDeleteHistory, useHistory, useUpdateHistory } from '@/hooks/useProducts';

export default function HistoryScreen() {
  const { data, isLoading, refetch, isRefetching } = useHistory();
  const updateHistory = useUpdateHistory();
  const deleteHistory = useDeleteHistory();

  const toggleNote = async (id: string, note?: string) => {
    await updateHistory.mutateAsync({ id, note: note ? '' : 'Produto revisado pelo usuário.' });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Excluir registro', 'Deseja remover este item do histórico?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => void deleteHistory.mutateAsync(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Histórico</Text>
        <FlatList
          data={data ?? []}
          onRefresh={refetch}
          refreshing={isRefetching}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.product?.name ?? 'Produto indisponível'}</Text>
              <Text style={styles.meta}>{new Date(item.scannedAt).toLocaleString('pt-BR')}</Text>
              <Text style={styles.note}>{item.note || 'Sem anotação.'}</Text>
              <View style={styles.row}>
                <Pressable style={styles.secondaryButton} onPress={() => void toggleNote(item.id, item.note)}>
                  <Text style={styles.secondaryText}>{item.note ? 'Limpar nota' : 'Adicionar nota'}</Text>
                </Pressable>
                <Pressable style={styles.dangerButton} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.primaryText}>Excluir</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>{isLoading ? 'Carregando...' : 'Nenhum item no histórico.'}</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7f6' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#163d2e' },
  subtitle: { color: '#52625a', lineHeight: 22, marginVertical: 10 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 12, gap: 8 },
  name: { fontWeight: '700', color: '#163d2e' },
  meta: { color: '#52625a' },
  note: { color: '#163d2e' },
  row: { flexDirection: 'row', gap: 10, marginTop: 8 },
  secondaryButton: { flex: 1, borderWidth: 1, borderColor: '#1D7C4D', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  secondaryText: { color: '#1D7C4D', fontWeight: '700' },
  dangerButton: { flex: 1, backgroundColor: '#c03b34', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },
  empty: { marginTop: 32, textAlign: 'center', color: '#52625a' },
});
