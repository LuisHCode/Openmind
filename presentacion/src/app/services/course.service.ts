import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Course, User, CourseStats } from '../models/course.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  public courses$ = this.coursesSubject.asObservable();

  private enrolledCoursesSubject = new BehaviorSubject<string[]>([]);
  public enrolledCourses$ = this.enrolledCoursesSubject.asObservable();

  private createdCoursesSubject = new BehaviorSubject<Course[]>([]);
  public createdCourses$ = this.createdCoursesSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'Desarrollo Web con Angular',
        description: 'Aprende a crear aplicaciones web modernas con Angular desde cero.',
        instructor: 'María García',
        duration: '40 horas',
        level: 'Intermedio',
        category: 'Desarrollo Web',
        price: 299,
        rating: 4.8,
        studentsCount: 1250,
        imageUrl: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        title: 'Python para Data Science',
        description: 'Domina Python y sus librerías para análisis de datos y machine learning.',
        instructor: 'Carlos López',
        duration: '60 horas',
        level: 'Avanzado',
        category: 'Data Science',
        price: 399,
        rating: 4.9,
        studentsCount: 890,
        imageUrl: 'https://images.pexels.com/photos/574070/pexels-photo-574070.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
        createdAt: new Date('2024-02-01')
      },
      {
        id: '3',
        title: 'Diseño UX/UI Moderno',
        description: 'Aprende a diseñar experiencias de usuario atractivas y funcionales.',
        instructor: 'Ana Martínez',
        duration: '35 horas',
        level: 'Principiante',
        category: 'Diseño',
        price: 249,
        rating: 4.7,
        studentsCount: 2100,
        imageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
        createdAt: new Date('2024-01-20')
      },
      {
        id: '4',
        title: 'JavaScript Avanzado',
        description: 'Profundiza en conceptos avanzados de JavaScript y ES6+.',
        instructor: 'David Rodríguez',
        duration: '45 horas',
        level: 'Avanzado',
        category: 'Programación',
        price: 349,
        rating: 4.6,
        studentsCount: 760,
        imageUrl: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
        createdAt: new Date('2024-02-10')
      },
      {
        id: '5',
        title: 'Marketing Digital 2024',
        description: 'Estrategias modernas de marketing digital y redes sociales.',
        instructor: 'Laura Fernández',
        duration: '30 horas',
        level: 'Intermedio',
        category: 'Marketing',
        price: 199,
        rating: 4.5,
        studentsCount: 1500,
        imageUrl: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
        createdAt: new Date('2024-01-25')
      },
      {
        id: '6',
        title: 'React Native para Mobile',
        description: 'Desarrolla aplicaciones móviles nativas con React Native.',
        instructor: 'Roberto Silva',
        duration: '50 horas',
        level: 'Intermedio',
        category: 'Desarrollo Mobile',
        price: 379,
        rating: 4.8,
        studentsCount: 650,
        imageUrl: 'https://images.pexels.com/photos/147413/twitter-facebook-together-exchange-of-information-147413.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
        createdAt: new Date('2024-02-05')
      }
    ];

    const createdCourses: Course[] = [
      {
        id: 'created-1',
        title: 'Mi Curso de Angular Material',
        description: 'Un curso completo sobre cómo usar Angular Material en aplicaciones reales.',
        instructor: 'Usuario Demo',
        duration: '25 horas',
        level: 'Intermedio',
        category: 'Desarrollo Web',
        price: 199,
        rating: 4.9,
        studentsCount: 45,
        imageUrl: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1',
        createdAt: new Date('2024-03-01')
      }
    ];

    this.coursesSubject.next(mockCourses);
    this.createdCoursesSubject.next(createdCourses);
    
    // Cursos matriculados demo
    this.enrolledCoursesSubject.next(['1', '3']);
  }

  getAllCourses(): Observable<Course[]> {
    // Combinar cursos existentes con cursos creados para mostrar en dashboard
    const allCourses = this.coursesSubject.value;
    const createdCourses = this.createdCoursesSubject.value;
    const enrolledIds = this.enrolledCoursesSubject.value;
    
    // Marcar cursos como matriculados
    const coursesWithEnrollmentStatus = [...allCourses, ...createdCourses].map(course => ({
      ...course,
      isEnrolled: enrolledIds.includes(course.id)
    }));
    
    return of(coursesWithEnrollmentStatus);
  }

  getEnrolledCourses(): Observable<Course[]> {
    return new Observable(observer => {
      const enrolledIds = this.enrolledCoursesSubject.value;
      const allCourses = [...this.coursesSubject.value, ...this.createdCoursesSubject.value];
      const enrolledCourses = allCourses.filter(course => 
        enrolledIds.includes(course.id)
      ).map(course => ({ ...course, isEnrolled: true }));
      
      observer.next(enrolledCourses);
      observer.complete();
    });
  }

  getCreatedCourses(): Observable<Course[]> {
    return this.createdCourses$;
  }

  getCourseById(id: string): Observable<Course | undefined> {
    const allCourses = [...this.coursesSubject.value, ...this.createdCoursesSubject.value];
    const course = allCourses.find(c => c.id === id);
    return of(course);
  }

  enrollInCourse(courseId: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentEnrolled = this.enrolledCoursesSubject.value;
        if (!currentEnrolled.includes(courseId)) {
          this.enrolledCoursesSubject.next([...currentEnrolled, courseId]);
          
          // Incrementar contador de estudiantes del curso
          this.incrementStudentCount(courseId);
        }
        observer.next(true);
        observer.complete();
      }, 500);
    });
  }

  private incrementStudentCount(courseId: string): void {
    // Incrementar en cursos principales
    const currentCourses = this.coursesSubject.value;
    const updatedCourses = currentCourses.map(course => 
      course.id === courseId 
        ? { ...course, studentsCount: course.studentsCount + 1 }
        : course
    );
    this.coursesSubject.next(updatedCourses);

    // Incrementar en cursos creados
    const currentCreated = this.createdCoursesSubject.value;
    const updatedCreated = currentCreated.map(course => 
      course.id === courseId 
        ? { ...course, studentsCount: course.studentsCount + 1 }
        : course
    );
    this.createdCoursesSubject.next(updatedCreated);
  }

  isEnrolledInCourse(courseId: string): boolean {
    return this.enrolledCoursesSubject.value.includes(courseId);
  }

  createCourse(course: Omit<Course, 'id' | 'createdAt' | 'studentsCount' | 'rating'>): Observable<Course> {
    return new Observable(observer => {
      setTimeout(() => {
        const newCourse: Course = {
          ...course,
          id: `created-${Date.now()}`,
          createdAt: new Date(),
          studentsCount: 0,
          rating: 0,
          instructor: 'Usuario Demo'
        };
        
        const currentCreated = this.createdCoursesSubject.value;
        this.createdCoursesSubject.next([...currentCreated, newCourse]);
        
        observer.next(newCourse);
        observer.complete();
      }, 1000);
    });
  }

  getCourseStudents(courseId: string): Observable<User[]> {
    // Mock data de estudiantes
    const mockStudents: User[] = [
      {
        id: '1',
        name: 'Ana García',
        email: 'ana.garcia@email.com',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        enrolledAt: new Date('2024-03-05')
      },
      {
        id: '2',
        name: 'Carlos Ruiz',
        email: 'carlos.ruiz@email.com',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        enrolledAt: new Date('2024-03-07')
      },
      {
        id: '3',
        name: 'María López',
        email: 'maria.lopez@email.com',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        enrolledAt: new Date('2024-03-10')
      }
    ];
    
    return of(mockStudents);
  }

  getStats(): Observable<CourseStats> {
    const allCourses = this.coursesSubject.value.length + this.createdCoursesSubject.value.length;
    const enrolled = this.enrolledCoursesSubject.value.length;
    const created = this.createdCoursesSubject.value.length;
    
    const stats: CourseStats = {
      totalCourses: allCourses,
      enrolledCourses: enrolled,
      createdCourses: created,
      completedCourses: Math.floor(enrolled * 0.7) // 70% completed
    };
    
    return of(stats);
  }
}