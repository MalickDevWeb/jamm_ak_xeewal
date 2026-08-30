import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
  <div class="animate-fade-in-up max-w-[1600px] mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center shrink-0">
          <i class="fa-solid fa-envelope text-[#008d36] text-2xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Messages (Contact)</h2>
          <p class="text-[13px] text-gray-500 font-medium mt-0.5">{{ nonLus }} non lu(s) sur {{ total }} messages.</p>
        </div>
      </div>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <div class="relative w-full sm:w-72">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input type="text" placeholder="Rechercher un message..." class="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-medium text-gray-900 focus:outline-none focus:border-[#008d36] focus:ring-1 focus:ring-[#008d36] focus:bg-white transition-all">
        </div>
        <button class="px-5 py-2.5 bg-[#e6f3eb] text-[#008d36] rounded-xl text-sm font-bold shadow-sm hover:bg-[#d1e8d9] transition-colors flex items-center gap-2 shrink-0">
          <i class="fa-solid fa-filter"></i> Filtres
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div *ngIf="isLoading" class="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-[#008d36] mb-4"></i>
        <p class="text-gray-500 text-sm font-medium">Chargement des messages...</p>
      </div>
    </div>

    <!-- Empty state -->
    <div *ngIf="!isLoading && messages.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <i class="fa-regular fa-envelope text-3xl text-gray-300"></i>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">Aucun message</h3>
      <p class="text-sm text-gray-500">Vous n'avez reçu aucun message pour le moment.</p>
    </div>

    <!-- Cards Grid -->
    <div *ngIf="!isLoading && messages.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      <div *ngFor="let m of messages; trackBy: trackById"
           class="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border-y border-r border-y-gray-100 border-r-gray-100 overflow-hidden flex flex-col p-5 group hover:shadow-lg transition-all border-l-[6px] hover:-translate-y-1"
           [ngClass]="getCardStyle(m).borderClass">
        
        <!-- Card Header -->
        <div class="flex items-start justify-between mb-4 gap-2">
          <div class="flex items-center gap-3 overflow-hidden">
            <!-- Avatar -->
            <div class="w-10 h-10 rounded-full bg-[#022c16] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {{ m.nom.charAt(0) | uppercase }}
            </div>
            <div class="min-w-0">
              <h3 class="font-bold text-[15px] text-gray-900 flex items-center gap-2 truncate">
                <span class="truncate">{{ m.nom }}</span>
                <span *ngIf="!m.lu" class="w-1.5 h-1.5 rounded-full bg-[#008d36] shrink-0"></span>
              </h3>
              <p class="text-[11px] font-medium text-gray-500 flex items-center gap-1.5 truncate">
                <i class="fa-regular fa-envelope text-gray-400 shrink-0"></i> 
                <span class="truncate" [title]="m.email">{{ m.email }}</span>
              </p>
            </div>
          </div>
          <!-- Right Side (Status & Date) -->
          <div class="flex flex-col items-end gap-2 shrink-0">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide" [ngClass]="getCardStyle(m).badgeClass">
              {{ m.lu ? 'Lu' : (isUrgent(m) ? 'Urgent' : 'Non lu') }}
            </span>
            <span class="text-[11px] font-medium text-gray-500 flex items-center gap-1">
              <i class="fa-regular fa-calendar text-gray-400"></i> {{ m.createdAt | date:'dd/MM/yyyy' }}
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="mb-4 flex-1">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold mb-3 uppercase tracking-wide truncate max-w-full" [ngClass]="getCardStyle(m).subjectClass">
            <i class="fa-regular fa-comment-dots shrink-0"></i> 
            <span class="truncate" [title]="m.sujet">Sujet : {{ m.sujet }}</span>
          </div>
          <p class="text-[13px] text-gray-600 font-medium leading-relaxed line-clamp-2">
            {{ m.contenu }}
          </p>
        </div>

        <!-- Card Footer -->
        <div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <button (click)="openMessage(m)" class="px-4 py-1.5 bg-[#e6f3eb] text-[#008d36] hover:bg-[#d1e8d9] rounded-lg text-[11px] font-black uppercase transition-colors flex items-center gap-1.5">
            <i class="fa-solid fa-eye"></i> Voir
          </button>
          <button (click)="action('Supprimer', m.id)" class="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
            <i class="fa-solid fa-trash text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  
    <!-- Modal Voir Message -->
    <div *ngIf="selectedMessage" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in-up my-4 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 class="font-black text-xl text-gray-900 flex items-center gap-3">
             <div class="w-10 h-10 rounded-xl bg-[#e6f3eb] flex items-center justify-center">
               <i class="fa-regular fa-envelope text-[#008d36]"></i>
             </div>
             Détails du message
          </h3>
          <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        
        <div class="p-6">
          <div class="flex items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-[#022c16] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                {{ selectedMessage.nom.charAt(0) | uppercase }}
              </div>
              <div>
                <h4 class="font-bold text-lg text-gray-900 leading-tight mb-0.5">{{ selectedMessage.nom }}</h4>
                <p class="text-[13px] text-gray-500 font-medium">{{ selectedMessage.email }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">{{ selectedMessage.createdAt | date:'dd/MM/yyyy à HH:mm' }}</p>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide inline-block" [ngClass]="getCardStyle(selectedMessage).badgeClass">
                {{ selectedMessage.lu ? 'Lu' : (isUrgent(selectedMessage) ? 'Urgent' : 'Non lu') }}
              </span>
            </div>
          </div>
          
          <div class="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
            <h5 class="font-black text-gray-900 mb-3 border-b border-gray-200 pb-3">Sujet : {{ selectedMessage.sujet }}</h5>
            <p class="text-[13px] text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{{ selectedMessage.contenu }}</p>
          </div>
          
          <div class="flex justify-end gap-3 pt-2">
            <button (click)="action('Supprimer', selectedMessage.id); closeModal()" class="px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-2 shadow-sm">
              <i class="fa-solid fa-trash"></i> Supprimer
            </button>
            <button (click)="action('Répondre', selectedMessage.id)" class="px-6 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#008d36] rounded-xl transition-colors shadow-sm flex items-center gap-2">
              <i class="fa-solid fa-reply"></i> Répondre
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AdminmessagesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  messages: any[] = [];
  total = 0;
  nonLus = 0;
  isLoading = true;

  constructor(
    private adminData: AdminDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.refreshData(); }

  refreshData() {
    this.adminData.getMessages().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        this.messages = res.data;
        this.total = res.total;
        this.nonLus = res.data.filter((m: any) => !m.lu).length;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { 
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  selectedMessage: any = null;

  isUrgent(m: any): boolean {
    const s = (m.sujet || '').toLowerCase();
    return s.includes('urgent') || s.includes('problème') || s.includes('alerte');
  }

  getCardStyle(m: any) {
    if (this.isUrgent(m)) {
      return {
        borderClass: 'border-l-red-500',
        badgeClass: 'bg-red-50 text-red-600',
        subjectClass: 'bg-red-50 text-red-600'
      };
    }
    if (m.lu) {
      return {
        borderClass: 'border-l-orange-400',
        badgeClass: 'bg-blue-50 text-blue-600',
        subjectClass: 'bg-gray-100 text-gray-700'
      };
    }
    // Default (Non lu)
    return {
      borderClass: 'border-l-[#008d36]',
      badgeClass: 'bg-[#e6f3eb] text-[#008d36]',
      subjectClass: 'bg-[#e6f3eb] text-[#008d36]'
    };
  }

  openMessage(m: any) {
    this.selectedMessage = m;
    if (!m.lu) {
      this.action('Marquer lu', m.id);
    }
  }

  closeModal() {
    this.selectedMessage = null;
  }

  action(type: string, id: string) {
    if (type === 'Marquer lu') {
      this.adminData.updateEntity('messages', id, { lu: true }).pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
         const m = this.messages.find(msg => msg.id === id);
         if (m) { m.lu = true; }
         this.nonLus = this.messages.filter((msg: any) => !msg.lu).length;
         this.cdr.markForCheck();
      });
    } else if (type === 'Supprimer') {
      if (confirm('Supprimer ce message ?')) {
        this.isLoading = true;
        this.adminData.deleteEntity('messages', id).pipe(
          takeUntil(this.destroy$)
        ).subscribe(() => this.refreshData());
      }
    } else if (type === 'Répondre') {
      alert('La fonctionnalité d\'envoi d\'email (Répondre) est en cours d\'intégration.');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
