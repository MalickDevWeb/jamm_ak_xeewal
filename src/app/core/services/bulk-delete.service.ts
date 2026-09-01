import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BulkDeleteResponse {
  success: boolean;
  deleted: number;
  requested: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class BulkDeleteService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  deleteSelected(resource: string, ids: string[]): Observable<BulkDeleteResponse> {
    if (!ids || ids.length === 0) return of({ success: false, deleted: 0, requested: 0, message: 'Aucun ID' });
    return this.http.post<BulkDeleteResponse>(this.apiUrl + '/' + resource + '/bulk', { ids });
  }

  deleteAll(resource: string): Observable<BulkDeleteResponse> {
    const headers = new HttpHeaders({ 'X-Confirm': 'DELETE_ALL' });
    return this.http.delete<BulkDeleteResponse>(this.apiUrl + '/' + resource + '/all', { headers });
  }
}
