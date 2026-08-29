import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add auth token for /api/v1/admin/* and /admin/* routes
  // NOT for public endpoints (besoins, adherents, options, etc.)
  const isAdminRoute = req.url.includes('/admin/') || 
                       req.url.includes('/api/v1/admin/') ||
                       req.url.includes('dashboard');

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  if (token && isAdminRoute) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
