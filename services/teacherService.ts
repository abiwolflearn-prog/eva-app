import api from './api';
import { Teacher } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TeacherFilters {
  search?: string;
  college?: string;
  program?: string;
  year?: number;
  semester?: number;
}

const CACHE_KEY_TEACHERS = 'offline_teachers_list';

export const getTeachers = async (filters: TeacherFilters): Promise<Teacher[]> => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.college) params.append('college', filters.college);
  if (filters.program) params.append('program', filters.program);
  if (filters.year) params.append('year', filters.year.toString());
  if (filters.semester) params.append('semester', filters.semester.toString());
  
  try {
    const response = await api.get(`/teachers?${params.toString()}`);
    // Cache the latest result for offline use
    await AsyncStorage.setItem(CACHE_KEY_TEACHERS, JSON.stringify(response.data));
    return response.data;
  } catch (error: any) {
    if (error.message?.includes('Network Error') || error.message?.includes('timed out') || error.message?.includes('offline')) {
      const cached = await AsyncStorage.getItem(CACHE_KEY_TEACHERS);
      if (cached) {
        console.log('Serving teachers from offline cache');
        let parsedTeachers: Teacher[] = JSON.parse(cached);
        
        // Very basic offline filtering to mimic backend behavior
        if (filters.program) parsedTeachers = parsedTeachers.filter(t => t.program === filters.program);
        if (filters.year) parsedTeachers = parsedTeachers.filter(t => t.year === filters.year);
        if (filters.semester) parsedTeachers = parsedTeachers.filter(t => t.semester === filters.semester);
        
        return parsedTeachers;
      }
    }
    throw error;
  }
};

export const getTeacherById = async (id: string): Promise<Teacher> => {
  try {
    const response = await api.get(`/teachers/${id}`);
    await AsyncStorage.setItem(`offline_teacher_${id}`, JSON.stringify(response.data));
    return response.data;
  } catch (error: any) {
    if (error.message?.includes('Network Error') || error.message?.includes('timed out') || error.message?.includes('offline')) {
      const cached = await AsyncStorage.getItem(`offline_teacher_${id}`);
      if (cached) return JSON.parse(cached);
    }
    throw error;
  }
};
