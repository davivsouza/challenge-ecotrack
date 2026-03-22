import { productService } from "@/services/productService";
import { Product } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function hasNutritionData(product: Product): boolean {
  return Object.values(product.nutritionalInfo).some((value) => value > 0);
}

function hasEnvironmentalData(product: Product): boolean {
  return (
    product.environmentalImpact.carbonFootprint > 0 ||
    product.environmentalImpact.waterUsage > 0 ||
    product.sustainabilityScore > 0
  );
}

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
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setLoading(true);
      const productData = await productService.getProductById(id);
      setProduct(productData);

      if (productData.alternatives && productData.alternatives.length > 0) {
        const altProducts = await Promise.all(
          productData.alternatives.slice(0, 3).map(async (altId: string) => {
            try {
              return await productService.getProductById(altId);
            } catch {
              return null;
            }
          }),
        );
        setAlternatives(
          altProducts.filter((item): item is Product => item !== null),
        );
      } else {
        setAlternatives([]);
      }
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      setProduct(null);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bom";
    if (score >= 40) return "Regular";
    return "Ruim";
  };

  const getSourceLabel = (source?: Product["dataSource"]) => {
    switch (source) {
      case "open_food_facts":
        return "Open Food Facts";
      case "cache":
        return "Cache local";
      default:
        return "API EcoTrack";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Carregando produto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Produto não encontrado</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageCard}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productBrand}>{product.brand}</Text>
          </View>

          <View style={styles.badgesRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>
                {getSourceLabel(product.dataSource)}
              </Text>
            </View>
            {product.nutriScore && (
              <View style={[styles.metaBadge, styles.nutriBadge]}>
                <Text style={styles.nutriBadgeText}>
                  Nutri-Score {product.nutriScore}
                </Text>
              </View>
            )}
            {product.environmentalImpact.ecoScoreGrade && (
              <View style={[styles.metaBadge, styles.ecoBadge]}>
                <Text style={styles.ecoBadgeText}>
                  Eco-Score {product.environmentalImpact.ecoScoreGrade}
                </Text>
              </View>
            )}
            {product.dataCompleteness === "partial" && (
              <View style={[styles.metaBadge, styles.partialBadge]}>
                <Text style={styles.partialBadgeText}>Dados parciais</Text>
              </View>
            )}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Código de barras</Text>
            <Text style={styles.infoValue}>
              {product.barcode || "Não informado"}
            </Text>
          </View>

          {product.dataCompleteness === "partial" && (
            <View style={styles.noticeCard}>
              <Text style={styles.noticeText}>
                Algumas informações deste item não estavam completas na fonte
                consultada. O app continua exibindo o que já foi encontrado com
                segurança.
              </Text>
            </View>
          )}

          <View style={styles.scoresContainer}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreTitle}>Saúde</Text>
              <Text
                style={[
                  styles.scoreValue,
                  { color: getScoreColor(product.healthScore) },
                ]}
              >
                {product.healthScore}
              </Text>
              <Text style={styles.scoreLabel}>
                {getScoreLabel(product.healthScore)}
              </Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreTitle}>Sustentabilidade</Text>
              <Text
                style={[
                  styles.scoreValue,
                  { color: getScoreColor(product.sustainabilityScore) },
                ]}
              >
                {product.sustainabilityScore}
              </Text>
              <Text style={styles.scoreLabel}>
                {getScoreLabel(product.sustainabilityScore)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Nutricionais</Text>
            {hasNutritionData(product) ? (
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {product.nutritionalInfo.calories}
                  </Text>
                  <Text style={styles.nutritionLabel}>Calorias</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {product.nutritionalInfo.protein}g
                  </Text>
                  <Text style={styles.nutritionLabel}>Proteína</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {product.nutritionalInfo.carbs}g
                  </Text>
                  <Text style={styles.nutritionLabel}>Carboidratos</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {product.nutritionalInfo.fat}g
                  </Text>
                  <Text style={styles.nutritionLabel}>Gordura</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {product.nutritionalInfo.sugar}g
                  </Text>
                  <Text style={styles.nutritionLabel}>Açúcar</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>
                    {product.nutritionalInfo.sodium}mg
                  </Text>
                  <Text style={styles.nutritionLabel}>Sódio</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>
                  Informação nutricional indisponível.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Impacto Ambiental</Text>
            {hasEnvironmentalData(product) ? (
              <View style={styles.environmentalInfo}>
                <View style={styles.environmentalItem}>
                  <Text style={styles.environmentalLabel}>
                    Pegada de carbono
                  </Text>
                  <Text style={styles.environmentalValue}>
                    {product.environmentalImpact.carbonFootprint} kg CO2
                  </Text>
                </View>
                <View style={styles.environmentalItem}>
                  <Text style={styles.environmentalLabel}>Uso de água</Text>
                  <Text style={styles.environmentalValue}>
                    {product.environmentalImpact.waterUsage}L
                  </Text>
                </View>
                <View style={styles.environmentalItem}>
                  <Text style={styles.environmentalLabel}>Embalagem</Text>
                  <Text style={styles.environmentalValue}>
                    {product.environmentalImpact.packagingType}
                  </Text>
                </View>
                {product.environmentalImpact.agribalyseScore ? (
                  <View style={styles.environmentalItem}>
                    <Text style={styles.environmentalLabel}>
                      Score Agribalyse
                    </Text>
                    <Text style={styles.environmentalValue}>
                      {product.environmentalImpact.agribalyseScore}
                    </Text>
                  </View>
                ) : null}
                {product.environmentalImpact.agribalyseReference ? (
                  <View style={styles.environmentalItem}>
                    <Text style={styles.environmentalLabel}>Referência</Text>
                    <Text style={styles.environmentalValueSmall}>
                      {product.environmentalImpact.agribalyseReference}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>
                  Impacto ambiental ainda não cadastrado.
                </Text>
              </View>
            )}
          </View>

          {(product.environmentalImpact.packagingMaterials?.length ||
            product.environmentalImpact.packagingComponents?.length) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalhes da Embalagem</Text>
              <View style={styles.textCard}>
                {product.environmentalImpact.packagingMaterials &&
                product.environmentalImpact.packagingMaterials.length > 0 ? (
                  <>
                    <Text style={styles.subsectionLabel}>Materiais</Text>
                    <View style={styles.categoriesRow}>
                      {product.environmentalImpact.packagingMaterials.map(
                        (material) => (
                          <View key={material} style={styles.categoryChip}>
                            <Text style={styles.categoryChipText}>
                              {material}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>
                  </>
                ) : null}

                {product.environmentalImpact.packagingComponents &&
                product.environmentalImpact.packagingComponents.length > 0 ? (
                  <>
                    <Text style={styles.subsectionLabel}>Componentes</Text>
                    <View style={styles.categoriesRow}>
                      {product.environmentalImpact.packagingComponents.map(
                        (component) => (
                          <View key={component} style={styles.packagingChip}>
                            <Text style={styles.packagingChipText}>
                              {component}
                            </Text>
                          </View>
                        ),
                      )}
                    </View>
                  </>
                ) : null}
              </View>
            </View>
          )}

          {(product.environmentalImpact.warnings?.length ||
            product.environmentalImpact.missingDataWarning) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alertas Ambientais</Text>
              <View style={styles.noticeCard}>
                {product.environmentalImpact.missingDataWarning ? (
                  <Text style={styles.noticeText}>
                    O Open Food Facts sinaliza que parte do impacto ambiental
                    foi calculada com dados incompletos.
                  </Text>
                ) : null}
                {product.environmentalImpact.warnings?.map((warning) => (
                  <Text key={warning} style={styles.noticeText}>
                    • {warning}
                  </Text>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
            <View style={styles.textCard}>
              <Text style={styles.textCardText}>
                {product.ingredients ||
                  "Ingredientes ainda não informados para este produto."}
              </Text>
            </View>
          </View>

          {product.categories && product.categories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categorias</Text>
              <View style={styles.categoriesRow}>
                {product.categories.slice(0, 6).map((category) => (
                  <View key={category} style={styles.categoryChip}>
                    <Text style={styles.categoryChipText}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

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
                    <Image
                      source={{ uri: altProduct.image }}
                      style={styles.alternativeImage}
                    />
                    <View style={styles.alternativeInfo}>
                      <Text style={styles.alternativeName}>
                        {altProduct.name}
                      </Text>
                      <Text style={styles.alternativeBrand}>
                        {altProduct.brand}
                      </Text>
                      <Text
                        style={[
                          styles.alternativeScore,
                          {
                            color: getScoreColor(
                              altProduct.sustainabilityScore,
                            ),
                          },
                        ]}
                      >
                        Sustentabilidade: {altProduct.sustainabilityScore}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#EF4444",
    marginBottom: 20,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#1E293B",
    fontSize: 15,
    fontWeight: "600",
  },
  imageCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 260,
    resizeMode: "cover",
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 18,
  },
  productName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 16,
    color: "#64748B",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  metaBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  metaBadgeText: {
    fontSize: 13,
    color: "#0C4A6E",
    fontWeight: "600",
  },
  nutriBadge: {
    backgroundColor: "#DCFCE7",
  },
  nutriBadgeText: {
    fontSize: 13,
    color: "#166534",
    fontWeight: "700",
  },
  partialBadge: {
    backgroundColor: "#FEF3C7",
  },
  partialBadgeText: {
    fontSize: 13,
    color: "#92400E",
    fontWeight: "600",
  },
  ecoBadge: {
    backgroundColor: "#DCFCE7",
  },
  ecoBadgeText: {
    fontSize: 13,
    color: "#166534",
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "600",
  },
  noticeCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  noticeText: {
    fontSize: 14,
    color: "#92400E",
    lineHeight: 20,
  },
  scoresContainer: {
    flexDirection: "row",
    marginBottom: 32,
    gap: 16,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreTitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  nutritionItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    width: (width - 64) / 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  environmentalInfo: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  environmentalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  environmentalLabel: {
    fontSize: 16,
    color: "#64748B",
    flex: 1,
    marginRight: 12,
  },
  environmentalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  environmentalValueSmall: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E3A8A",
    flex: 1,
    textAlign: "right",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyCardText: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
  },
  textCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  textCardText: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 24,
  },
  subsectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 10,
    marginTop: 4,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryChip: {
    backgroundColor: "#DBEAFE",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryChipText: {
    fontSize: 13,
    color: "#1D4ED8",
    fontWeight: "600",
  },
  packagingChip: {
    backgroundColor: "#ECFDF5",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  packagingChipText: {
    fontSize: 13,
    color: "#047857",
    fontWeight: "600",
  },
  alternativesContainer: {
    gap: 12,
  },
  alternativeItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    shadowColor: "#000",
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
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 4,
  },
  alternativeBrand: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  alternativeScore: {
    fontSize: 12,
    fontWeight: "600",
  },
});
