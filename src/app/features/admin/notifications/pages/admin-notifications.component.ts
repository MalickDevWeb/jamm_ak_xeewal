import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';
import { GroupService, GroupItem } from '../../../../core/services/group.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AlertPopupComponent],
  template: `
<div class="animate-fade-in-up max-w-[1200px] mx-auto pb-12">
  <!-- Alert -->
  <app-alert-popup [visible]="showAlert" [type]="alertType" [message]="alertMessage" (close)="showAlert = false"></app-alert-popup>

  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <div class="flex items-center gap-4">
      <div class="w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center shrink-0">
        <i class="fa-solid fa-bell text-[#008d36] text-2xl"></i>
      </div>
      <div>
        <h2 class="text-2xl font-black text-gray-900 tracking-tight">Notifications Centralisées</h2>
        <p class="text-[13px] text-gray-500 font-medium mt-0.5">
          Envoyez des messages ciblés aux groupes (Quartiers, Commissions) via différents canaux.
        </p>
      </div>
    </div>
    
    <!-- DASHBOARD HISTORIQUE -->
    <div class="mt-12 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 class="text-lg font-black text-gray-800 flex items-center gap-2">
          <i class="fa-solid fa-clock-rotate-left text-[#008d36]"></i> Historique des envois
        </h3>
        <button (click)="loadNotifications()" class="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-[#008d36] hover:border-[#008d36] transition-colors flex items-center justify-center">
          <i class="fa-solid fa-rotate-right" [class.fa-spin]="isLoadingHistory"></i>
        </button>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/80 border-b border-gray-100">
              <th class="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-wider">Date & Heure</th>
              <th class="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-wider">Titre / Message</th>
              <th class="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-wider">Statut</th>
              <th class="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr *ngFor="let notif of notificationsHistory" class="hover:bg-gray-50/50 transition-colors">
              <td class="py-4 px-6">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-700">{{ notif.createdAt | date:'dd MMM yyyy' }}</span>
                  <span class="text-xs text-gray-400 font-medium">{{ notif.createdAt | date:'HH:mm' }}</span>
                </div>
              </td>
              <td class="py-4 px-6">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-gray-800">{{ notif.title }}</span>
                  <span class="text-xs text-gray-500 line-clamp-1 max-w-[300px]">{{ notif.message }}</span>
                </div>
              </td>
              <td class="py-4 px-6">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide"
                  [ngClass]="{
                    'bg-amber-100 text-amber-700': notif.status === 'PENDING' || notif.status === 'PROCESSING',
                    'bg-blue-100 text-blue-700': notif.status === 'SCHEDULED',
                    'bg-[#008d36]/10 text-[#008d36]': notif.status === 'SENT',
                    'bg-red-100 text-red-700': notif.status === 'FAILED'
                  }">
                  <i class="fa-solid text-[10px]"
                    [ngClass]="{
                      'fa-circle-notch fa-spin': notif.status === 'PROCESSING',
                      'fa-clock': notif.status === 'PENDING' || notif.status === 'SCHEDULED',
                      'fa-check': notif.status === 'SENT',
                      'fa-triangle-exclamation': notif.status === 'FAILED'
                    }"></i>
                  {{ notif.status }}
                </span>
              </td>
              <td class="py-4 px-6 text-right">
                <button class="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:text-[#008d36] hover:bg-[#008d36]/10 transition-colors flex items-center justify-center">
                  <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
              </td>
            </tr>
            <tr *ngIf="notificationsHistory.length === 0 && !isLoadingHistory">
              <td colspan="4" class="py-12 text-center">
                <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fa-regular fa-folder-open text-gray-300 text-2xl"></i>
                </div>
                <h4 class="text-gray-900 font-bold mb-1">Aucun historique</h4>
                <p class="text-sm text-gray-400">Les notifications envoyées apparaîtront ici.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- Formulaire d'envoi -->
    <div class="lg:col-span-2 space-y-6">

      <!-- Sélection des groupes -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
          <i class="fa-solid fa-users text-[#008d36] mr-2"></i>Ciblage
        </h3>
        
        <div *ngIf="isLoadingGroups" class="text-center py-4 text-gray-400 text-sm">
          <i class="fa-solid fa-spinner animate-spin mr-2"></i> Chargement des groupes...
        </div>

        <div *ngIf="!isLoadingGroups && groups.length === 0" class="text-sm text-gray-500 py-2">
          Aucun groupe disponible. Veuillez créer des groupes dans la section "Groupes".
        </div>

        <div *ngIf="!isLoadingGroups && groups.length > 0" class="max-h-48 overflow-y-auto space-y-2">
          <div *ngFor="let g of groups" 
               (click)="toggleGroup(g.id)"
               class="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
               [ngClass]="{'border-[#008d36] bg-[#e6f3eb]/40': selectedGroupIds.has(g.id)}">
            <div>
              <p class="font-bold text-sm text-gray-900">{{ g.name }}</p>
              <p class="text-xs text-gray-500">{{ g.type }} • {{ g._count?.GroupMember || 0 }} membre(s)</p>
            </div>
            <input type="checkbox" [checked]="selectedGroupIds.has(g.id)" class="w-4 h-4 text-[#008d36] border-gray-300 rounded focus:ring-[#008d36]" />
          </div>
        </div>
        
        <p *ngIf="selectedGroupIds.size > 0" class="text-xs text-[#008d36] font-bold mt-3">
          Le système dédupliquera automatiquement les membres appartenant à plusieurs groupes.
        </p>
      </div>

      <!-- Canaux -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-sm font-black text-gray-700 uppercase tracking-wider mb-4">
          <i class="fa-solid fa-satellite-dish text-[#008d36] mr-2"></i>Canaux de diffusion
        </h3>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" disabled checked class="w-4 h-4 text-[#008d36] border-gray-300 rounded focus:ring-[#008d36]" />
            <span class="text-sm font-bold text-gray-800">Interne (In-App)</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" [(ngModel)]="form.usePush" class="w-4 h-4 text-[#008d36] border-gray-300 rounded focus:ring-[#008d36]" />
            <span class="text-sm font-bold text-gray-800">Web Push</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" [(ngModel)]="form.useEmail" class="w-4 h-4 text-[#008d36] border-gray-300 rounded focus:ring-[#008d36]" />
            <span class="text-sm font-bold text-gray-800">Email</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" [(ngModel)]="form.useSms" class="w-4 h-4 text-[#008d36] border-gray-300 rounded focus:ring-[#008d36]" />
            <span class="text-sm font-bold text-gray-800">SMS</span>
          </label>
        </div>
      </div>

      <!-- Formulaire Message -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 class="text-sm font-black text-gray-700 uppercase tracking-wider">
          <i class="fa-solid fa-pen-to-square text-[#008d36] mr-2"></i>Message
        </h3>

        <div>
          <label class="block text-xs font-bold text-gray-600 mb-2">Titre de la notification <span class="text-red-500">*</span></label>
          <input type="text" [(ngModel)]="form.title" maxlength="80"
            class="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#008d36] transition-all"
            placeholder="Ex: 🎉 Nouvel événement !">
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-600 mb-2">Message <span class="text-red-500">*</span></label>
          <textarea [(ngModel)]="form.body" rows="4" maxlength="500"
            class="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#008d36] transition-all resize-none"
            placeholder="Tapez votre message ici..."></textarea>
        </div>

        <!-- Planification -->
        <div>
          <label class="block text-xs font-bold text-gray-600 mb-2">Programmer l'envoi (Optionnel)</label>
          <div class="flex items-center gap-3">
            <input type="datetime-local" [(ngModel)]="form.scheduledAt"
              class="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#008d36] transition-all" />
            <button *ngIf="form.scheduledAt" (click)="form.scheduledAt = null" class="text-xs text-red-500 font-bold hover:underline">
              Effacer
            </button>
          </div>
          <p class="text-[11px] text-gray-400 mt-1">Laissez vide pour un envoi immédiat.</p>
        </div>

        <!-- Bouton d'envoi -->
        <button (click)="sendNotification()" [disabled]="isSending || !form.title || !form.body || selectedGroupIds.size === 0"
          class="w-full py-4 bg-gradient-to-r from-[#022c16] to-[#008d36] text-white text-sm font-black rounded-xl uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed">
          <i *ngIf="!isSending" class="fa-solid" [ngClass]="form.scheduledAt ? 'fa-calendar-check' : 'fa-paper-plane'"></i>
          <i *ngIf="isSending" class="fa-solid fa-circle-notch fa-spin"></i>
          {{ isSending ? 'Traitement en cours...' : (form.scheduledAt ? 'Programmer la notification' : 'Envoyer la notification') }}
        </button>
      </div>
    </div>

    <!-- Aperçu -->
    <div class="space-y-6">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-xs font-black text-gray-500 uppercase tracking-wider mb-4">Aperçu In-App</h3>
        <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div class="bg-white rounded-xl p-4 shadow-sm">
            <div class="flex gap-3">
              <div class="w-10 h-10 rounded-full bg-[#e6f3eb] text-[#008d36] flex items-center justify-center shrink-0">
                <i class="fa-solid fa-bell"></i>
              </div>
              <div>
                <p class="text-xs text-gray-400 mb-0.5">À l'instant</p>
                <p class="text-sm font-bold text-gray-900 leading-tight mb-1">{{ form.title || 'Titre...' }}</p>
                <p class="text-[13px] text-gray-600 leading-snug whitespace-pre-line">{{ form.body || 'Corps du message...' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>
  `
})
export class AdminNotificationsComponent implements OnInit {
  groups: GroupItem[] = [];
  isLoadingGroups = false;
  selectedGroupIds = new Set<string>();

  form = { title: '', body: '', usePush: false, useEmail: false, useSms: false, scheduledAt: null as string | null };
  isSending = false;

  notificationsHistory: any[] = [];
  isLoadingHistory = false;

  showAlert = false;
  alertType: AlertType = 'success';
  alertMessage = '';

  constructor(
    private groupService: GroupService,
    private notifService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadGroups();
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoadingHistory = true;
    this.cdr.markForCheck();
    this.notifService.getNotifications().subscribe({
      next: (res: any) => {
        // Supposons que l'API renvoie { data: [...] }
        this.notificationsHistory = res.data || [];
        this.isLoadingHistory = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingHistory = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadGroups() {
    this.isLoadingGroups = true;
    this.groupService.getGroups('ACTIVE').subscribe({
      next: (res) => {
        this.groups = res.data || [];
        this.isLoadingGroups = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingGroups = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleGroup(groupId: string) {
    if (this.selectedGroupIds.has(groupId)) {
      this.selectedGroupIds.delete(groupId);
    } else {
      this.selectedGroupIds.add(groupId);
    }
    this.cdr.markForCheck();
  }

  sendNotification() {
    if (!this.form.title || !this.form.body || this.selectedGroupIds.size === 0) return;
    
    this.isSending = true;
    this.cdr.markForCheck();

    const channels = ['IN_APP'];
    if (this.form.usePush) channels.push('PUSH');
    if (this.form.useEmail) channels.push('EMAIL');
    if (this.form.useSms) channels.push('SMS');

    const payload = {
      title: this.form.title,
      message: this.form.body,
      groupIds: Array.from(this.selectedGroupIds),
      channels: channels,
      scheduledAt: this.form.scheduledAt ? new Date(this.form.scheduledAt).toISOString() : undefined
    };

    this.notifService.sendNotification(payload).subscribe({
      next: (res) => {
        this.isSending = false;
        const msg = this.form.scheduledAt 
          ? 'Notification programmée avec succès.' 
          : 'Notification placée en file d\'attente avec succès (Worker asynchrone).';
        this.showAlertPopup('success', msg);
        this.form = { title: '', body: '', usePush: false, useEmail: false, useSms: false, scheduledAt: null };
        this.selectedGroupIds.clear();
        this.cdr.markForCheck();
        this.loadNotifications();
      },
      error: () => {
        this.isSending = false;
        this.showAlertPopup('error', 'Erreur lors de l\'envoi de la notification.');
        this.cdr.markForCheck();
      }
    });
  }

  showAlertPopup(type: AlertType, message: string) {
    this.alertType = type;
    this.alertMessage = message;
    this.showAlert = true;
  }
}
