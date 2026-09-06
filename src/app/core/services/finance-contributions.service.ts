import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Contribution {
  id: string;
  memberId: string;
  year: number;
  expectedAmount: number;
  totalPaid: number;
  remainingAmount: number;
  status: 'EN_ATTENTE' | 'PARTIELLEMENT_PAYEE' | 'PAYEE' | 'ANNULEE';
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  member?: {
    id: string;
    prenom: string;
    nom: string;
    telephone: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FinanceContributionsService {
  private apiUrl = `${environment.apiUrl}/contributions`;

  constructor(private http: HttpClient) {}

  getContributions(page: number = 1, limit: number = 50, status?: string): Observable<PaginatedResponse<Contribution>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedResponse<Contribution>>(this.apiUrl, { params });
  }

  getContribution(id: string): Observable<{ success: boolean; data: Contribution }> {
    return this.http.get<{ success: boolean; data: Contribution }>(`${this.apiUrl}/${id}`);
  }

  updateContribution(id: string, data: Partial<Contribution>): Observable<{ success: boolean; data: Contribution }> {
    return this.http.patch<{ success: boolean; data: Contribution }>(`${this.apiUrl}/${id}`, data);
  }

  cancelContribution(id: string, reason: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/${id}/cancel`, { reason });
  }
}
