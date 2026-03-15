import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppNotification } from '../types';

interface NotificationState {
  notifications: AppNotification[];
  isLoading: boolean;

  addNotification: (notification: AppNotification) => void;
  deleteNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  getUnreadCount: () => number;
  getNotificationsByType: (type: AppNotification['type']) => AppNotification[];
  getNotificationsByPatient: (patientId: string) => AppNotification[];

  // Reminder generators
  createAppointmentReminder: (params: {
    doctorId: string;
    patientId: string;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    locationName: string;
  }) => AppNotification;

  createMissedAppointmentNotification: (params: {
    doctorId: string;
    patientId: string;
    patientName: string;
    appointmentDate: string;
  }) => AppNotification;

  createPaymentDueNotification: (params: {
    doctorId: string;
    patientId: string;
    patientName: string;
    amount: number;
    dueDate: string;
  }) => AppNotification;

  createCustomNotification: (params: {
    doctorId: string;
    patientId?: string;
    title: string;
    message: string;
  }) => AppNotification;

  setLoading: (loading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      isLoading: false,

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),

      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),

      clearAll: () => set({ notifications: [] }),

      getUnreadCount: () =>
        get().notifications.filter((n) => !n.isRead).length,

      getNotificationsByType: (type) =>
        get().notifications.filter((n) => n.type === type),

      getNotificationsByPatient: (patientId) =>
        get().notifications.filter((n) => n.patientId === patientId),

      createAppointmentReminder: (params) => {
        const notification: AppNotification = {
          id: `notif_${Date.now()}_reminder`,
          doctorId: params.doctorId,
          type: 'appointment_reminder',
          title: 'Appointment Reminder',
          message: `${params.patientName} has an appointment on ${params.appointmentDate} at ${params.appointmentTime} at ${params.locationName}`,
          patientId: params.patientId,
          isRead: false,
          sentVia: ['push'],
          createdAt: new Date().toISOString(),
        };
        get().addNotification(notification);
        return notification;
      },

      createMissedAppointmentNotification: (params) => {
        const notification: AppNotification = {
          id: `notif_${Date.now()}_missed`,
          doctorId: params.doctorId,
          type: 'missed_appointment',
          title: 'Missed Appointment',
          message: `${params.patientName} missed their appointment on ${params.appointmentDate}. Consider following up.`,
          patientId: params.patientId,
          isRead: false,
          sentVia: ['push'],
          createdAt: new Date().toISOString(),
        };
        get().addNotification(notification);
        return notification;
      },

      createPaymentDueNotification: (params) => {
        const notification: AppNotification = {
          id: `notif_${Date.now()}_payment`,
          doctorId: params.doctorId,
          type: 'payment_due',
          title: 'Payment Due',
          message: `Payment of ₹${params.amount.toLocaleString('en-IN')} is due from ${params.patientName} on ${params.dueDate}`,
          patientId: params.patientId,
          isRead: false,
          sentVia: ['push'],
          createdAt: new Date().toISOString(),
        };
        get().addNotification(notification);
        return notification;
      },

      createCustomNotification: (params) => {
        const notification: AppNotification = {
          id: `notif_${Date.now()}_custom`,
          doctorId: params.doctorId,
          type: 'custom',
          title: params.title,
          message: params.message,
          patientId: params.patientId,
          isRead: false,
          sentVia: ['push'],
          createdAt: new Date().toISOString(),
        };
        get().addNotification(notification);
        return notification;
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'orthosync-notifications',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
