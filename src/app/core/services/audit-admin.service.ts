import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type AuditSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
export type AuditCategory = 'FINANCE' | 'SECURITY' | 'MEMBERS' | 'SYSTEM';

export interface AuditLogItem {
  id: string;
  organizationId: string;
  actorId: string;
  actorName?: string | null;
  actorPrenom?: string | null;
  actorNom?: string | null;
  actorEmail?: string | null;
  actorPhone?: string | null;
  actorProfile?: string | null;
  actorRole?: string | null;
  action: string;
  category: AuditCategory;
  severity: AuditSeverity;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  createdAt: string;
  organization?: {
    name: string;
  };
}

export interface AuditStats {
  total: number;
  criticalCount: number;
  highCount: number;
  financeCount: number;
}

export interface AuditLogsResponse {
  success: boolean;
  data: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: AuditStats;
}

export interface AuditFilterParams {
  page?: number;
  limit?: number;
  category?: string;
  severity?: string;
  action?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditAdminService {
  private apiUrl = `${environment.apiUrl}/audit`;

  constructor(private http: HttpClient) {}

  getAuditLogs(filters: AuditFilterParams = {}): Observable<AuditLogsResponse> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.category && filters.category !== 'ALL') params = params.set('category', filters.category);
    if (filters.severity && filters.severity !== 'ALL') params = params.set('severity', filters.severity);
    if (filters.action) params = params.set('action', filters.action);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);

    return this.http.get<AuditLogsResponse>(this.apiUrl, { params });
  }

  exportToCsv(logs: AuditLogItem[], filename = 'journal-audit-jamm.csv'): void {
    if (!logs || logs.length === 0) return;

    const headers = [
      'Date & Heure',
      'Gravité',
      'Catégorie',
      'Action Réalisée',
      'Auteur (Prénom)',
      'Auteur (Nom)',
      'Profil / Fonction',
      'Rôle Système',
      'Téléphone',
      'Email',
      'Statut Responsable',
      'Cible (Entité)',
      'ID Cible',
      'Adresse IP',
      'Métadonnées / Justification'
    ];

    const rows = logs.map(log => [
      `"${new Date(log.createdAt).toLocaleString('fr-FR')}"`,
      `"${log.severity}"`,
      `"${log.category}"`,
      `"${log.action}"`,
      `"${log.actorPrenom || ''}"`,
      `"${log.actorNom || ''}"`,
      `"${log.actorProfile || 'Super Administrateur'}"`,
      `"${log.actorRole || 'ADMIN'}"`,
      `"${log.actorPhone || 'Non renseigné'}"`,
      `"${log.actorEmail || ''}"`,
      `"Équipe Gestion (Non Adhérent Simple)"`,
      `"${log.entityType}"`,
      `"${log.entityId || ''}"`,
      `"${log.ipAddress || 'Non capturée'}"`,
      `"${log.metadata ? JSON.stringify(log.metadata).replace(/"/g, '""') : ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
