import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface Option {
  id: string;
  type: string;
  value: string;
  label: string;
  ordre: number;
  actif: boolean;
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private apiUrl = environment.apiUrl;
  private cache = new Map<string, CacheEntry>();

  constructor(private http: HttpClient) {}

  private getCached(key: string, request$: Observable<any>): Observable<any> {
    const entry = this.cache.get(key);
    if (entry && (Date.now() - entry.timestamp) < CACHE_TTL_MS) {
      return of(entry.data); // Données en cache → instantané
    }
    return request$.pipe(
      tap(data => this.cache.set(key, { data, timestamp: Date.now() }))
    );
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  invalidateAll() {
    this.cache.clear();
  }

  // GET avec cache
  getAdherents(): Observable<any> { return this.getCached('adherents', this.http.get(`${this.apiUrl}/adherents`)); }
  getBesoins(): Observable<any> { return this.getCached('besoins', this.http.get(`${this.apiUrl}/besoins`)); }
  getIdees(): Observable<any> { return this.getCached('idees', this.http.get(`${this.apiUrl}/idees`)); }
  getMessages(): Observable<any> { return this.getCached('messages', this.http.get(`${this.apiUrl}/messages`)); }
  getCommissions(): Observable<any> { return this.getCached('commissions', this.http.get(`${this.apiUrl}/commissions`)); }
  getSondages(): Observable<any> { return this.getCached('sondages', this.http.get(`${this.apiUrl}/sondages`)); }
  getActivites(): Observable<any> { return this.getCached('activites', this.http.get(`${this.apiUrl}/activites`)); }
  getVisites(): Observable<any> { return this.getCached('visites', this.http.get(`${this.apiUrl}/visites`)); }
  getComptesRendus(): Observable<any> { return this.getCached('comptes-rendus', this.http.get(`${this.apiUrl}/comptes-rendus`)); }

  // POST → invalide le cache de l'endpoint concerné
  createEntity(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${endpoint}`, data).pipe(
      tap(() => this.invalidate(endpoint))
    );
  }

  // PUT → invalide le cache
  updateEntity(endpoint: string, id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${endpoint}/${id}`, data).pipe(
      tap(() => this.invalidate(endpoint))
    );
  }

  // DELETE → invalide le cache
  deleteEntity(endpoint: string, id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${endpoint}/${id}`).pipe(
      tap(() => this.invalidate(endpoint))
    );
  }

  // --- Upload ---
  uploadMedia(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  // --- Settings ---
  getSettings(): Observable<any> { return this.getCached('settings', this.http.get(`${this.apiUrl}/settings`)); }
  saveSettings(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/settings`, data).pipe(
      tap(() => this.invalidate('settings'))
    );
  }

  // --- Auth / Password ---
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, { currentPassword, newPassword });
  }

  // --- Editorial ---
  getEditorial(page: string): Observable<any> { return this.getCached(`editorial_${page}`, this.http.get(`${this.apiUrl}/editorial?page=${page}`)); }
  saveEditorial(page: string, content: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/editorial`, { page, content }).pipe(
      tap(() => this.invalidate(`editorial_${page}`))
    );
  }

  // --- Options dynamiques ---
  getOptions(type?: string): Observable<any> {
    const key = `options_${type || 'all'}`;
    const url = type ? `${this.apiUrl}/options?type=${type}` : `${this.apiUrl}/options`;
    return this.getCached(key, this.http.get(url));
  }
  createOption(data: { type: string; value: string; label: string; ordre?: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/options`, data).pipe(
      tap(() => { this.invalidate(`options_${data.type}`); this.invalidate('options_all'); })
    );
  }
  updateOption(id: string, data: { label?: string; ordre?: number; actif?: boolean }): Observable<any> {
    return this.http.put(`${this.apiUrl}/options`, { id, ...data }).pipe(
      tap(() => this.invalidateAll())
    );
  }
  deleteOption(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/options?id=${id}`).pipe(
      tap(() => this.invalidateAll())
    );
  }
}

