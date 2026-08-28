import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError, Observable, BehaviorSubject } from 'rxjs';

import { environment } from '../../../environments/environment';

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
  
  // State management for user authentication
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(private http: HttpClient) {
    // Load from localStorage on initialization
    const storedToken = localStorage.getItem('admin_token');
    if (storedToken) {
      // Decode or fetch user info here (mocked for now)
      this.currentUserSubject.next({ token: storedToken });
    }
  }

  login(credentials: {email: string, password: string}): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            localStorage.setItem('admin_token', response.data.token);
            this.currentUserSubject.next(response.data.user);
          }
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.error || 'Erreur de connexion'));
        })
      );
  }

  logout() {
    localStorage.removeItem('admin_token');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('admin_token');
  }
}
