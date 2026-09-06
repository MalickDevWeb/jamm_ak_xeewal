import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  // Par défaut vide. Ce sera alimenté au login (ou à l'init) via l'API.
  private userPermissionsSubject = new BehaviorSubject<string[]>([]);
  public userPermissions$ = this.userPermissionsSubject.asObservable();

  constructor() {}

  /**
   * Initialise les permissions de l'utilisateur.
   * À appeler depuis le AuthService au moment du login.
   */
  setPermissions(permissions: string[]) {
    this.userPermissionsSubject.next(permissions);
  }

  /**
   * Vérifie si l'utilisateur possède une permission spécifique.
   * Accepte '*' pour Super Admin.
   */
  hasPermission(permission: string): boolean {
    const permissions = this.userPermissionsSubject.getValue();
    
    // Si l'utilisateur a '*', il a tous les droits (Super Admin)
    if (permissions.includes('*')) {
      return true;
    }

    return permissions.includes(permission);
  }

  /**
   * Vérifie si l'utilisateur possède TOUTES les permissions d'un tableau.
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(p => this.hasPermission(p));
  }

  /**
   * Vérifie si l'utilisateur possède AU MOINS UNE permission d'un tableau.
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(p => this.hasPermission(p));
  }
}
