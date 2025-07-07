import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  let token = tokenService.getRefreshToken();
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  let isRefreshing = false;
  let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  const isAuthRoute = (url: string) => {
    return url.includes('/api/auth/login') || url.includes('/api/auth/refrescar');
  };

  const handle401Error = (request: HttpRequest<any>): Observable<HttpEvent<any>> => {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);
      const refreshToken = tokenService.getRefreshToken();
      if (refreshToken) {
        return authService.refrescar().pipe(
          switchMap((success) => {
            isRefreshing = false;
            const newToken = tokenService.getRefreshToken();
            if (newToken) {
              refreshTokenSubject.next(newToken);
              return next(request.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              }));
            }
            authService.logout();
            return throwError(() => 'No token after refresh');
          }),
          catchError(err => {
            isRefreshing = false;
            authService.logout();
            return throwError(() => err);
          })
        );
      } else {
        authService.logout();
      }
    }
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => next(request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      })))
    );
  };

  return next(authReq).pipe(
    catchError(error => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isAuthRoute(authReq.url)
      ) {
        return handle401Error(authReq);
      }
      return throwError(() => error);
    })
  );
};
