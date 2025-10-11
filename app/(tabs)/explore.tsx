import { mockProducts } from '@/data/mockProducts';
import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ExploreScreen() {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <View style={styles.scoresContainer}>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreLabel}>Saúde</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(item.healthScore) }]}>
              {item.healthScore}
            </Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreLabel}>Sustentabilidade</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(item.sustainabilityScore) }]}>
              {item.sustainabilityScore}
            </Text>
          </View>
        </View>
        <View style={styles.packagingContainer}>
          <Text style={styles.packagingLabel}>Embalagem:</Text>
          <Text style={[styles.packagingType, { color: getScoreColor(item.environmentalImpact.sustainabilityScore) }]}>
            {item.environmentalImpact.packagingType}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar Produtos</Text>
        <Text style={styles.subtitle}>Descubra produtos sustentáveis</Text>
      </View>

      <FlatList
        data={mockProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  scoresContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  scoreBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  packagingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packagingLabel: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 4,
  },
  packagingType: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});