import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProducts } from '@/hooks/useProducts';

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch, isRefetching } = useProducts(search);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Catálogo</Text>
        <TextInput value={search} onChangeText={setSearch} placeholder="Buscar por nome, marca ou categoria" style={styles.input} />
        {isLoading ? <ActivityIndicator size="large" color="#2563EB" /> : null}
        <FlatList
          data={data ?? []}
          onRefresh={refetch}
          refreshing={isRefetching}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => router.push(`/product/${item.id}`)}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.brand}>{item.brand}</Text>
              <Text style={styles.meta}>Saúde {item.healthScore} • Sustentabilidade {item.sustainabilityScore}</Text>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum produto encontrado.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#1E3A8A' },
  input: { borderWidth: 1, borderColor: '#D7E2F0', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 12 },
  name: { fontWeight: '700', fontSize: 16, color: '#1E3A8A' },
  brand: { color: '#64748B', marginTop: 4 },
  meta: { marginTop: 8, color: '#2563EB', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#64748B', marginTop: 32 },
});
