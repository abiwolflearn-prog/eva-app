import api from './api';
import { Teacher, User, Evaluation } from '../types';

export interface AdminStats {
  totalTeachers: number;
  totalStudents: number;
  totalEvaluations: number;
  averageRating: string;
}

export interface DashboardData {
  stats: AdminStats;
  topTeachers: Teacher[];
  lowestTeachers: Teacher[];
}

export interface SystemSettings {
  evaluationPeriodOpen: boolean;
  anonymousModeEnabled: boolean;
}

export const getDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error: any) {
    console.error('Admin dashboard fetch error:', error.message);
    throw error;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const toggleUserRole = async (userId: string): Promise<User> => {
  const response = await api.put(`/admin/users/${userId}/role`);
  return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/admin/users/${userId}`);
};

export const getAllEvaluations = async (): Promise<Evaluation[]> => {
  const response = await api.get('/admin/evaluations');
  return response.data;
};

export const deleteEvaluation = async (evaluationId: string): Promise<void> => {
  await api.delete(`/admin/evaluations/${evaluationId}`);
};

export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await api.get('/admin/settings');
  return response.data;
};

export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await api.put('/admin/settings', settings);
  return response.data;
};

export const createTeacher = async (teacherData: Partial<Teacher>): Promise<Teacher> => {
  const response = await api.post('/teachers', teacherData);
  return response.data;
};

export const updateTeacher = async (id: string, teacherData: Partial<Teacher>): Promise<Teacher> => {
  const response = await api.put(`/teachers/${id}`, teacherData);
  return response.data;
};

export const deleteTeacher = async (id: string): Promise<void> => {
  await api.delete(`/teachers/${id}`);
};

export interface OrganizedData {
  teachers: Teacher[];
  students: User[];
  evaluations: Evaluation[];
}

export const getOrganizedData = async (filters: { 
  college?: string; 
  program?: string; 
  year?: number; 
  semester?: number 
}): Promise<OrganizedData> => {
  const response = await api.get('/admin/organized-data', { params: filters });
  return response.data;
};

export const getExportData = async (filters: { 
  college?: string; 
  program?: string; 
  year?: number; 
  semester?: number 
}): Promise<any[]> => {
  const response = await api.get('/admin/export', { params: filters });
  return response.data;
};
