import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Location, CommissionModel, WorkingDay } from '../types';

interface LocationState {
  locations: Location[];
  selectedLocationId: string | null;
  isLoading: boolean;

  // Actions
  addLocation: (location: Location) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  toggleLocationActive: (id: string) => void;
  setSelectedLocation: (id: string | null) => void;
  getLocationById: (id: string) => Location | undefined;
  getLocationsByType: (type: Location['type']) => Location[];
  getActiveLocations: () => Location[];
  setLoading: (loading: boolean) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      locations: [],
      selectedLocationId: null,
      isLoading: false,

      addLocation: (location) =>
        set((state) => ({
          locations: [...state.locations, location],
        })),

      updateLocation: (id, updates) =>
        set((state) => ({
          locations: state.locations.map((loc) =>
            loc.id === id ? { ...loc, ...updates } : loc
          ),
        })),

      deleteLocation: (id) =>
        set((state) => ({
          locations: state.locations.filter((loc) => loc.id !== id),
        })),

      toggleLocationActive: (id) =>
        set((state) => ({
          locations: state.locations.map((loc) =>
            loc.id === id ? { ...loc, isActive: !loc.isActive } : loc
          ),
        })),

      setSelectedLocation: (id) => set({ selectedLocationId: id }),

      getLocationById: (id) => get().locations.find((loc) => loc.id === id),

      getLocationsByType: (type) => get().locations.filter((loc) => loc.type === type),

      getActiveLocations: () => get().locations.filter((loc) => loc.isActive),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'orthosync-locations',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
