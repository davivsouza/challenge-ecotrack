import { Platform } from 'react-native';

type ExpoNotifications = typeof import('expo-notifications');

let notificationsModule: ExpoNotifications | null = null;

interface ProductScannedNotificationData {
  type: 'product-scanned';
  productId: string;
}

export type ProductNotificationResponse = ProductScannedNotificationData;

async function getNotifications() {
  if (Platform.OS === 'web') return null;

  notificationsModule ??= await import('expo-notifications');
  notificationsModule.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  return notificationsModule;
}

export const notificationService = {
  async requestPermission() {
    const Notifications = await getNotifications();
    if (!Notifications) return false;

    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  },
  async notifyProductScanned(productName: string, productId: string) {
    const granted = await this.requestPermission();
    if (!granted) return;

    const Notifications = await getNotifications();
    if (!Notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Produto analisado',
        body: `${productName} foi salvo no seu histórico.`,
        data: {
          type: 'product-scanned',
          productId,
        } satisfies ProductScannedNotificationData,
      },
      trigger: null,
    });
  },
  async getLastProductNotificationResponse() {
    const Notifications = await getNotifications();
    if (!Notifications) return null;

    const response = await Notifications.getLastNotificationResponseAsync();
    return normalizeProductNotificationData(response?.notification.request.content.data);
  },
  async clearLastProductNotificationResponse() {
    const Notifications = await getNotifications();
    if (!Notifications) return;

    Notifications.clearLastNotificationResponse();
  },
  async addProductNotificationResponseListener(callback: (data: ProductNotificationResponse) => void) {
    const Notifications = await getNotifications();
    if (!Notifications) return null;

    return Notifications.addNotificationResponseReceivedListener((response) => {
      const data = normalizeProductNotificationData(response.notification.request.content.data);
      if (data) callback(data);
    });
  },
};

function normalizeProductNotificationData(data: Record<string, unknown> | undefined) {
  if (!data) return null;
  if (data.type !== 'product-scanned') return null;
  if (typeof data.productId !== 'string' || !data.productId) return null;

  return {
    type: data.type,
    productId: data.productId,
  } satisfies ProductNotificationResponse;
}
