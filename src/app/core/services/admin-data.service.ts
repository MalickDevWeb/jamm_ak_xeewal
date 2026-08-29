import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface Option {
  id: string;
  type: string;
  value: string;
  label: string;
  ordre: number;
  actif: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // GET
  getAdherents(): Observable<any> { return this.http.get(`${this.apiUrl}/adherents`); }
  getBesoins(): Observable<any> { return this.http.get(`${this.apiUrl}/besoins`); }
  getIdees(): Observable<any> { return this.http.get(`${this.apiUrl}/idees`); }
  getMessages(): Observable<any> { return this.http.get(`${this.apiUrl}/messages`); }
  getCommissions(): Observable<any> { return this.http.get(`${this.apiUrl}/commissions`); }
  getSondages(): Observable<any> { return this.http.get(`${this.apiUrl}/sondages`); }
  getActivites(): Observable<any> { return this.http.get(`${this.apiUrl}/activites`); }
  getComptesRendus(): Observable<any> { return this.http.get(`${this.apiUrl}/comptes-rendus`); }

  // POST
  createEntity(endpoint: string, data: any): Observable<any> { return this.http.post(`${this.apiUrl}/${endpoint}`, data); }
  
  // PUT
  updateEntity(endpoint: string, id: string, data: any): Observable<any> { return this.http.put(`${this.apiUrl}/${endpoint}/${id}`, data); }
  
  // DELETE
  deleteEntity(endpoint: string, id: string): Observable<any> { return this.http.delete(`${this.apiUrl}/${endpoint}/${id}`); }

  // --- Upload ---
  uploadMedia(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  // --- Settings ---
  getSettings(): Observable<any> { return this.http.get(`${this.apiUrl}/settings`); }
  saveSettings(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/settings`, data); }

  // --- Auth / Password ---
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, { currentPassword, newPassword });
  }

  // --- Editorial ---
  getEditorial(page: string): Observable<any> { return this.http.get(`${this.apiUrl}/editorial?page=${page}`); }
  saveEditorial(page: string, content: any): Observable<any> { return this.http.post(`${this.apiUrl}/editorial`, { page, content }); }

  // --- Options dynamiques ---
  getOptions(type?: string): Observable<any> { 
    const url = type ? `${this.apiUrl}/options?type=${type}` : `${this.apiUrl}/options`;
    return this.http.get(url); 
  }
  createOption(data: { type: string; value: string; label: string; ordre?: number }): Observable<any> { 
    return this.http.post(`${this.apiUrl}/options`, data); 
  }
  updateOption(id: string, data: { label?: string; ordre?: number; actif?: boolean }): Observable<any> { 
    return this.http.put(`${this.apiUrl}/options`, { id, ...data }); 
  }
  deleteOption(id: string): Observable<any> { 
    return this.http.delete(`${this.apiUrl}/options?id=${id}`); 
  }
}
