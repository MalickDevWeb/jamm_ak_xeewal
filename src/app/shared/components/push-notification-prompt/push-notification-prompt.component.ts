import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PushNotificationService } from '../../../core/services/push-notification.service';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-push-notification-prompt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './push-notification-prompt.component.html',
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(120px)', opacity: 0 }),
        animate('500ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(120px)', opacity: 0 }))
      ])
    ]),
    trigger('successPop', [
      transition(':enter', [
        animate('600ms cubic-bezier(0.34, 1.56, 0.64, 1)', keyframes([
          style({ transform: 'scale(0) rotate(-15deg)', opacity: 0, offset: 0 }),
          style({ transform: 'scale(1.1) rotate(5deg)', opacity: 1, offset: 0.7 }),
          style({ transform: 'scale(1) rotate(0deg)', opacity: 1, offset: 1 })
        ]))
      ])
    ]),
    trigger('bellRing', [
      transition(':enter', [
        animate('800ms ease', keyframes([
          style({ transform: 'rotate(0deg)', offset: 0 }),
          style({ transform: 'rotate(-25deg)', offset: 0.15 }),
          style({ transform: 'rotate(25deg)', offset: 0.3 }),
          style({ transform: 'rotate(-20deg)', offset: 0.45 }),
          style({ transform: 'rotate(20deg)', offset: 0.6 }),
          style({ transform: 'rotate(-10deg)', offset: 0.75 }),
          style({ transform: 'rotate(0deg)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class PushNotificationPromptComponent implements OnInit {
  showPrompt = false;
  showSuccess = signal(false);
  isSubscribing = signal(false);
  isAlreadySubscribed = signal(false);

  constructor(private pushService: PushNotificationService) {}

  ngOnInit(): void {
    this.checkPromptStatus();
  }

  private checkPromptStatus(): void {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) return;

    if (Notification.permission === 'granted') {
      this.isAlreadySubscribed.set(true);
      return;
    }

    if (Notification.permission !== 'default') return;

    const dismissed = localStorage.getItem('jamm_push_prompt_dismissed');
    if (dismissed) {
      const dismissDate = parseInt(dismissed, 10);
      if (new Date().getTime() - dismissDate < 86400000) return;
    }

    setTimeout(() => { this.showPrompt = true; }, 5000);
  }

  async subscribe(): Promise<void> {
    this.isSubscribing.set(true);
    await this.pushService.subscribeToNotifications();

    if (Notification.permission === 'granted') {
      this.isSubscribing.set(false);
      this.showPrompt = false;
      this.showSuccess.set(true);
      this.isAlreadySubscribed.set(true);
      setTimeout(() => this.showSuccess.set(false), 4000);
    } else {
      this.isSubscribing.set(false);
      this.dismiss();
    }
  }

  dismiss(): void {
    this.showPrompt = false;
    localStorage.setItem('jamm_push_prompt_dismissed', new Date().getTime().toString());
  }
}
