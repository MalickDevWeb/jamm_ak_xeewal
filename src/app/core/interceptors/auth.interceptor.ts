import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Try to get token from localStorage (AuthService sets it as 'token')
  let token = null;
  if (typeof window !== 'undefined') {
    // Basic check for browser context
    token = localStorage.getItem('admin_token');
  }

  // If token exists, clone request and add authorization header
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Otherwise, pass original request
  return next(req);
};
