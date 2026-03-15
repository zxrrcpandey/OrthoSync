import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

type Language = 'en' | 'hi';

interface AppState {
  language: Language;
  isOnline: boolean;
}

interface AppActions {
  setLanguage: (language: Language) => void;
  setOnline: (isOnline: boolean) => void;
}

type AppStore = AppState & AppActions;

const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // State
      language: 'en',
      isOnline: true,

      // Actions
      setLanguage: (language: Language) => {
        i18n.changeLanguage(language);
        set({ language });
      },

      setOnline: (isOnline: boolean) =>
        set({ isOnline }),
    }),
    {
      name: 'orthosync-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
      },
    },
  ),
);

export default useAppStore;
