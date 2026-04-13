import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (userInfo: User) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
    } catch (e) {
      console.error('Error loading user from storage:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (userInfo: User) => {
    try {
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
      if (userInfo.token) {
        await AsyncStorage.setItem('userToken', userInfo.token);
      }
      setUser(userInfo);
    } catch (e) {
      console.error('Error saving user to storage:', e);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userInfo');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('academicInfo');
      setUser(null);
    } catch (e) {
      console.error('Error clearing user from storage:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
