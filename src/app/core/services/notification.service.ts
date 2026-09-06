import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private organizationId = 'DEFAULT_ORG'; // Multi-tenant simulé

  /**
   * Créer et envoyer une notification aux groupes
   */
  sendNotification(data: { title: string; message: string; groupIds: string[]; channels: string[] }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/notifications`, {
      ...data,
      organizationId: this.organizationId
    });
  }

  getNotifications(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/notifications`);
  }

  /**
   * (Espace Adhérent) Obtenir mes notifications IN_APP
   */
  getMyNotifications(memberId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/me/notifications?memberId=${memberId}`);
  }

  /**
   * (Espace Adhérent) Marquer comme lu
   */
  markAsRead(deliveryId: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/me/notifications/${deliveryId}/read`, {});
  }
}
