import { productService } from '@/services/productService';
import { Product } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const STORAGE_KEY = '@ecotrack_history';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const loadingRef = React.useRef(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async () => {
    // evita múltiplas chamadas simultâneas
    if (loadingRef.current) return;
    loadingRef.current = true;
    
    try {
      setLoading(true);
      const productData = await productService.getProductById(id);
      setProduct(productData);
      
      // carrega alternativas se existirem (limitado a 3 para evitar muitas requisições)
      if (productData.alternatives && productData.alternatives.length > 0) {
        // limita a 3 alternativas e busca sem impacto/nutrição para evitar loops
        const altProducts = await Promise.all(
          productData.alternatives.slice(0, 3).map(async (altId: string) => {
            try {
              const altData = await productService.getProductById(altId);
              return altData;
            } catch {
              return null;
            }
          })
        );
        setAlternatives(altProducts.filter(p => p !== null) as Product[]);
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      Alert.alert('Erro', 'Não foi possível carregar o produto');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const addToHistory = async () => {
    if (!product) return;

    try {
      const storedHistory = await AsyncStorage.getItem(STORAGE_KEY);
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      
      const newItem = {
        id: Date.now().toString(),
        productId: product.id,
        scannedAt: new Date().toISOString(),
        product
      };

      const updatedHistory = [newItem, ...history];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      
      Alert.alert('Sucesso', 'Produto adicionado ao histórico!');
    } catch (error) {
      console.error('Erro ao salvar no histórico:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    return 'Ruim';
  };

  const getPackagingColor = (type: string) => {
    switch (type) {
      case 'biodegradável': return '#10B981';
      case 'reciclável': return '#3B82F6';
      case 'papel': return '#F59E0B';
      case 'vidro': return '#8B5CF6';
      case 'plástico': return '#EF4444';
      default: return '#64748B';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Carregando produto...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Produto não encontrado</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
        </View>

        <View style={styles.scoresContainer}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Saúde</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(product.healthScore) }]}>
              {product.healthScore}
            </Text>
            <Text style={styles.scoreLabel}>{getScoreLabel(product.healthScore)}</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>Sustentabilidade</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(product.sustainabilityScore) }]}>
              {product.sustainabilityScore}
            </Text>
            <Text style={styles.scoreLabel}>{getScoreLabel(product.sustainabilityScore)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Nutricionais</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{product.nutritionalInfo.calories}</Text>
              <Text style={styles.nutritionLabel}>Calorias</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{product.nutritionalInfo.protein}g</Text>
              <Text style={styles.nutritionLabel}>Proteína</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{product.nutritionalInfo.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carboidratos</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{product.nutritionalInfo.fat}g</Text>
              <Text style={styles.nutritionLabel}>Gordura</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{product.nutritionalInfo.sugar}g</Text>
              <Text style={styles.nutritionLabel}>Açúcar</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{product.nutritionalInfo.sodium}mg</Text>
              <Text style={styles.nutritionLabel}>Sódio</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Impacto Ambiental</Text>
          <View style={styles.environmentalInfo}>
            <View style={styles.environmentalItem}>
              <Text style={styles.environmentalLabel}>Pegada de Carbono</Text>
              <Text style={styles.environmentalValue}>{product.environmentalImpact.carbonFootprint} kg CO₂</Text>
            </View>
            <View style={styles.environmentalItem}>
              <Text style={styles.environmentalLabel}>Uso de Água</Text>
              <Text style={styles.environmentalValue}>{product.environmentalImpact.waterUsage}L</Text>
            </View>
            <View style={styles.environmentalItem}>
              <Text style={styles.environmentalLabel}>Tipo de Embalagem</Text>
              <View style={[styles.packagingBadge, { backgroundColor: getPackagingColor(product.environmentalImpact.packagingType) }]}>
                <Text style={styles.packagingText}>{product.environmentalImpact.packagingType}</Text>
              </View>
            </View>
          </View>
        </View>

        {alternatives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alternativas Sustentáveis</Text>
            <View style={styles.alternativesContainer}>
              {alternatives.map((altProduct) => (
                <TouchableOpacity
                  key={altProduct.id}
                  style={styles.alternativeItem}
                  onPress={() => router.push(`/product/${altProduct.id}`)}
                >
                  <Image source={{ uri: altProduct.image }} style={styles.alternativeImage} />
                  <View style={styles.alternativeInfo}>
                    <Text style={styles.alternativeName}>{altProduct.name}</Text>
                    <Text style={styles.alternativeBrand}>{altProduct.brand}</Text>
                    <View style={styles.alternativeScores}>
                      <Text style={[styles.alternativeScore, { color: getScoreColor(altProduct.sustainabilityScore) }]}>
                        Sustentabilidade: {altProduct.sustainabilityScore}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.addToHistoryButton}
          onPress={addToHistory}
        >
          <Text style={styles.addToHistoryButtonText}>Adicionar ao Histórico</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 16,
    color: '#64748B',
  },
  scoresContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 16,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: (width - 64) / 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  environmentalInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  environmentalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  environmentalLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  environmentalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  packagingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  packagingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  alternativesContainer: {
    gap: 12,
  },
  alternativeItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alternativeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  alternativeInfo: {
    flex: 1,
  },
  alternativeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  alternativeBrand: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  alternativeScores: {
    flexDirection: 'row',
  },
  alternativeScore: {
    fontSize: 12,
    fontWeight: '600',
  },
  addToHistoryButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  addToHistoryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
