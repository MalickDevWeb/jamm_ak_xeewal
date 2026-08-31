import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const isApiUrl = req.url.includes('/api/v1');

  if (token && isApiUrl && !req.headers.has('Authorization')) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
