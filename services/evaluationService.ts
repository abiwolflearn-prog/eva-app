import api from './api';
import { Evaluation } from '../types';
import { addToOfflineQueue } from './syncService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EvaluationPayload {
  teacherId: string;
  college: string;
  program: string;
  year: number;
  semester: number;
  rating: number;
  criteria: {
    teachingQuality: number;
    communication: number;
    punctuality: number;
    courseManagement: number;
    studentSupport: number;
    professionalism: number;
  };
  comment: string;
}

const CACHE_KEY_MY_EVALS = 'offline_my_evaluations';

export const submitEvaluation = async (data: EvaluationPayload): Promise<Evaluation> => {
  try {
    const response = await api.post('/evaluations', data);
    return response.data;
  } catch (error: any) {
    if (error.message?.includes('Network Error') || error.message?.includes('timed out') || error.message?.includes('offline')) {
      console.warn('Network offline. Queuing evaluation locally.');
      const queuedData = await addToOfflineQueue(data);
      return queuedData;
    }
    throw error;
  }
};

export const getEvaluationsByTeacher = async (teacherId: string): Promise<Evaluation[]> => {
  try {
    const response = await api.get(`/evaluations/teacher/${teacherId}`);
    return response.data;
  } catch (error: any) {
    if (error.message?.includes('offline')) return [];
    throw error;
  }
};

export const getAnalytics = async (): Promise<{
  colleges: Array<{ college: string; averageRating: string; totalEvaluations: number }>;
  topCollege: { college: string; averageRating: string; totalEvaluations: number } | null;
}> => {
  try {
    const response = await api.get('/evaluations/analytics');
    return response.data;
  } catch (error: any) {
    if (error.message?.includes('offline') || error.message?.includes('timed out') || error.message?.includes('Network Error')) {
      return { colleges: [], topCollege: null };
    }
    throw error;
  }
};

export const getMyEvaluations = async (): Promise<Evaluation[]> => {
  try {
    const response = await api.get('/evaluations/me');
    await AsyncStorage.setItem(CACHE_KEY_MY_EVALS, JSON.stringify(response.data));
    return response.data;
  } catch (error: any) {
    if (error.message?.includes('offline') || error.message?.includes('timed out') || error.message?.includes('Network Error')) {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY_MY_EVALS);
        if (cached) return JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to load cached evaluations');
      }
      return [];
    }
    throw error;
  }
};
