import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ManualPayment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  contributionPayments: {
    contribution: {
      year: number;
      expectedAmount: number;
      Adherent?: {
        prenom: string;
        nom: string;
      };
      contributionType?: {
        name: string;
      }
    }
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class FinanceManualPaymentsService {
  private apiUrl = `${environment.apiUrl}/manual-payments`;

  constructor(private http: HttpClient) {}

  getPendingPayments(): Observable<{ success: boolean; data: ManualPayment[] }> {
    return this.http.get<{ success: boolean; data: ManualPayment[] }>(`${this.apiUrl}/pending`);
  }

  confirmPayment(id: string, notes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/confirm`, { notes });
  }

  rejectPayment(id: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reject`, { reason });
  }
}
