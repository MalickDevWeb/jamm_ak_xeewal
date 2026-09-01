import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PushNotificationService } from '../../../core/services/push-notification.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-push-notification-prompt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './push-notification-prompt.component.html',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(-100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class PushNotificationPromptComponent implements OnInit {
  showPrompt = false;

  constructor(private pushService: PushNotificationService) {}

  ngOnInit(): void {
    this.checkPromptStatus();
  }

  private checkPromptStatus(): void {
    // Vérifier si le navigateur supporte les notifications
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      return;
    }

    // Si on a déjà demandé et que ce n'est plus "default" (c'est granted ou denied)
    if (Notification.permission !== 'default') {
      return;
    }

    // Vérifier si l'utilisateur a ignoré le prompt pour la session/journée
    const dismissed = localStorage.getItem('jamm_push_prompt_dismissed');
    if (dismissed) {
      const dismissDate = parseInt(dismissed, 10);
      const now = new Date().getTime();
      // On le laisse tranquille pendant 24h (86400000 ms)
      if (now - dismissDate < 86400000) {
        return;
      }
    }

    // Attendre un peu avant d'afficher pour ne pas brusquer (ex: 5 secondes)
    setTimeout(() => {
      this.showPrompt = true;
    }, 5000);
  }

  async subscribe(): Promise<void> {
    this.showPrompt = false;
    await this.pushService.subscribeToNotifications();
    
    if (Notification.permission === 'granted') {
      alert("Merci ! Les notifications sont activées.");
    }
  }

  dismiss(): void {
    this.showPrompt = false;
    // Enregistrer la date de refus pour ne pas redemander tout de suite
    localStorage.setItem('jamm_push_prompt_dismissed', new Date().getTime().toString());
  }
}
