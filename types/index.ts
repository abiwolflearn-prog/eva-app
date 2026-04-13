export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  token?: string;
  college?: string;
  program?: string;
  year?: number;
  semester?: number;
}

export interface Teacher {
  _id: string;
  name: string;
  college: string;
  program: string;
  courseName: string;
  year: number;
  semester: number;
  averageRating: number;
  totalEvaluations: number;
}

export interface EvaluationCriteria {
  teachingQuality: number;
  communication: number;
  punctuality: number;
  courseManagement: number;
  studentSupport: number;
  professionalism: number;
}

export interface Evaluation {
  _id: string;
  student: User;
  teacher: Teacher;
  college: string;
  program: string;
  year: number;
  semester: number;
  rating: number;
  criteria?: EvaluationCriteria;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}
