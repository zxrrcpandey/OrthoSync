import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Treatment, PatientTreatment, TreatmentVisit, PatientPhoto } from '../types';

// Default treatments that doctors can enable/disable in settings
export const DEFAULT_TREATMENTS: Treatment[] = [
  {
    id: 'treat_metal_braces',
    name: 'Metal Braces',
    nameHi: 'मेटल ब्रेसेस',
    category: 'Orthodontics',
    defaultFee: 35000,
    equipmentCost: 8000,
    estimatedDuration: 540,
    stages: [
      { id: 'stg_1', name: 'Consultation & Planning', nameHi: 'परामर्श और योजना', order: 1, estimatedDays: 7 },
      { id: 'stg_2', name: 'Bonding', nameHi: 'बॉन्डिंग', order: 2, estimatedDays: 1 },
      { id: 'stg_3', name: 'Monthly Adjustments', nameHi: 'मासिक समायोजन', order: 3, estimatedDays: 480 },
      { id: 'stg_4', name: 'Debonding', nameHi: 'डीबॉन्डिंग', order: 4, estimatedDays: 1 },
      { id: 'stg_5', name: 'Retainer', nameHi: 'रिटेनर', order: 5, estimatedDays: 30 },
    ],
    isActive: true,
  },
  {
    id: 'treat_ceramic_braces',
    name: 'Ceramic Braces',
    nameHi: 'सिरेमिक ब्रेसेस',
    category: 'Orthodontics',
    defaultFee: 50000,
    equipmentCost: 15000,
    estimatedDuration: 540,
    stages: [
      { id: 'stg_1', name: 'Consultation & Planning', nameHi: 'परामर्श और योजना', order: 1, estimatedDays: 7 },
      { id: 'stg_2', name: 'Bonding', nameHi: 'बॉन्डिंग', order: 2, estimatedDays: 1 },
      { id: 'stg_3', name: 'Monthly Adjustments', nameHi: 'मासिक समायोजन', order: 3, estimatedDays: 480 },
      { id: 'stg_4', name: 'Debonding', nameHi: 'डीबॉन्डिंग', order: 4, estimatedDays: 1 },
      { id: 'stg_5', name: 'Retainer', nameHi: 'रिटेनर', order: 5, estimatedDays: 30 },
    ],
    isActive: true,
  },
  {
    id: 'treat_aligners',
    name: 'Clear Aligners',
    nameHi: 'क्लियर अलाइनर्स',
    category: 'Orthodontics',
    defaultFee: 80000,
    equipmentCost: 30000,
    estimatedDuration: 360,
    stages: [
      { id: 'stg_1', name: 'Scanning & Planning', nameHi: 'स्कैनिंग और योजना', order: 1, estimatedDays: 14 },
      { id: 'stg_2', name: 'Aligner Delivery', nameHi: 'अलाइनर डिलीवरी', order: 2, estimatedDays: 1 },
      { id: 'stg_3', name: 'Bi-weekly Changes', nameHi: 'द्वि-साप्ताहिक बदलाव', order: 3, estimatedDays: 300 },
      { id: 'stg_4', name: 'Refinement', nameHi: 'शोधन', order: 4, estimatedDays: 30 },
      { id: 'stg_5', name: 'Retainer', nameHi: 'रिटेनर', order: 5, estimatedDays: 30 },
    ],
    isActive: true,
  },
  {
    id: 'treat_retainer',
    name: 'Retainer',
    nameHi: 'रिटेनर',
    category: 'Orthodontics',
    defaultFee: 5000,
    equipmentCost: 1500,
    estimatedDuration: 30,
    stages: [],
    isActive: true,
  },
  {
    id: 'treat_extraction',
    name: 'Tooth Extraction',
    nameHi: 'दांत निकालना',
    category: 'Oral Surgery',
    defaultFee: 1500,
    equipmentCost: 200,
    estimatedDuration: 1,
    stages: [],
    isActive: true,
  },
  {
    id: 'treat_scaling',
    name: 'Scaling & Polishing',
    nameHi: 'स्केलिंग और पॉलिशिंग',
    category: 'Preventive',
    defaultFee: 1500,
    equipmentCost: 300,
    estimatedDuration: 1,
    stages: [],
    isActive: true,
  },
  {
    id: 'treat_root_canal',
    name: 'Root Canal Treatment',
    nameHi: 'रूट कैनाल उपचार',
    category: 'Endodontics',
    defaultFee: 8000,
    equipmentCost: 2000,
    estimatedDuration: 14,
    stages: [
      { id: 'stg_1', name: 'Access Opening', nameHi: 'एक्सेस ओपनिंग', order: 1, estimatedDays: 1 },
      { id: 'stg_2', name: 'Cleaning & Shaping', nameHi: 'सफाई और आकार देना', order: 2, estimatedDays: 7 },
      { id: 'stg_3', name: 'Obturation', nameHi: 'ऑब्ट्यूरेशन', order: 3, estimatedDays: 1 },
      { id: 'stg_4', name: 'Crown Placement', nameHi: 'क्राउन प्लेसमेंट', order: 4, estimatedDays: 7 },
    ],
    isActive: true,
  },
  {
    id: 'treat_crown',
    name: 'Dental Crown',
    nameHi: 'डेंटल क्राउन',
    category: 'Prosthodontics',
    defaultFee: 6000,
    equipmentCost: 2500,
    estimatedDuration: 14,
    stages: [
      { id: 'stg_1', name: 'Preparation & Impression', nameHi: 'तैयारी और छाप', order: 1, estimatedDays: 1 },
      { id: 'stg_2', name: 'Temporary Crown', nameHi: 'अस्थायी क्राउन', order: 2, estimatedDays: 7 },
      { id: 'stg_3', name: 'Permanent Crown Fitting', nameHi: 'स्थायी क्राउन फिटिंग', order: 3, estimatedDays: 1 },
    ],
    isActive: true,
  },
  {
    id: 'treat_filling',
    name: 'Dental Filling',
    nameHi: 'डेंटल फिलिंग',
    category: 'Restorative',
    defaultFee: 1000,
    equipmentCost: 300,
    estimatedDuration: 1,
    stages: [],
    isActive: true,
  },
  {
    id: 'treat_implant',
    name: 'Dental Implant',
    nameHi: 'डेंटल इम्प्लांट',
    category: 'Prosthodontics',
    defaultFee: 35000,
    equipmentCost: 15000,
    estimatedDuration: 180,
    stages: [
      { id: 'stg_1', name: 'Consultation & CBCT', nameHi: 'परामर्श और सीबीसीटी', order: 1, estimatedDays: 7 },
      { id: 'stg_2', name: 'Implant Placement', nameHi: 'इम्प्लांट प्लेसमेंट', order: 2, estimatedDays: 1 },
      { id: 'stg_3', name: 'Healing Period', nameHi: 'उपचार अवधि', order: 3, estimatedDays: 120 },
      { id: 'stg_4', name: 'Abutment & Crown', nameHi: 'एबटमेंट और क्राउन', order: 4, estimatedDays: 14 },
    ],
    isActive: true,
  },
  {
    id: 'treat_whitening',
    name: 'Teeth Whitening',
    nameHi: 'दांत सफेद करना',
    category: 'Cosmetic',
    defaultFee: 8000,
    equipmentCost: 2000,
    estimatedDuration: 1,
    stages: [],
    isActive: true,
  },
  {
    id: 'treat_denture',
    name: 'Denture',
    nameHi: 'डेंचर',
    category: 'Prosthodontics',
    defaultFee: 15000,
    equipmentCost: 5000,
    estimatedDuration: 21,
    stages: [
      { id: 'stg_1', name: 'Impression', nameHi: 'छाप', order: 1, estimatedDays: 1 },
      { id: 'stg_2', name: 'Try-in', nameHi: 'ट्राई-इन', order: 2, estimatedDays: 7 },
      { id: 'stg_3', name: 'Delivery', nameHi: 'डिलीवरी', order: 3, estimatedDays: 7 },
      { id: 'stg_4', name: 'Follow-up', nameHi: 'फॉलो-अप', order: 4, estimatedDays: 7 },
    ],
    isActive: true,
  },
];

interface TreatmentState {
  treatments: Treatment[];
  patientTreatments: PatientTreatment[];
  isLoading: boolean;

  // Treatment master
  setTreatments: (treatments: Treatment[]) => void;
  toggleTreatment: (id: string) => void;
  addCustomTreatment: (treatment: Treatment) => void;
  updateTreatment: (id: string, updates: Partial<Treatment>) => void;
  getActiveTreatments: () => Treatment[];

  // Patient treatments
  addPatientTreatment: (pt: PatientTreatment) => void;
  updatePatientTreatment: (id: string, updates: Partial<PatientTreatment>) => void;
  deletePatientTreatment: (id: string) => void;
  getPatientTreatments: (patientId: string) => PatientTreatment[];
  getTreatmentById: (id: string) => PatientTreatment | undefined;

  // Treatment visits
  addVisitToTreatment: (treatmentId: string, visit: TreatmentVisit) => void;
  updateVisit: (treatmentId: string, visitId: string, updates: Partial<TreatmentVisit>) => void;

  setLoading: (loading: boolean) => void;
}

export const useTreatmentStore = create<TreatmentState>()(
  persist(
    (set, get) => ({
      treatments: DEFAULT_TREATMENTS,
      patientTreatments: [],
      isLoading: false,

      setTreatments: (treatments) => set({ treatments }),

      toggleTreatment: (id) =>
        set((state) => ({
          treatments: state.treatments.map((t) =>
            t.id === id ? { ...t, isActive: !t.isActive } : t
          ),
        })),

      addCustomTreatment: (treatment) =>
        set((state) => ({
          treatments: [...state.treatments, treatment],
        })),

      updateTreatment: (id, updates) =>
        set((state) => ({
          treatments: state.treatments.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      getActiveTreatments: () => get().treatments.filter((t) => t.isActive),

      addPatientTreatment: (pt) =>
        set((state) => ({
          patientTreatments: [...state.patientTreatments, pt],
        })),

      updatePatientTreatment: (id, updates) =>
        set((state) => ({
          patientTreatments: state.patientTreatments.map((pt) =>
            pt.id === id ? { ...pt, ...updates } : pt
          ),
        })),

      deletePatientTreatment: (id) =>
        set((state) => ({
          patientTreatments: state.patientTreatments.filter((pt) => pt.id !== id),
        })),

      getPatientTreatments: (patientId) =>
        get().patientTreatments.filter((pt) => pt.patientId === patientId),

      getTreatmentById: (id) =>
        get().patientTreatments.find((pt) => pt.id === id),

      addVisitToTreatment: (treatmentId, visit) =>
        set((state) => ({
          patientTreatments: state.patientTreatments.map((pt) =>
            pt.id === treatmentId
              ? { ...pt, visits: [...pt.visits, visit] }
              : pt
          ),
        })),

      updateVisit: (treatmentId, visitId, updates) =>
        set((state) => ({
          patientTreatments: state.patientTreatments.map((pt) =>
            pt.id === treatmentId
              ? {
                  ...pt,
                  visits: pt.visits.map((v) =>
                    v.id === visitId ? { ...v, ...updates } : v
                  ),
                }
              : pt
          ),
        })),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'orthosync-treatments',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
