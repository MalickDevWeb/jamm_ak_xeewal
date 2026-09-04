import { Component, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PushNotificationService } from '../../../core/services/push-notification.service';
import { PublicDataService } from '../../../core/services/public-data.service';
import { Subscription } from 'rxjs';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  animations: [
    trigger('bellRing', [
      transition(':enter', [
        animate('700ms ease', keyframes([
          style({ transform: 'rotate(0deg) scale(1)', offset: 0 }),
          style({ transform: 'rotate(-25deg) scale(1.2)', offset: 0.15 }),
          style({ transform: 'rotate(25deg) scale(1.2)', offset: 0.3 }),
          style({ transform: 'rotate(-20deg) scale(1.15)', offset: 0.45 }),
          style({ transform: 'rotate(20deg) scale(1.1)', offset: 0.6 }),
          style({ transform: 'rotate(-10deg) scale(1.05)', offset: 0.75 }),
          style({ transform: 'rotate(0deg) scale(1)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  showNotifications = false;
  notifications: any[] = [];
  unreadCount = 0;
  isSubscribed = signal(false);
  isSubscribing = signal(false);
  showSubscribeSuccess = signal(false);
  socialLinks: any = { whatsapp: 'https://wa.me/', facebook: '#', tiktok: '#', youtube: '#' };
  private sub?: Subscription;

  constructor(private pushService: PushNotificationService, private publicData: PublicDataService) {}

  ngOnInit() {
    this.publicData.getSettings().subscribe({
      next: (res: any) => { this.socialLinks = { ...this.socialLinks, ...(res.data || {}) }; },
      error: () => {}
    });
    this.sub = this.pushService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = this.pushService.getUnreadCount();
    });
    // Check if already subscribed
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.isSubscribed.set(Notification.permission === 'granted');
    }
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  toggleNotifications(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications && this.unreadCount > 0) {
      this.pushService.markAllAsRead();
      this.unreadCount = 0;
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.showNotifications) {
      this.showNotifications = false;
    }
  }

  toggleMobileMenu() { this.isMobileMenuOpen = !this.isMobileMenuOpen; }

  async subscribeToPush() {
    if (this.isSubscribed() || this.isSubscribing()) return;
    this.isSubscribing.set(true);
    await this.pushService.subscribeToNotifications();

    if (Notification.permission === 'granted') {
      this.isSubscribed.set(true);
      this.isSubscribing.set(false);
      this.showSubscribeSuccess.set(true);
      // Auto-hide success after 3s
      setTimeout(() => this.showSubscribeSuccess.set(false), 3000);
    } else {
      this.isSubscribing.set(false);
    }
  }
}
