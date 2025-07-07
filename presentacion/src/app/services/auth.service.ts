import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { tap, map } from "rxjs/operators";
import { environment } from "../environments/environment.development";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = environment.servidor + '/api/auth';
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      this.currentUserSubject.next(JSON.parse(savedUser));
      this.isLoggedInSubject.next(true);
    }
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .patch<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          if (res.tk && res.tkref) {
            localStorage.setItem("token", res.tk);
            localStorage.setItem("refreshToken", res.tkref);
            const user: AuthUser = {
              id: this.parseJwt(res.tk).sub,
              name: this.parseJwt(res.tk).nombre,
              email: this.parseJwt(res.tk).email,
            };
            this.currentUserSubject.next(user);
            this.isLoggedInSubject.next(true);
            localStorage.setItem("currentUser", JSON.stringify(user));
          }
        }),
        map((res) => !!res.tk)
      );
  }

  refrescar(): Observable<boolean> {
    const user = this.getCurrentUser();
    const tkref = localStorage.getItem("refreshToken");
    if (!user || !tkref)
      return new Observable((observer) => {
        observer.next(false);
        observer.complete();
      });
    return this.http
      .patch<any>(`${this.apiUrl}/refrescar`, { email: user.email, tkref })
      .pipe(
        tap((res) => {
          if (res.tk && res.tkref) {
            localStorage.setItem("token", res.tk);
            localStorage.setItem("refreshToken", res.tkref);
          }
        }),
        map((res) => !!res.tk)
      );
  }

  logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.http
        .patch(`${this.apiUrl}/cerrar`, { email: user.email })
        .subscribe();
    }
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    this.router.navigate(["/login"]);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  // Decodifica el JWT para extraer datos del usuario
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(
        decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        )
      );
    } catch (e) {
      return {};
    }
  }
}
