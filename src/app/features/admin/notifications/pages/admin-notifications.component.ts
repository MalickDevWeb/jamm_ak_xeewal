import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';
import { environment } from '../../../../../environments/environment';

interface NotifTemplate {
  icon: string;
  label: string;
  title: string;
  body: string;
  url: string;
  color: string;
}

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AlertPopupComponent],
  template: `
<div class="animate-fade-in-up max-w-[1200px] mx-auto">

  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <div>
      <h2 class="text-[28px] font-black text-gray-900 tracking-tight">Notifications Push</h2>
      <p class="text-[15px] text-gray-500 mt-1">
        Envoyez des notifications instantanées à <span class="font-bold text-[#008d36]">tous les abonnés</span> de la PWA.
      </p>
    </div>
    <div class="flex items-center gap-2 bg-[#e6f3eb] text-[#008d36] px-4 py-2 rounded-xl text-sm font-bold border border-[#d1e8d9]">
      <i class="fa-solid fa-bell"></i>
      <span>{{ subscriberCount }} abonné{{ subscriberCount > 1 ? 's' : '' }}</span>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- Formulaire d'envoi -->
    <div class="lg:col-span-2 space-y-6">

      <!-- Choisir un modèle -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
          <i class="fa-solid fa-magic-wand-sparkles text-[#008d36] mr-2"></i>Modèles rapides
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button *ngFor="let t of templates" (click)="applyTemplate(t)"
            class="text-left p-3 border-2 rounded-xl transition-all hover:shadow-md"
            [ngClass]="selectedTemplate === t.label ? 'border-[#008d36] bg-[#e6f3eb]' : 'border-gray-100 hover:border-gray-200'">
            <div class="text-2xl mb-1">{{ t.icon }}</div>
            <div class="text-xs font-bold text-gray-700">{{ t.label }}</div>
          </button>
        </div>
      </div>

      <!-- Formulaire -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 class="text-sm font-black text-gray-700 uppercase tracking-wider">
          <i class="fa-solid fa-pen-to-square text-[#008d36] mr-2"></i>Personnaliser le message
        </h3>

        <div>
          <label class="block text-xs font-bold text-gray-600 mb-2">Titre de la notification <span class="text-red-500">*</span></label>
          <input type="text" [(ngModel)]="form.title" maxlength="80"
            class="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#008d36] transition-all"
            placeholder="Ex: 🎉 Nouvel événement JÀMM AK XÉEWAL !">
          <p class="text-[11px] text-gray-400 mt-1 text-right">{{ form.title.length }}/80</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-600 mb-2">Message <span class="text-red-500">*</span></label>
          <textarea [(ngModel)]="form.body" rows="3" maxlength="200"
            class="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#008d36] transition-all resize-none"
            placeholder="Décrivez brièvement l'actualité ou l'événement..."></textarea>
          <p class="text-[11px] text-gray-400 mt-1 text-right">{{ form.body.length }}/200</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-600 mb-2">Lien de destination (optionnel)</label>
          <div class="relative">
            <i class="fa-solid fa-link absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input type="text" [(ngModel)]="form.url"
              class="w-full border-2 border-gray-100 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#008d36] transition-all"
              placeholder="Ex: /activites ou /adherer">
          </div>
          <p class="text-[11px] text-gray-400 mt-1">Laissez vide pour rediriger vers l'accueil</p>
        </div>

        <!-- Bouton d'envoi -->
        <button (click)="sendNotification()" [disabled]="isSending || !form.title || !form.body"
          class="w-full py-4 bg-gradient-to-r from-[#022c16] to-[#008d36] text-white text-sm font-black rounded-xl uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:shadow-[0_10px_25px_rgba(0,141,54,0.3)] transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
          <i *ngIf="!isSending" class="fa-solid fa-bell"></i>
          <i *ngIf="isSending" class="fa-solid fa-circle-notch fa-spin"></i>
          {{ isSending ? 'Envoi en cours...' : 'Envoyer la notification à tous' }}
        </button>
      </div>
    </div>

    <!-- Aperçu + Historique -->
    <div class="space-y-6">

      <!-- Aperçu simulé de la notification -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">Aperçu</h3>
        <div class="bg-gray-900 rounded-2xl p-4 shadow-xl">
          <!-- Phone top bar -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-white text-[10px] font-bold">JAMMAKXEEWAL.SN</span>
            <div class="flex gap-1">
              <div class="w-1 h-1 rounded-full bg-white/40"></div>
              <div class="w-1 h-1 rounded-full bg-white/40"></div>
              <div class="w-1 h-1 rounded-full bg-white/40"></div>
            </div>
          </div>
          <!-- Notification card -->
          <div class="bg-white rounded-xl p-3 shadow-lg">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#022c16] flex items-center justify-center shrink-0 text-white text-lg">
                🌿
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">jammakxeewal.sn</p>
                  <span class="text-[9px] text-gray-400">maintenant</span>
                </div>
                <p class="text-[12px] font-bold text-gray-900 mt-0.5 leading-tight break-words">
                  {{ form.title || 'Titre de la notification' }}
                </p>
                <p class="text-[11px] text-gray-500 mt-0.5 leading-snug break-words">
                  {{ form.body || 'Corps du message...' }}
                </p>
              </div>
            </div>
          </div>
          <!-- Sound icon -->
          <div class="flex items-center justify-center mt-3 gap-2">
            <i class="fa-solid fa-volume-high text-white/40 text-xs"></i>
            <span class="text-[10px] text-white/40">Sonnerie activée</span>
          </div>
        </div>
      </div>

      <!-- Dernier envoi -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">Historique (session)</h3>
        <div *ngIf="history.length === 0" class="text-center py-6 text-gray-400">
          <i class="fa-regular fa-bell-slash text-2xl mb-2"></i>
          <p class="text-xs font-medium">Aucun envoi effectué</p>
        </div>
        <div *ngFor="let h of history" class="mb-3 last:mb-0 p-3 bg-[#e6f3eb] rounded-xl">
          <div class="flex items-start gap-2">
            <i class="fa-solid fa-circle-check text-[#008d36] mt-0.5 text-xs shrink-0"></i>
            <div class="min-w-0">
              <p class="text-xs font-bold text-gray-800 truncate">{{ h.title }}</p>
              <p class="text-[11px] text-gray-500 mt-0.5">{{ h.sentAt }} · {{ h.count }} abonné(s)</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <app-alert-popup [visible]="showAlert" [type]="alertType" [title]="alertTitle" [message]="alertMessage" (close)="showAlert = false"></app-alert-popup>
</div>
  `
})
export class AdminNotificationsComponent {
  form = { title: '', body: '', url: '' };
  isSending = false;
  subscriberCount = 0;
  selectedTemplate = '';
  history: { title: string; sentAt: string; count: number }[] = [];

  showAlert = false;
  alertType: AlertType = 'success';
  alertTitle = '';
  alertMessage = '';

  templates: NotifTemplate[] = [
    { icon: '📅', label: 'Événement', title: '📅 Prochain événement !', body: 'Un nouvel événement est programmé. Rejoignez-nous !', url: '/activites', color: 'blue' },
    { icon: '📰', label: 'Actualité', title: '📰 Nouvelle actualité', body: 'Restez informé des dernières nouvelles du mouvement.', url: '/', color: 'green' },
    { icon: '🗣️', label: 'Causerie', title: '🗣️ Causerie citoyenne', body: 'Une causerie est organisée dans votre quartier.', url: '/activites', color: 'orange' },
    { icon: '✊', label: 'Appel adhésion', title: '✊ Rejoignez le mouvement !', body: 'Adhérez à JÀMM AK XÉEWAL et devenez acteur du changement.', url: '/adherer', color: 'green' },
    { icon: '💡', label: 'Idée', title: '💡 Partagez votre idée !', body: 'Le mouvement vous invite à proposer vos idées pour le quartier.', url: '/proposer-idee', color: 'yellow' },
    { icon: '🏆', label: 'Résultat', title: '🏆 Résultats du sondage', body: 'Découvrez les résultats de notre dernier sondage citoyen.', url: '/sondage', color: 'purple' },
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.loadSubscriberCount();
  }

  private loadSubscriberCount() {
    const token = localStorage.getItem('admin_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    this.http.get<any>(`${environment.apiUrl}/push/count`, headers ? { headers } : {}).subscribe({
      next: (res) => {
        if (res.success) this.subscriberCount = res.count || 0;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  applyTemplate(t: NotifTemplate) {
    this.selectedTemplate = t.label;
    this.form.title = t.title;
    this.form.body = t.body;
    this.form.url = t.url;
    this.cdr.markForCheck();
  }

  sendNotification() {
    if (!this.form.title || !this.form.body) return;
    this.isSending = true;
    this.cdr.markForCheck();

    const token = localStorage.getItem('admin_token');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    const payload = {
      title: this.form.title,
      body: this.form.body,
      url: this.form.url || '/',
      icon: 'https://www.jammakxeewal.sn/assets/icons/icon-192x192.png'
    };

    this.http.post<any>(`${environment.apiUrl}/push/send`, payload, headers ? { headers } : {}).subscribe({
      next: (res) => {
        this.isSending = false;
        if (res.success) {
          const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          this.history.unshift({ title: this.form.title, sentAt: now, count: this.subscriberCount });
          this.showAlertMethod('success', 'Notification envoyée !', res.message || `Envoyée à ${this.subscriberCount} abonné(s).`);
          this.form = { title: '', body: '', url: '' };
          this.selectedTemplate = '';
        } else {
          this.showAlertMethod('error', 'Erreur', 'Impossible d\'envoyer la notification.');
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSending = false;
        this.showAlertMethod('error', 'Erreur serveur', 'Vérifiez votre connexion et réessayez.');
        this.cdr.markForCheck();
      }
    });
  }

  private showAlertMethod(type: AlertType, title: string, message: string) {
    this.alertType = type;
    this.alertTitle = title;
    this.alertMessage = message;
    this.showAlert = true;
  }
}
