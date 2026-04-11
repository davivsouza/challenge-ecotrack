import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCreateFavorite, useFavorites, useProduct } from '@/hooks/useProducts';

type ImpactLevel = 'BAIXO' | 'MEDIO' | 'ALTO' | 'DESCONHECIDO';

const IMPACT_THEME: Record<ImpactLevel, { accent: string; background: string; border: string; chip: string }> = {
  BAIXO: { accent: '#047857', background: '#ECFDF5', border: '#86EFAC', chip: '#D1FAE5' },
  MEDIO: { accent: '#B45309', background: '#FFFBEB', border: '#FCD34D', chip: '#FEF3C7' },
  ALTO: { accent: '#B91C1C', background: '#FEF2F2', border: '#FCA5A5', chip: '#FEE2E2' },
  DESCONHECIDO: { accent: '#475569', background: '#F1F5F9', border: '#CBD5E1', chip: '#E2E8F0' },
};

const normalizeImpactLevel = (value?: string | null): ImpactLevel => {
  if (value === 'BAIXO' || value === 'MEDIO' || value === 'ALTO' || value === 'DESCONHECIDO') return value;
  return 'DESCONHECIDO';
};

const formatDataSource = (value?: string) => {
  if (value === 'open-food-facts' || value === 'open_food_facts') return 'Open Food Facts';
  if (value === 'cache') return 'Cache local';
  return 'API principal';
};

const formatCo2 = (value: number | null) => (value === null ? 'CO2: N/D' : `CO2: ${value.toFixed(2)} kg`);

const formatWater = (value: number | null) => (value === null ? 'Água: N/D' : `Água: ${value.toFixed(0)} L`);

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id ?? '');
  const { data: favorites } = useFavorites();
  const createFavorite = useCreateFavorite();

  if (isLoading) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View></SafeAreaView>;
  }

  if (!product) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.center}><Text>Produto não encontrado.</Text></View></SafeAreaView>;
  }

  const isFavorite = Boolean(favorites?.some((item) => item.productId === product.id));
  const impactLevel = normalizeImpactLevel(product.environmentalImpact.environmentalImpactLevel);
  const impactTheme = IMPACT_THEME[impactLevel];
  const ecoScore = product.environmentalImpact.ecoScoreGrade?.toUpperCase() ?? 'N/D';
  const contextMessages = [
    product.environmentalImpact.waterUsage === null ? 'Água não informada pela base externa.' : null,
    product.environmentalImpact.carbonFootprint === null ? 'CO2 não informado pela base externa.' : null,
    impactLevel === 'DESCONHECIDO' ? 'Nível ambiental definido como DESCONHECIDO por falta de base confiável.' : null,
  ].filter(Boolean) as string[];

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
          <Text style={styles.info}>Fonte: {formatDataSource(product.dataSource)}</Text>
          <Text style={styles.info}>
            Integridade dos dados: {typeof product.dataCompleteness === 'number' ? `${product.dataCompleteness}%` : product.dataCompleteness || 'N/D'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nutrição</Text>
          <Text style={styles.info}>Calorias: {product.nutritionalInfo.calories}</Text>
          <Text style={styles.info}>Proteína: {product.nutritionalInfo.protein}g</Text>
          <Text style={styles.info}>Carboidratos: {product.nutritionalInfo.carbs}g</Text>
          <Text style={styles.info}>Gorduras: {product.nutritionalInfo.fat}g</Text>
        </View>

        <View style={[styles.impactCard, { backgroundColor: impactTheme.background, borderColor: impactTheme.border }]}>
          <View style={styles.impactTitleRow}>
            <Ionicons name="leaf-outline" size={18} color={impactTheme.accent} />
            <Text style={styles.sectionTitle}>Impacto Ambiental</Text>
          </View>

          <View style={styles.levelBlock}>
            <Text style={styles.levelCaption}>Nível estimado</Text>
            <Text style={[styles.levelValue, { color: impactTheme.accent }]}>{impactLevel}</Text>
            <Text style={styles.levelCaption}>Score de sustentabilidade</Text>
            <Text style={[styles.impactScore, { color: impactTheme.accent }]}>{product.sustainabilityScore}</Text>
          </View>

          <View style={styles.chipsRow}>
            <View style={[styles.impactChip, { backgroundColor: impactTheme.chip }]}>
              <Ionicons name="cloud-outline" size={14} color={impactTheme.accent} />
              <Text style={[styles.impactChipText, { color: impactTheme.accent }]}>{formatCo2(product.environmentalImpact.carbonFootprint)}</Text>
            </View>
            <View style={[styles.impactChip, { backgroundColor: impactTheme.chip }]}>
              <Ionicons name="leaf-outline" size={14} color={impactTheme.accent} />
              <Text style={[styles.impactChipText, { color: impactTheme.accent }]}>EcoScore: {ecoScore}</Text>
            </View>
            <View style={[styles.impactChip, { backgroundColor: impactTheme.chip }]}>
              <Ionicons name="water-outline" size={14} color={impactTheme.accent} />
              <Text style={[styles.impactChipText, { color: impactTheme.accent }]}>{formatWater(product.environmentalImpact.waterUsage)}</Text>
            </View>
          </View>

          <Text style={styles.info}>Embalagem: {product.environmentalImpact.packagingType || 'não informado'}</Text>
          {contextMessages.map((message) => (
            <Text key={message} style={styles.contextMessage}>{message}</Text>
          ))}
        </View>

        <Pressable style={[styles.button, isFavorite && styles.buttonDisabled]} onPress={handleFavorite}>
          <Text style={styles.buttonText}>{isFavorite ? 'Já está nos favoritos' : 'Adicionar aos favoritos'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 20, gap: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 220, borderRadius: 20, backgroundColor: '#ddd' },
  title: { fontSize: 26, fontWeight: '700', color: '#1E3A8A' },
  subtitle: { color: '#64748B' },
  scoreRow: { flexDirection: 'row', gap: 12 },
  scoreCard: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 18, alignItems: 'center' },
  scoreLabel: { color: '#64748B' },
  scoreValue: { fontSize: 28, fontWeight: '700', color: '#2563EB' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, gap: 8 },
  impactCard: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 12 },
  impactTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelBlock: { alignItems: 'flex-start' },
  levelCaption: { color: '#64748B', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  levelValue: { fontSize: 32, fontWeight: '800', marginTop: 2, marginBottom: 8 },
  impactScore: { fontSize: 26, fontWeight: '800', marginTop: 2 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  impactChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  impactChipText: { fontWeight: '700', fontSize: 12 },
  sectionTitle: { fontWeight: '700', color: '#1E3A8A' },
  info: { color: '#64748B' },
  contextMessage: { color: '#475569', fontSize: 12 },
  button: { backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#94A3B8' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
