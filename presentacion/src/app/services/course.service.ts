import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Course, User, CourseStats } from '../models/course.model';
import { CourseApiService } from './course-api.service';
import { map } from 'rxjs';

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

  constructor(private courseApi: CourseApiService) {
  }

  getAllCourses(): Observable<Course[]> {
    const allCourses = this.coursesSubject.value;
    const createdCourses = this.createdCoursesSubject.value;
    const enrolledIds = this.enrolledCoursesSubject.value;
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
    return this.courseApi.getById(id).pipe(
      map(curso => ({
        id: String(curso.id),
        title: curso.titulo || 'Sin título',
        description: curso.descripcion || '',
        instructor: curso.creador_nombre || 'Desconocido',
        duration: (curso.semanas_duracion ? curso.semanas_duracion + ' Semanas' : ''),
        level: curso.nivel || 'Intermedio',
        category: curso.categoria || 'General',
        price: curso.precio || 0,
        studentsCount: curso.estudiantes || 0,
        cupo: curso.cupo || 0,
        imageUrl: curso.imagen_url,
        imagen_url: curso.imagen_url,
        createdAt: curso.fecha_creacion ? new Date(curso.fecha_creacion) : new Date(),
        creador_id: curso.creador_id
      }))
    );
  }

  enrollInCourse(courseId: string): Observable<boolean> {
    return new Observable(observer => {
      setTimeout(() => {
        const currentEnrolled = this.enrolledCoursesSubject.value;
        if (!currentEnrolled.includes(courseId)) {
          this.enrolledCoursesSubject.next([...currentEnrolled, courseId]);
          this.incrementStudentCount(courseId);
        }
        observer.next(true);
        observer.complete();
      }, 500);
    });
  }

  private incrementStudentCount(courseId: string): void {
    const currentCourses = this.coursesSubject.value;
    const updatedCourses = currentCourses.map(course => 
      course.id === courseId 
        ? { ...course, studentsCount: course.studentsCount + 1 }
        : course
    );
    this.coursesSubject.next(updatedCourses);
    const currentCreated = this.createdCoursesSubject.value;
    const updatedCreated = currentCreated.map(course => 
      course.id === courseId 
        ? { ...course, studentsCount: course.studentsCount + 1 }
        : course
    );
    this.createdCoursesSubject.next(updatedCreated);
  }

  createCourse(course: Omit<Course, 'id' | 'createdAt' | 'studentsCount' | 'rating'>): Observable<Course> {
    return new Observable(observer => {
      setTimeout(() => {
        const newCourse: Course = {
          ...course,
          id: `created-${Date.now()}`,
          createdAt: new Date(),
          studentsCount: 0,
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
    return this.courseApi
      .getMatriculados(courseId)
      .pipe(
        map((matriculados: any[]) =>
          matriculados.map((m) => ({
            id: String(m.id),
            name: m.nombre || '',
            email: m.email || '',
            avatar: m.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(m.nombre || 'Estudiante'),
            enrolledAt: m.fecha_matricula ? new Date(m.fecha_matricula) : undefined,
          }))
        )
      );
  }

  getStats(): Observable<CourseStats> {
    const allCourses = this.coursesSubject.value.length + this.createdCoursesSubject.value.length;
    const enrolled = this.enrolledCoursesSubject.value.length;
    const created = this.createdCoursesSubject.value.length;
    const stats: CourseStats = {
      totalCourses: allCourses,
      enrolledCourses: enrolled,
      createdCourses: created,
      completedCourses: Math.floor(enrolled * 0.7)
    };
    return of(stats);
  }
}