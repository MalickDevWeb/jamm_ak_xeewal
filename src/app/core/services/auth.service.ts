import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError, Observable, BehaviorSubject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SentryService } from './sentry.service';

import { RbacService } from './rbac.service';

export interface AuthResponse {
  success: boolean;
  data?: {
    user: any;
    token: string;
  };
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // --- Admin State ---
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // --- Citizen State ---
  private currentCitizenSubject = new BehaviorSubject<any>(null);
  public currentCitizen$ = this.currentCitizenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private rbacService: RbacService
  ) {
    // Restaurer l'admin depuis localStorage
    const storedToken = localStorage.getItem('admin_token');
    const storedUser = localStorage.getItem('admin_user');
    if (storedToken) {
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.currentUserSubject.next({ ...user, token: storedToken });
          // Mettre à jour RBAC Service (on simule Super Admin = '*' ou via user.permissions)
          if (user.role === 'SUPER_ADMIN') {
            this.rbacService.setPermissions(['*']);
          } else if (user.permissions) {
            this.rbacService.setPermissions(user.permissions);
          }
        } catch {
          this.currentUserSubject.next({ token: storedToken });
        }
      } else {
        this.currentUserSubject.next({ token: storedToken });
      }
    }

    // Restaurer le citoyen depuis localStorage
    const citizenRaw = localStorage.getItem('citizen_user');
    if (citizenRaw) {
      try {
        this.currentCitizenSubject.next(JSON.parse(citizenRaw));
      } catch {}
    }
  }

  // ===== ADMIN =====

  get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  /**
   * Vérifie si l'administrateur connecté possède la permission requise
   */
  hasPermission(permission?: string): boolean {
    if (!permission) return true;
    const user = this.currentUserSubject.value;
    if (!user) return false;

    // Si Super Admin ou porteur du wildcard '*'
    if (
      user.role === 'SUPER_ADMIN' ||
      user.profile?.isSystem ||
      user.permissions?.includes('*')
    ) {
      return true;
    }

    // Si admin sans profil explicite (rétrocompatibilité)
    if (user.role === 'ADMIN' && (!user.profileId || !user.permissions || user.permissions.length === 0)) {
      return true;
    }

    if (Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }

    return false;
  }

  login(credentials: {email: string, password: string}): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            localStorage.setItem('admin_token', response.data.token);
            localStorage.setItem('admin_user', JSON.stringify(response.data.user));
            this.currentUserSubject.next({ ...response.data.user, token: response.data.token });
            
            if (response.data.user.role === 'SUPER_ADMIN') {
              this.rbacService.setPermissions(['*']);
            } else if (response.data.user.permissions) {
              this.rbacService.setPermissions(response.data.user.permissions);
            }

            // Identifier l'utilisateur dans Sentry
            SentryService.setUser({
              id: response.data.user.id,
              email: response.data.user.email,
              role: response.data.user.role || 'ADMIN',
            });
          }
        }),
        catchError(error => {
          // Logger les erreurs de login dans Sentry (sans le mot de passe!)
          SentryService.captureException(error, {
            context: 'admin_login',
            email: credentials.email,
          });
          return throwError(() => new Error(error.error?.error || 'Erreur de connexion'));
        })
      );
  }

  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    this.currentUserSubject.next(null);
    this.rbacService.setPermissions([]);
    // Nettoyer l'identification Sentry
    SentryService.setUser(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('admin_token');
  }

  // ===== CITOYEN =====

  /**
   * Appelé après une adhésion réussie — stocke le token et les données citoyen.
   */
  setCitizenSession(adherent: any, token: string): void {
    localStorage.setItem('citizen_token', token);
    localStorage.setItem('citizen_user', JSON.stringify(adherent));
    this.currentCitizenSubject.next(adherent);
    // Identifier le citoyen dans Sentry
    SentryService.setUser({
      id: adherent.id,
      email: adherent.telephone || 'citizen',
      role: 'CITIZEN',
    });
  }

  logoutCitizen() {
    localStorage.removeItem('citizen_token');
    localStorage.removeItem('citizen_user');
    this.currentCitizenSubject.next(null);
    SentryService.setUser(null);
  }

  isCitizenAuthenticated(): boolean {
    return !!localStorage.getItem('citizen_token');
  }

  getCitizenToken(): string | null {
    return localStorage.getItem('citizen_token');
  }

  /**
   * Récupère le profil citoyen depuis le backend (vérification token live)
   */
  getCitizenProfile(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/citoyen/me`, {
      headers: { Authorization: `Bearer ${this.getCitizenToken()}` }
    });
  }
}
