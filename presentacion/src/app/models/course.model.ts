export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  category: string;
  price: number;
  rating: number;
  studentsCount: number;
  imageUrl: string;
  createdAt: Date;
  isEnrolled?: boolean;
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