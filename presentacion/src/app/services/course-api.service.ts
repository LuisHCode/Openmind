import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, map, switchMap, forkJoin } from 'rxjs';
import { environment } from '../environments/environment.development';
import { Course } from '../models/course.model';

@Injectable({ providedIn: 'root' })
export class CourseApiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.servidor + '/api/curso';

  getAll(): Observable<Course[]> {
    return this.http.get<any[]>(this.API_URL).pipe(
      switchMap(cursos => {
        const cursosWithStudents$ = cursos.map(curso =>
          this.getMatriculados(curso.id).pipe(
            map(estudiantes => ({
              id: String(curso.id),
              title: curso.titulo || 'Sin título',
              description: curso.descripcion || '',
              instructor: curso.creador_nombre || 'Desconocido',
              duration: (curso.semanas_duracion ? curso.semanas_duracion + ' Semanas' : ''),
              level: curso.nivel || 'Intermedio',
              category: curso.categoria || 'General',
              price: curso.precio || 0,
              studentsCount: estudiantes.length,
              cupo: curso.cupo || 0,
              imageUrl: curso.imagen_url,
              imagen_url: curso.imagen_url,
              createdAt: curso.fecha_creacion ? new Date(curso.fecha_creacion) : new Date(),
              creador_id: curso.creador_id,
              estudiantes: estudiantes
            }))
          )
        );
        return forkJoin(cursosWithStudents$);
      })
    );
  }

  create(body: any): Observable<any> {
    return this.http.post(this.API_URL, body);
  }

  update(id: string, body: any): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}`, body);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  getMatriculados(idCurso: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/matriculados/${idCurso}`);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }
}
