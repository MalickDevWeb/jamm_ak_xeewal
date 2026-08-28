import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

/**
 * Guard: vérifie qu'un token d'authentification admin existe dans localStorage.
 * Redirige vers /admin/login si l'utilisateur n'est pas authentifié.
 */
export const authGuard: CanActivateFn = (
  route,
  state
): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    return true;
  }
  const router = inject(Router);
  return router.createUrlTree(['/admin/login'], {
    queryParams: { returnUrl: state.url }
  });
};
