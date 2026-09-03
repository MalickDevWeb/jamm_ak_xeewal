import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

/**
 * Guard: vérifie qu'un token d'authentification agent terrain existe dans localStorage.
 * Redirige vers /terrain/login si l'agent n'est pas authentifié.
 */
export const terrainGuard: CanActivateFn = (
  route,
  state
): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> => {
  const token = localStorage.getItem('terrain_token');
  if (token) {
    return true;
  }
  const router = inject(Router);
  return router.createUrlTree(['/terrain/login']);
};
