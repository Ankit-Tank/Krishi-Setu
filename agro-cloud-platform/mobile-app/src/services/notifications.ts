import { Platform } from 'react-native';
import i18n from '../i18n';

let scheduleNotificationAsync: any = null;
let setNotificationHandler: any = null;

try {
  if (Platform.OS !== 'web') {
    try {
      scheduleNotificationAsync = require('expo-notifications/build/scheduleNotificationAsync')?.default;
      setNotificationHandler = require('expo-notifications/build/NotificationsHandler')?.setNotificationHandler;

      if (setNotificationHandler) {
        setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });
      }
    } catch (innerErr) {
      console.warn('Expo Go local notifications not supported or restricted in this client.');
    }
  }
} catch (e) {
  console.warn('Expo Notifications fallback mode active.');
}

export const NotificationService = {
  async scheduleAdvisoryNotification(title: string, body: string, urgency: 'high' | 'normal' = 'high') {
    try {
      if (Platform.OS === 'web' || !scheduleNotificationAsync) {
        console.log(`[Notification Local Trigger] ${title}: ${body}`);
        return;
      }

      await scheduleNotificationAsync({
        content: {
          title: `🌱 Krishi Setu Alert: ${title}`,
          body: body,
          data: { urgency },
        },
        trigger: null, // trigger immediately
      });
    } catch (err) {
      console.warn('Could not schedule notification:', err);
    }
  },

  async triggerDiseaseAlert(diseaseName: string, advisoryText: string) {
    const title = i18n.t('disease.title', 'Disease Alert');
    const body = `${diseaseName}: ${advisoryText}`;
    await this.scheduleAdvisoryNotification(title, body, 'high');
  },

  async triggerIrrigationAlert(farmName: string, adviceText: string) {
    const title = i18n.t('dashboard.statusIrrigation', 'Irrigation Alert');
    const body = `${farmName}: ${adviceText}`;
    await this.scheduleAdvisoryNotification(title, body, 'high');
  }
};
