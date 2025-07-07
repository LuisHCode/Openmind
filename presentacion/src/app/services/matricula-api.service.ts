import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment.development';
import { Course } from '../models/course.model';
import { AuthService } from './auth.service';

export interface Matricula {
  id: string;
  curso_id: string;
  curso: string;
  descripcion: string;
  semanas_duracion: number;
  categoria: string;
  nivel: string;
  cupo: number;
  creador_id: string;
  usuario: string;
  creador_nombre: string;
  fecha_matricula: string;
}

@Injectable({ providedIn: 'root' })
export class MatriculaApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly API_URL = environment.servidor + '/api/matricula';
  private readonly GENERIC_IMAGE = 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1';

  getMisCursos(): Observable<(Course & { idMatricula: string, fechaMatricula: string })[]> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');
    const params = { idUsuario: user.id };
    return this.http.get<Matricula[]>(this.API_URL, { params }).pipe(
      map(matriculas => matriculas.map(m => {
        let nivel: 'Principiante' | 'Intermedio' | 'Avanzado' = 'Intermedio';
        if (m.nivel === 'Principiante' || m.nivel === 'Intermedio' || m.nivel === 'Avanzado') {
          nivel = m.nivel;
        }
        return {
          id: String(m.curso_id),
          idMatricula: String(m.id),
          title: m.curso || 'Sin título',
          description: m.descripcion || '',
          instructor: m.creador_nombre || 'Desconocido',
          duration: (m.semanas_duracion ? m.semanas_duracion + ' Semanas' : ''),
          level: nivel,
          category: m.categoria || 'General',
          price: 0,
          studentsCount: m.cupo || 0,
          cupo: m.cupo || 0,
          imageUrl: (m as any).imagen_url,
          imagen_url: (m as any).imagen_url,
          createdAt: m.fecha_matricula ? new Date(m.fecha_matricula) : new Date(),
          fechaMatricula: m.fecha_matricula,
          creador_id: m.creador_id,
          isEnrolled: true
        };
      }))
    );
  }

  desmatricularse(idUsuario: string, idCurso: string) {
    if (!idUsuario || !idCurso) {
      return {
        subscribe: ({ error }: any) => error && error({ error: { error: 'Faltan datos para desmatricular' } })
      } as any;
    }
    const body = {
      idUsuario: idUsuario,
      idCurso: idCurso
    };
    return this.http.delete(this.API_URL, { body });
  }

  enrollToCourse(idCurso: string) {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');
    const body = { idUsuario: user.id };
    return this.http.post(`${this.API_URL}/${idCurso}`, body);
  }
}
