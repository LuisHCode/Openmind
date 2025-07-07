export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  category: string;
  price: number;
  studentsCount: number;
  cupo: number;
  imageUrl: string;
  imagen_url?: string;
  createdAt: Date;
  creador_id: string;
  isEnrolled?: boolean;
  estudiantes?: User[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrolledAt?: Date;
}

export interface CourseStats {
  totalCourses: number;
  enrolledCourses: number;
  createdCourses: number;
  completedCourses: number;
}