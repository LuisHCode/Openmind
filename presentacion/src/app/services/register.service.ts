import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private readonly API_URL = environment.servidor + '/api/auth/signin';

  constructor(private http: HttpClient) {}

  register(nombre: string, email: string, password: string): Observable<any> {
    return this.http.post(this.API_URL, {
      nombre,
      email,
      password
    });
  }
}
