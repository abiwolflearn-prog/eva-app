import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AcademicQuery {
  collegeId: string;
  programId: string;
  year: number;
  semester: number;
}

interface AcademicContextData {
  academicQuery: AcademicQuery | null;
  hasSelection: boolean;
  isLoading: boolean;
  setAcademicInfo: (info: AcademicQuery) => Promise<void>;
  clearAcademicInfo: () => Promise<void>;
}

const AcademicContext = createContext<AcademicContextData>({} as AcademicContextData);

export const AcademicProvider = ({ children }: { children: ReactNode }) => {
  const [academicQuery, setAcademicQuery] = useState<AcademicQuery | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasSelection = !!(
    academicQuery?.collegeId &&
    academicQuery?.programId &&
    academicQuery?.year &&
    academicQuery?.semester
  );

  useEffect(() => {
    loadAcademicInfo();
  }, []);

  const loadAcademicInfo = async () => {
    try {
      const info = await AsyncStorage.getItem('academicInfo');
      if (info) {
        setAcademicQuery(JSON.parse(info));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const setAcademicInfo = async (info: AcademicQuery) => {
    try {
      await AsyncStorage.setItem('academicInfo', JSON.stringify(info));
      setAcademicQuery(info);
    } catch (e) {
      console.error(e);
    }
  };

  const clearAcademicInfo = async () => {
    try {
      await AsyncStorage.removeItem('academicInfo');
      setAcademicQuery(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AcademicContext.Provider value={{ academicQuery, hasSelection, isLoading, setAcademicInfo, clearAcademicInfo }}>
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = () => useContext(AcademicContext);
