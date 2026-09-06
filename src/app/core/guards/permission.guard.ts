import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard vérifiant si l'utilisateur possède la permission requise pour accéder à la route.
 * La permission requise est définie dans route.data['permission'].
 */
export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermission = route.data?.['permission'] as string | undefined;

  // Si aucune permission spécifique n'est exigée, accès accordé
  if (!requiredPermission) {
    return true;
  }

  // Vérifier si l'utilisateur possède la permission
  if (authService.hasPermission(requiredPermission)) {
    return true;
  }

  // Si l'utilisateur n'a pas accès, redirection vers le dashboard ou la première page autorisée
  console.warn(`[PermissionGuard] Accès refusé à ${state.url}. Permission requise: ${requiredPermission}`);
  return router.createUrlTree(['/admin/dashboard']);
};
