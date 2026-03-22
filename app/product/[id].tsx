import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCreateFavorite, useFavorites, useProduct } from '@/hooks/useProducts';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id ?? '');
  const { data: favorites } = useFavorites();
  const createFavorite = useCreateFavorite();

  if (isLoading) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator size="large" color="#1D7C4D" /></View></SafeAreaView>;
  }

  if (!product) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text>Produto não encontrado.</Text></View></SafeAreaView>;
  }

  const isFavorite = Boolean(favorites?.some((item) => item.productId === product.id));

  const handleFavorite = async () => {
    try {
      if (isFavorite) {
        Alert.alert('Favorito já salvo', 'Edite ou remova o item na aba Favoritos.');
        return;
      }
      await createFavorite.mutateAsync({ productId: product.id });
      Alert.alert('Favoritado', 'O produto foi salvo com sucesso.');
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível salvar o favorito.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()}><Text style={styles.back}>← Voltar</Text></Pressable>
        <Image source={{ uri: product.image }} style={styles.image} />
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.subtitle}>{product.brand}</Text>

        <View style={styles.scoreRow}>
          <View style={styles.scoreCard}><Text style={styles.scoreLabel}>Saúde</Text><Text style={styles.scoreValue}>{product.healthScore}</Text></View>
          <View style={styles.scoreCard}><Text style={styles.scoreLabel}>Sustentabilidade</Text><Text style={styles.scoreValue}>{product.sustainabilityScore}</Text></View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informações do produto</Text>
          <Text style={styles.info}>Código: {product.barcode}</Text>
          <Text style={styles.info}>Categorias: {product.categories?.join(', ') || 'Não informado'}</Text>
          <Text style={styles.info}>Nutri-Score: {product.nutriScore || 'N/A'}</Text>
          <Text style={styles.info}>Fonte: {product.dataSource || 'api'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nutrição</Text>
          <Text style={styles.info}>Calorias: {product.nutritionalInfo.calories}</Text>
          <Text style={styles.info}>Proteína: {product.nutritionalInfo.protein}g</Text>
          <Text style={styles.info}>Carboidratos: {product.nutritionalInfo.carbs}g</Text>
          <Text style={styles.info}>Gorduras: {product.nutritionalInfo.fat}g</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Impacto ambiental</Text>
          <Text style={styles.info}>CO₂ por unidade: {product.environmentalImpact.carbonFootprint}</Text>
          <Text style={styles.info}>Uso de água: {product.environmentalImpact.waterUsage}L</Text>
          <Text style={styles.info}>Embalagem: {product.environmentalImpact.packagingType}</Text>
        </View>

        <Pressable style={[styles.button, isFavorite && styles.buttonDisabled]} onPress={handleFavorite}>
          <Text style={styles.buttonText}>{isFavorite ? 'Já está nos favoritos' : 'Adicionar aos favoritos'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7f6' },
  container: { padding: 20, gap: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  back: { color: '#1D7C4D', fontWeight: '700' },
  image: { width: '100%', height: 220, borderRadius: 20, backgroundColor: '#ddd' },
  title: { fontSize: 26, fontWeight: '700', color: '#163d2e' },
  subtitle: { color: '#52625a' },
  scoreRow: { flexDirection: 'row', gap: 12 },
  scoreCard: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 18, alignItems: 'center' },
  scoreLabel: { color: '#52625a' },
  scoreValue: { fontSize: 28, fontWeight: '700', color: '#1D7C4D' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, gap: 8 },
  sectionTitle: { fontWeight: '700', color: '#163d2e' },
  info: { color: '#52625a' },
  button: { backgroundColor: '#1D7C4D', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#6d8b7b' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
