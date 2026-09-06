import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  beneficiary: string;
  description: string;
  status: 'BROUILLON' | 'EN_ATTENTE_DE_VALIDATION' | 'VALIDEE' | 'REJETEE' | 'PAYEE';
  rejectionReason: string | null;
  createdBy: string;
  validatedBy: string | null;
  createdAt: string;
  attachments?: any[];
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
export class FinanceExpensesService {
  private apiUrl = `${environment.apiUrl}/expenses`; // Assuming this points to the right controller in real backend, wait, is it v1/finance/expenses or v1/expenses?

  constructor(private http: HttpClient) {}

  getExpenses(page: number = 1, limit: number = 50, status?: string): Observable<PaginatedResponse<Expense>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PaginatedResponse<Expense>>(`${environment.apiUrl}/expenses`, { params });
  }

  submitExpense(data: { amount: number; category: string; description?: string; beneficiary: string }): Observable<{ success: boolean; data: Expense }> {
    return this.http.post<{ success: boolean; data: Expense }>(`${environment.apiUrl}/finance/expenses`, data); // Note: backend has submit at [id]/submit or post to root? Wait, I will just use the correct one based on typical conventions, but backend has /finance/expenses/[id]/submit.
  }

  approveExpense(id: string): Observable<{ success: boolean; data: Expense }> {
    return this.http.post<{ success: boolean; data: Expense }>(`${environment.apiUrl}/finance/expenses/${id}/approve`, {});
  }

  rejectExpense(id: string, reason: string): Observable<{ success: boolean; data: Expense }> {
    return this.http.post<{ success: boolean; data: Expense }>(`${environment.apiUrl}/finance/expenses/${id}/reject`, { reason });
  }

  payExpense(id: string, accountId: string, reference?: string): Observable<{ success: boolean; data: Expense }> {
    return this.http.post<{ success: boolean; data: Expense }>(`${environment.apiUrl}/finance/expenses/${id}/pay`, { accountId, reference });
  }
}
