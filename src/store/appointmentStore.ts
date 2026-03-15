import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment } from '../types';

interface AppointmentState {
  appointments: Appointment[];
  isLoading: boolean;

  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentById: (id: string) => Appointment | undefined;

  // Filters
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentsByLocation: (locationId: string) => Appointment[];
  getAppointmentsByPatient: (patientId: string) => Appointment[];
  getAppointmentsByStatus: (status: Appointment['status']) => Appointment[];
  getAppointmentsByDateRange: (startDate: string, endDate: string) => Appointment[];

  // Status updates
  markCompleted: (id: string) => void;
  markMissed: (id: string) => void;
  markCancelled: (id: string) => void;
  markHold: (id: string) => void;
  reschedule: (id: string, date: string, startTime: string, endTime: string) => void;

  // Recurring
  generateRecurringAppointments: (base: Appointment, untilDate: string) => void;

  // Aggregations
  getTodayAppointments: () => Appointment[];
  getUpcomingAppointments: (limit?: number) => Appointment[];
  getMissedAppointments: () => Appointment[];

  setLoading: (loading: boolean) => void;
}

const getToday = () => new Date().toISOString().split('T')[0];

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      appointments: [],
      isLoading: false,

      addAppointment: (appointment) =>
        set((state) => ({ appointments: [...state.appointments, appointment] })),

      updateAppointment: (id, updates) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })),

      deleteAppointment: (id) =>
        set((state) => ({ appointments: state.appointments.filter((a) => a.id !== id) })),

      getAppointmentById: (id) => get().appointments.find((a) => a.id === id),

      getAppointmentsByDate: (date) =>
        get().appointments.filter((a) => a.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime)),

      getAppointmentsByLocation: (locationId) =>
        get().appointments.filter((a) => a.locationId === locationId),

      getAppointmentsByPatient: (patientId) =>
        get().appointments.filter((a) => a.patientId === patientId),

      getAppointmentsByStatus: (status) =>
        get().appointments.filter((a) => a.status === status),

      getAppointmentsByDateRange: (startDate, endDate) =>
        get().appointments.filter((a) => a.date >= startDate && a.date <= endDate),

      markCompleted: (id) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, status: 'completed' as const } : a
          ),
        })),

      markMissed: (id) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, status: 'missed' as const } : a
          ),
        })),

      markCancelled: (id) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, status: 'cancelled' as const } : a
          ),
        })),

      markHold: (id) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, status: 'hold' as const } : a
          ),
        })),

      reschedule: (id, date, startTime, endTime) =>
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, date, startTime, endTime, status: 'scheduled' as const } : a
          ),
        })),

      generateRecurringAppointments: (base, untilDate) => {
        const appointments: Appointment[] = [];
        const pattern = base.recurringPattern;
        if (!pattern) return;

        let currentDate = new Date(base.date);
        const endDate = new Date(untilDate);
        let count = 0;

        while (currentDate <= endDate && count < 52) {
          // Skip the first one (already added as base)
          if (count > 0) {
            const dateStr = currentDate.toISOString().split('T')[0];
            appointments.push({
              ...base,
              id: `appt_${Date.now()}_${count}`,
              date: dateStr,
              isRecurring: true,
              reminderSent: false,
              createdAt: new Date().toISOString(),
            });
          }

          switch (pattern.frequency) {
            case 'weekly':
              currentDate.setDate(currentDate.getDate() + 7);
              break;
            case 'biweekly':
              currentDate.setDate(currentDate.getDate() + 14);
              break;
            case 'monthly':
              currentDate.setMonth(currentDate.getMonth() + 1);
              break;
          }
          count++;
        }

        if (appointments.length > 0) {
          set((state) => ({
            appointments: [...state.appointments, ...appointments],
          }));
        }
      },

      getTodayAppointments: () => {
        const today = getToday();
        return get().appointments
          .filter((a) => a.date === today)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      },

      getUpcomingAppointments: (limit = 20) => {
        const today = getToday();
        return get().appointments
          .filter((a) => a.date >= today && a.status === 'scheduled')
          .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
          .slice(0, limit);
      },

      getMissedAppointments: () =>
        get().appointments.filter((a) => a.status === 'missed'),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'orthosync-appointments',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
