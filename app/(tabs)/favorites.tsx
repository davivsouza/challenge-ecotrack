import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDeleteFavorite, useFavorites, useUpdateFavorite } from '@/hooks/useProducts';

export default function FavoritesScreen() {
  const { data, isLoading, refetch, isRefetching } = useFavorites();
  const updateFavorite = useUpdateFavorite();
  const deleteFavorite = useDeleteFavorite();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Favoritos</Text>
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.product?.name ?? 'Produto indisponível'}</Text>
              <Text style={styles.meta}>{item.product?.brand ?? ''}</Text>
              <Text style={styles.note}>{item.note || 'Sem observação.'}</Text>
              <View style={styles.row}>
                <Pressable style={styles.secondaryButton} onPress={() => void updateFavorite.mutateAsync({ id: item.id, note: item.note ? '' : 'Quero comprar novamente.' })}>
                  <Text style={styles.secondaryText}>{item.note ? 'Limpar nota' : 'Salvar nota'}</Text>
                </Pressable>
                <Pressable style={styles.dangerButton} onPress={() => Alert.alert('Remover favorito', 'Deseja remover este favorito?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Remover', style: 'destructive', onPress: () => void deleteFavorite.mutateAsync(item.id) }])}>
                  <Text style={styles.primaryText}>Remover</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>{isLoading ? 'Carregando...' : 'Nenhum favorito salvo.'}</Text>}
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
