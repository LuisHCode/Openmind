import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private router: Router) {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
      this.isLoggedInSubject.next(true);
    }
  }

  login(email: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      // Simulación de login - en un caso real se haría una llamada HTTP
      setTimeout(() => {
        if (email && password) {
          const user: AuthUser = {
            id: '1',
            name: 'Usuario Demo',
            email: email,
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1'
          };
          
          this.currentUserSubject.next(user);
          this.isLoggedInSubject.next(true);
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          observer.next(true);
          observer.complete();
        } else {
          observer.next(false);
          observer.complete();
        }
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }
}