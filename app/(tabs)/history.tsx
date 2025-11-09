import { historyService } from '@/services/historyService';
import { getAuthUser } from '@/services/api';
import { ScanHistory } from '@/types';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HistoryScreen() {
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  // recarrega o histórico sempre que a tela receber foco
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      // tenta carregar da api primeiro, depois do local
      try {
        const user = await getAuthUser();
        if (user?.email) {
          const apiHistory = await historyService.getApiHistory(user.email);
          if (apiHistory.length > 0) {
            setHistory(apiHistory);
            setLoading(false);
            return;
          }
        }
      } catch (apiError) {
        console.warn('Erro ao carregar da API, usando histórico local');
      }

      // fallback para histórico local
      const localHistory = await historyService.getLocalHistory();
      setHistory(localHistory);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja limpar todo o histórico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await historyService.clearHistory();
              setHistory([]);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível limpar o histórico');
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `${diffDays - 1} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const renderHistoryItem = ({ item }: { item: ScanHistory }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => router.push(`/product/${item.product.id}`)}
    >
      {/* <Image source={{ uri: item.product.image }} style={styles.productImage} /> */}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.product.name}</Text>
        <Text style={styles.productBrand}>{item.product.brand}</Text>
        <View style={styles.scoresContainer}>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreLabel}>Saúde</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(item.product.healthScore) }]}>
              {item.product.healthScore}
            </Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreLabel}>Sustentabilidade</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(item.product.sustainabilityScore) }]}>
              {item.product.sustainabilityScore}
            </Text>
          </View>
        </View>
        <Text style={styles.scanDate}>{formatDate(item.scannedAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Escaneamentos</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nenhum produto escaneado</Text>
          <Text style={styles.emptySubtitle}>
            Escaneie produtos para ver seu histórico aqui
          </Text>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.scanButtonText}>Escanear Produto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  clearButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  scanButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 25,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 8,
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
  scanDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
