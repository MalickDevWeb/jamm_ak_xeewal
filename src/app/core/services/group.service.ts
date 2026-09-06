import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GroupItem {
  id: string;
  name: string;
  type: string;
  description?: string;
  status: string;
  createdAt: string;
  _count?: { GroupMember: number };
}

export interface AdherentItem {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  quartier: string;
  statut?: string;
  profession?: string;
  competences?: string;
  disponibilite?: string;
  poleId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private http = inject(HttpClient);
  private organizationId = 'DEFAULT_ORG';

  getGroups(status?: string): Observable<any> {
    const statusQuery = status ? `&status=${status}` : '';
    return this.http.get(
      `${environment.apiUrl}/groups?organizationId=${this.organizationId}${statusQuery}`
    );
  }

  createGroup(data: { name: string; type: string; description?: string }): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/groups`,
      { ...data, organizationId: this.organizationId }
    );
  }

  getGroupMembers(groupId: string): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/groups/${groupId}/members?organizationId=${this.organizationId}`
    );
  }

  addMembersToGroup(groupId: string, memberIds: string[]): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/groups/${groupId}/members`,
      { memberIds, organizationId: this.organizationId }
    );
  }
}
