import { Platform } from 'react-native';

type ExpoNotifications = typeof import('expo-notifications');

let notificationsModule: ExpoNotifications | null = null;

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
  async notifyProductScanned(productName: string) {
    const granted = await this.requestPermission();
    if (!granted) return;

    const Notifications = await getNotifications();
    if (!Notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Produto analisado',
        body: `${productName} foi salvo no seu histórico.`,
      },
      trigger: null,
    });
  },
};
