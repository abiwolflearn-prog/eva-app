import api from './api';
import { User } from '../types';

export const login = async (email: string, password: string): Promise<User> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (
  name: string, 
  email: string, 
  password: string, 
  role: string = 'student',
  college: string = '',
  program: string = '',
  year: number = 1,
  semester: number = 1
): Promise<User> => {
  const response = await api.post('/auth/register', { 
    name, email, password, role, college, program, year, semester 
  });
  return response.data;
};
