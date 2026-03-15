import * as Notifications from 'expo-notifications';
import { Platform, Linking } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  // Request permissions for push notifications
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  // Get push notification token (for FCM)
  async getExpoPushToken(): Promise<string | null> {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch {
      return null;
    }
  },

  // Schedule a local notification
  async scheduleLocalNotification(params: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    triggerDate: Date;
  }): Promise<string> {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: params.title,
        body: params.body,
        data: params.data || {},
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: params.triggerDate,
      },
    });
    return id;
  },

  // Schedule appointment reminder (1 day before)
  async scheduleAppointmentReminderDayBefore(params: {
    appointmentId: string;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    locationName: string;
  }): Promise<string | null> {
    const appointmentDateTime = new Date(`${params.appointmentDate}T${params.appointmentTime}`);
    const reminderDate = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);

    if (reminderDate <= new Date()) return null;

    return this.scheduleLocalNotification({
      title: 'Appointment Tomorrow',
      body: `${params.patientName} has an appointment tomorrow at ${params.appointmentTime} at ${params.locationName}`,
      data: { type: 'appointment_reminder', appointmentId: params.appointmentId },
      triggerDate: reminderDate,
    });
  },

  // Schedule appointment reminder (1 hour before)
  async scheduleAppointmentReminderHourBefore(params: {
    appointmentId: string;
    patientName: string;
    appointmentTime: string;
    appointmentDate: string;
    locationName: string;
  }): Promise<string | null> {
    const appointmentDateTime = new Date(`${params.appointmentDate}T${params.appointmentTime}`);
    const reminderDate = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);

    if (reminderDate <= new Date()) return null;

    return this.scheduleLocalNotification({
      title: 'Appointment in 1 Hour',
      body: `${params.patientName} - ${params.appointmentTime} at ${params.locationName}`,
      data: { type: 'appointment_reminder', appointmentId: params.appointmentId },
      triggerDate: reminderDate,
    });
  },

  // Send WhatsApp message (opens WhatsApp with pre-filled message)
  async sendWhatsAppMessage(params: {
    phone: string;
    message: string;
  }): Promise<boolean> {
    const phoneNumber = params.phone.replace(/[^0-9]/g, '');
    const fullNumber = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;
    const encodedMessage = encodeURIComponent(params.message);
    const url = `whatsapp://send?phone=${fullNumber}&text=${encodedMessage}`;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }

    // Fallback to web WhatsApp
    const webUrl = `https://wa.me/${fullNumber}?text=${encodedMessage}`;
    await Linking.openURL(webUrl);
    return true;
  },

  // Generate appointment reminder message for WhatsApp
  generateAppointmentReminderMessage(params: {
    patientName: string;
    doctorName: string;
    date: string;
    time: string;
    locationName: string;
    locationAddress?: string;
  }): string {
    return `Dear ${params.patientName},\n\nThis is a reminder for your dental appointment:\n\n📅 Date: ${params.date}\n⏰ Time: ${params.time}\n🏥 Location: ${params.locationName}${params.locationAddress ? `\n📍 Address: ${params.locationAddress}` : ''}\n👨‍⚕️ Doctor: ${params.doctorName}\n\nPlease arrive 10 minutes early. If you need to reschedule, please contact us.\n\nThank you!\nOrthoSync - Built by Dr. Pooja Gangare`;
  },

  // Generate missed appointment follow-up message
  generateMissedAppointmentMessage(params: {
    patientName: string;
    doctorName: string;
    date: string;
  }): string {
    return `Dear ${params.patientName},\n\nWe noticed you missed your dental appointment on ${params.date}.\n\nYour dental health is important to us. Please contact us to reschedule at your earliest convenience.\n\nThank you!\nOrthoSync - Built by Dr. Pooja Gangare`;
  },

  // Cancel all scheduled notifications
  async cancelAllScheduled(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // Cancel a specific notification
  async cancelScheduled(id: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(id);
  },

  // Get all scheduled notifications
  async getAllScheduled() {
    return Notifications.getAllScheduledNotificationsAsync();
  },
};
