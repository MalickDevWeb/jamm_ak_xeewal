import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PublicDataService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // --- Editorial ---
  getEditorial(page: string): Observable<any> { return this.http.get(`${this.apiUrl}/editorial?page=${page}`); }
  
  // --- Activités ---
  getActivites(): Observable<any> { return this.http.get(`${this.apiUrl}/activites`); }
  
  // --- Sondages ---
  getSondages(): Observable<any> { return this.http.get(`${this.apiUrl}/sondages`); }

  // --- Settings publics (qr_code_url, etc.) ---
  getSettings(): Observable<any> { return this.http.get(`${this.apiUrl}/settings`); }

  // --- Formulaires d'engagement ---
  postAdherent(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/adherents`, data); }
  postBesoin(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/besoins`, data); }
  postIdee(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/idees`, data); }
  postMessage(data: any): Observable<any> { return this.http.post(`${this.apiUrl}/messages`, data); }
}
