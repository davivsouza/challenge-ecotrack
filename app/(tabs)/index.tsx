import { productService } from '@/services/productService';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ScanScreen() {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!barcode.trim()) {
      Alert.alert('Erro', 'Digite um código de barras primeiro');
      return;
    }
    
    setLoading(true);
    
    try {
      const product = await productService.getProductByBarcode(barcode);
      router.push(`/product/${product.id}`);
    } catch (error) {
      Alert.alert('Produto não encontrado', error instanceof Error ? error.message : 'Este produto não está em nossa base de dados');
    } finally {
      setLoading(false);
    }
  };

  const handleManualBarcode = async () => {
    if (!barcode.trim()) {
      Alert.alert('Erro', 'Digite um código de barras');
      return;
    }

    setLoading(true);
    
    try {
      const product = await productService.getProductByBarcode(barcode);
      router.push(`/product/${product.id}`);
    } catch (error) {
      Alert.alert('Produto não encontrado', error instanceof Error ? error.message : 'Este produto não está em nossa base de dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>EcoTrack</Text>
        <Text style={styles.subtitle}>Escaneie um produto para ver seu impacto</Text>
      </View>

      <View style={styles.scanContainer}>
        <View style={styles.scannerFrame}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1569163139394-de44662a1e98?w=300' }}
            style={styles.scannerImage}
          />
          <View style={styles.scannerOverlay}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.scanButton, loading && styles.scanButtonDisabled]}
          onPress={() => handleScan()}
          disabled={loading}
        >
          <Text style={styles.scanButtonText}>
            {loading ? 'Escaneando...' : 'Escanear Produto'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>ou</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.manualContainer}>
        <Text style={styles.manualTitle}>Digite o código de barras</Text>
        <TextInput
          style={styles.barcodeInput}
          placeholder="Ex: 7891234567890"
          value={barcode}
          onChangeText={setBarcode}
          keyboardType="numeric"
          maxLength={13}
        />
        <TouchableOpacity
          style={[styles.manualButton, loading && styles.manualButtonDisabled]}
          onPress={handleManualBarcode}
          disabled={loading}
        >
          <Text style={styles.manualButtonText}>
            {loading ? 'Buscando...' : 'Buscar Produto'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Dicas:</Text>
        <Text style={styles.tipText}>• Digite ou escaneie um código de barras válido</Text>
        <Text style={styles.tipText}>• Posicione o código de barras dentro do quadro</Text>
        <Text style={styles.tipText}>• Mantenha o dispositivo estável</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  scanContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scannerFrame: {
    width: 280,
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  scannerImage: {
    width: '100%',
    height: '100%',
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#10B981',
    borderWidth: 3,
  },
  topLeft: {
    top: 20,
    left: 20,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 20,
    right: 20,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 20,
    left: 20,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 20,
    right: 20,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
  },
  scanButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 20,
    color: '#64748B',
    fontSize: 16,
  },
  manualContainer: {
    marginBottom: 30,
  },
  manualTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 12,
    textAlign: 'center',
  },
  barcodeInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    textAlign: 'center',
  },
  manualButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  manualButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  manualButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  tips: {
    backgroundColor: '#E6F4FE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
    lineHeight: 20,
  },
});