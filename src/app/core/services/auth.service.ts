import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError, Observable, BehaviorSubject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SentryService } from './sentry.service';

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

  constructor(private http: HttpClient) {
    // Restaurer l'admin depuis localStorage
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      this.currentUserSubject.next({ token: storedToken });
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

  login(credentials: {email: string, password: string}): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            localStorage.setItem('admin_token', response.data.token);
            this.currentUserSubject.next(response.data.user);
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
    this.currentUserSubject.next(null);
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
