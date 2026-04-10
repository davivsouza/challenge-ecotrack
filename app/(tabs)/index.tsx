import { router } from 'expo-router';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCreateHistory, useLookupProduct } from '@/hooks/useProducts';
import { notificationService } from '@/services/notificationService';

export default function ScanScreen() {
  const [barcode, setBarcode] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const lookupProduct = useLookupProduct();
  const createHistory = useCreateHistory();
  const loading = lookupProduct.isPending || createHistory.isPending;

  const scanLockRef = useRef(false);
  const scannerActiveRef = useRef(false);
  const scannerSessionRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!scannerOpen) {
      setHasScanned(false);
    }
  }, [scannerOpen]);

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const lookupAndOpenProduct = async (rawBarcode: string) => {
    const value = rawBarcode.trim();
    if (!value) {
      Alert.alert('Erro', 'Digite ou escaneie um código de barras.');
      return;
    }

    try {
      const product = await lookupProduct.mutateAsync(value);
      await createHistory.mutateAsync({ productId: product.id });
      await notificationService.notifyProductScanned(product.name);

      if (!mountedRef.current) return;
      setBarcode(product.barcode || value);
      router.push(`/product/${product.id}`);
    } catch (error) {
      if (!mountedRef.current) return;
      Alert.alert(
        'Produto não encontrado',
        error instanceof Error ? error.message : 'Este produto não está disponível no momento.',
      );
    } finally {
      scanLockRef.current = false;
    }
  };

  const handleManualBarcode = async () => {
    await lookupAndOpenProduct(barcode);
  };

  const handleOpenScanner = async () => {
    if (loading) return;

    if (scannerOpen) {
      scannerSessionRef.current += 1;
      scanLockRef.current = false;
      scannerActiveRef.current = false;
      setScannerOpen(false);
      setHasScanned(false);
      return;
    }

    const response = permission?.granted ? permission : await requestPermission();
    if (!response?.granted) {
      Alert.alert('Permissão necessária', 'Autorize a câmera para escanear códigos de barras de produtos.');
      return;
    }

    setHasScanned(false);
    scanLockRef.current = false;
    scannerActiveRef.current = true;
    scannerSessionRef.current += 1;
    setScannerOpen(true);
  };

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (!data || loading || hasScanned || scanLockRef.current || !scannerActiveRef.current) return;

    const activeSession = scannerSessionRef.current;
    scanLockRef.current = true;
    scannerActiveRef.current = false;
    setHasScanned(true);
    setScannerOpen(false);
    setBarcode(data);

    if (activeSession !== scannerSessionRef.current) {
      scanLockRef.current = false;
      return;
    }

    await lookupAndOpenProduct(data);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>EcoTrack</Text>
          <Text style={styles.subtitle}>Escaneie um produto para ver impacto e nutrição</Text>
        </View>

        <View style={styles.scanContainer}>
          <View style={styles.scannerFrame}>
            {scannerOpen ? (
              <>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  autofocus="on"
                  onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
                  barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'itf14', 'codabar'] }}
                />
                <View style={styles.scannerOverlay}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                  <View style={styles.scanLine} />
                </View>
              </>
            ) : (
              <View style={styles.scannerPlaceholder}>
                <Text style={styles.placeholderTitle}>Scanner de código de barras</Text>
                <Text style={styles.placeholderText}>Abra a câmera e alinhe o código dentro do quadro para buscar o produto.</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={[styles.scanButton, loading && styles.scanButtonDisabled]} onPress={() => void handleOpenScanner()} disabled={loading}>
            <Text style={styles.scanButtonText}>{loading ? 'Buscando produto...' : scannerOpen ? 'Fechar Scanner' : 'Abrir Scanner'}</Text>
          </TouchableOpacity>

          {permission && !permission.granted ? (
            <Text style={styles.permissionText}>O acesso à câmera é necessário para escanear automaticamente.</Text>
          ) : null}
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
            placeholder="Ex: 7891000100103"
            value={barcode}
            onChangeText={setBarcode}
            keyboardType="number-pad"
            maxLength={14}
          />
          <TouchableOpacity style={[styles.manualButton, loading && styles.manualButtonDisabled]} onPress={() => void handleManualBarcode()} disabled={loading}>
            <Text style={styles.manualButtonText}>{loading ? 'Buscando...' : 'Buscar Produto'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 28,
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
    lineHeight: 22,
  },
  scanContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scannerFrame: {
    width: 300,
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
    backgroundColor: '#DCEAFD',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  scannerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#E6F4FE',
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 12,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
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
    width: 32,
    height: 32,
    borderColor: '#10B981',
    borderWidth: 4,
  },
  topLeft: {
    top: 22,
    left: 22,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 22,
    right: 22,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 22,
    left: 22,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 22,
    right: 22,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 42,
    right: 42,
    top: '50%',
    height: 2,
    backgroundColor: '#22C55E',
    opacity: 0.85,
  },
  scanButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 28,
    minWidth: 210,
  },
  scanButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  permissionText: {
    marginTop: 12,
    fontSize: 13,
    color: '#B45309',
    textAlign: 'center',
    lineHeight: 18,
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
    marginBottom: 28,
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
    borderColor: '#D7E2F0',
    textAlign: 'center',
    color: '#0F172A',
  },
  manualButton: {
    backgroundColor: '#2563EB',
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
});
