import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, map, catchError } from 'rxjs';
import { environment } from '../environments/environment';
import { IDoctor } from '../models/interfaces';

const _SERVER = environment.servidor;

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly http = inject(HttpClient);
  constructor() {}

  readAll(): Observable<IDoctor[]> {
    return this.http.get<IDoctor[]>(`${_SERVER}/api/doctor/read`);
  }

  readById(idUsuario: string): Observable<IDoctor[]> {
    return this.http.get<IDoctor[]>(`${_SERVER}/api/doctor/read/${idUsuario}`);
  }

  filtrar(parametros: any): Observable<IDoctor[]> {
    let params = new HttpParams();
    for (const prop in parametros) {
      params = params.append(prop, parametros[prop]);
    }
    return this.http.get<IDoctor[]>(`${_SERVER}/api/doctor/filtro`, { params });
  }

  crear(doctor: IDoctor): Observable<any> {
    return this.http.post(`${_SERVER}/api/doctor`, doctor);
  }

  actualizar(
    idUsuario: string,
    doctor: Omit<IDoctor, 'idUsuario'>
  ): Observable<any> {
    return this.http.put(`${_SERVER}/api/doctor/${idUsuario}`, doctor);
  }

  eliminar(idUsuario: string): Observable<any> {
    return this.http.delete(`${_SERVER}/api/doctor/${idUsuario}`);
  }

  private handleError(error: any) {
    return throwError(() => error.status);
  }
}

