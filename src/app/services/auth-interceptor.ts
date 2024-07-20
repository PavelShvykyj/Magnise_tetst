import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStateService } from './auth-state.service';
import { environment } from '../../environments/environment';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.indexOf(environment.baseURL) === -1) {
    return next(req);
  }


  const auth: AuthStateService =  inject(AuthStateService);
  const token = auth.token;
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  } else {
    return next(req);
  }
};
