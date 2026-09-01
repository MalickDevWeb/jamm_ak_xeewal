import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private readonly VAPID_PUBLIC_KEY = environment.vapidPublicKey;
  
  private notificationsSubject = new BehaviorSubject<any[]>(this.loadStoredNotifications());
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient, private ngZone: NgZone) {
    this.listenToServiceWorker();
  }

  private listenToServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NEW_NOTIFICATION') {
          this.ngZone.run(() => {
            this.addNotification(event.data.notification);
          });
        }
      });
    }
  }

  private loadStoredNotifications(): any[] {
    try {
      const data = localStorage.getItem('jamm_push_notifs');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private addNotification(notif: any) {
    const current = this.notificationsSubject.value;
    // Éviter les doublons parfaits (même titre, même contenu dans un délai court)
    if (current.some(n => n.title === notif.title && n.body === notif.body && (notif.timestamp - n.timestamp < 5000))) return;
    
    const updated = [notif, ...current].slice(0, 20); // Garder les 20 dernières
    localStorage.setItem('jamm_push_notifs', JSON.stringify(updated));
    this.notificationsSubject.next(updated);
  }

  public getUnreadCount(): number {
    return this.notificationsSubject.value.filter((n: any) => !n.read).length;
  }

  public markAllAsRead() {
    const updated = this.notificationsSubject.value.map((n: any) => ({ ...n, read: true }));
    localStorage.setItem('jamm_push_notifs', JSON.stringify(updated));
    this.notificationsSubject.next(updated);
  }

  public async subscribeToNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported by the browser.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/push-sw.js');
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Push notification permission denied.');
        return;
      }

      const applicationServerKey = this.urlB64ToUint8Array(this.VAPID_PUBLIC_KEY);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });

      this.http.post(`${environment.apiUrl}/push/subscribe`, subscription).subscribe({
        next: () => console.log('Successfully subscribed to notifications'),
        error: (err) => console.error('Could not send subscription object to server', err)
      });

    } catch (err) {
      console.error('Error during push subscription:', err);
    }
  }

  private urlB64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
