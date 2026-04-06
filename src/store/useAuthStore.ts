import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../services/authService';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isSignout: boolean;
  
  // Actions
  login: (data: { user: User; accessToken: string }) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true, // starts loading while checking for token
  isSignout: false,

  login: async (data: { user: User; accessToken: string }) => {
    try {
      await AsyncStorage.setItem('@access_token', data.accessToken);
      await AsyncStorage.setItem('@user_data', JSON.stringify(data.user));
      set({ 
        user: data.user, 
        accessToken: data.accessToken, 
        isSignout: false 
      });
    } catch (e) {
      console.error('Error saving auth data', e);
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('@access_token');
      await AsyncStorage.removeItem('@user_data');
      set({ 
        user: null, 
        accessToken: null, 
        isSignout: true 
      });
    } catch (e) {
      console.error('Error clearing auth data', e);
    }
  },

  restoreToken: async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@access_token');
      const storedUserData = await AsyncStorage.getItem('@user_data');
      
      if (storedToken && storedUserData) {
        set({ 
          accessToken: storedToken, 
          user: JSON.parse(storedUserData) 
        });
      }
    } catch (e) {
      // Restoring token failed
      console.error('Error restoring auth token', e);
    } finally {
      set({ isLoading: false }); // Done checking regardless of outcome
    }
  },
}));
