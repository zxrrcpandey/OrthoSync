import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Patient, PatientPhoto } from '../types';

interface PatientState {
  patients: Patient[];
  nextPatientNumber: number;
  isLoading: boolean;

  addPatient: (patient: Omit<Patient, 'patientId'> & { patientId?: string }) => string;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  getPatientById: (id: string) => Patient | undefined;
  searchPatients: (query: string) => Patient[];
  getPatientsByLocation: (locationId: string) => Patient[];
  addPhotoToPatient: (patientId: string, photo: PatientPhoto) => void;
  removePhotoFromPatient: (patientId: string, photoId: string) => void;
  generatePatientId: () => string;
  setLoading: (loading: boolean) => void;
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set, get) => ({
      patients: [],
      nextPatientNumber: 1,
      isLoading: false,

      generatePatientId: () => {
        const num = get().nextPatientNumber;
        const patientId = `PAT-${String(num).padStart(4, '0')}`;
        set({ nextPatientNumber: num + 1 });
        return patientId;
      },

      addPatient: (patient) => {
        const patientId = patient.patientId || get().generatePatientId();
        const newPatient = { ...patient, patientId } as Patient;
        set((state) => ({
          patients: [...state.patients, newPatient],
        }));
        return patientId;
      },

      updatePatient: (id, updates) =>
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),

      deletePatient: (id) =>
        set((state) => ({
          patients: state.patients.filter((p) => p.id !== id),
        })),

      getPatientById: (id) => get().patients.find((p) => p.id === id),

      searchPatients: (query) => {
        const q = query.toLowerCase();
        return get().patients.filter(
          (p) =>
            p.fullName.toLowerCase().includes(q) ||
            p.patientId.toLowerCase().includes(q) ||
            p.phone.includes(q)
        );
      },

      getPatientsByLocation: (locationId) =>
        get().patients.filter((p) => p.locationIds.includes(locationId)),

      addPhotoToPatient: (patientId, photo) =>
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? { ...p, photos: [...p.photos, photo], updatedAt: new Date().toISOString() }
              : p
          ),
        })),

      removePhotoFromPatient: (patientId, photoId) =>
        set((state) => ({
          patients: state.patients.map((p) =>
            p.id === patientId
              ? { ...p, photos: p.photos.filter((ph) => ph.id !== photoId), updatedAt: new Date().toISOString() }
              : p
          ),
        })),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'orthosync-patients',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
