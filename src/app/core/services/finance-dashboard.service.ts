import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FinancialDashboardData {
  currency: string;
  globalBalance: number;
  projectedBalance: number;
  totalCredit: number;
  totalDebit: number;
  monthly: {
    credit: number;
    debit: number;
    net: number;
  };
  accounts: {
    id: string;
    name: string;
    type: string;
    currency: string;
    balance: number;
  }[];
  contributions: {
    total: number;
    totalExpectedAmount: number;
    byStatus: Record<string, { count: number; expectedAmount: number }>;
  };
  pending: {
    manualPayments: number;
    expenses: number;
    expensesTotal: number;
    pendingExpensesList: any[];
  };
  recentMovements: any[];
  recentRefunds: any[];
  generatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceDashboardService {
  private apiUrl = `${environment.apiUrl}/financial`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<{ success: boolean; data: FinancialDashboardData }> {
    return this.http.get<{ success: boolean; data: FinancialDashboardData }>(`${this.apiUrl}/dashboard`);
  }
}
