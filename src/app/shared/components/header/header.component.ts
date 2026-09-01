import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PushNotificationService } from '../../../core/services/push-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  showNotifications = false;
  notifications: any[] = [];
  unreadCount = 0;
  private sub?: Subscription;

  constructor(private pushService: PushNotificationService) {}

  ngOnInit() {
    this.sub = this.pushService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = this.pushService.getUnreadCount();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications && this.unreadCount > 0) {
      this.pushService.markAllAsRead();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  subscribeToPush() {
    this.pushService.subscribeToNotifications();
  }
}
