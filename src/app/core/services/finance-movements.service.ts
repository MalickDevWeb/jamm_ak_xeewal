import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FinancialMovement {
  id: string;
  type: string;
  direction: 'CREDIT' | 'DEBIT';
  amount: number;
  currency: string;
  sourceType: string;
  sourceId: string;
  internalReference: string | null;
  externalReference: string | null;
  createdAt: string;
  account?: {
    id: string;
    name: string;
    type: string;
  } | null;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    pageCredit: number;
    pageDebit: number;
    pageNet: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class FinanceMovementsService {
  private apiUrl = `${environment.apiUrl}/financial/movements`;

  constructor(private http: HttpClient) {}

  getMovements(paramsData: any): Observable<PaginatedResponse<FinancialMovement>> {
    let params = new HttpParams();
    
    Object.keys(paramsData).forEach(key => {
      if (paramsData[key] !== null && paramsData[key] !== undefined && paramsData[key] !== '') {
        params = params.set(key, paramsData[key].toString());
      }
    });

    return this.http.get<PaginatedResponse<FinancialMovement>>(this.apiUrl, { params });
  }

  getReports(period: 'month' | 'year', year?: number, month?: number): Observable<any> {
    let params = new HttpParams().set('period', period);
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());

    return this.http.get<any>(`${environment.apiUrl}/financial/reports`, { params });
  }
}
