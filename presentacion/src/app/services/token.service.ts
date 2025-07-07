import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly TOKEN_KEY = 'token';
  private readonly REFRESH_KEY = 'refreshToken';

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_KEY, token);
  }

  removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_KEY);
  }

  clear(): void {
    this.removeToken();
    this.removeRefreshToken();
  }
}
