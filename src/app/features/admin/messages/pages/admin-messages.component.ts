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
  <div class="animate-fade-in-up">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Messages (Contact)</h2>
        <p class="text-sm text-gray-500 mt-1">{{ nonLus }} non lu(s) sur {{ total }} messages.</p>
      </div>
    </div>

    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-500 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
      <div *ngFor="let m of messages; trackBy: trackById"
        [class]="m.lu ? 'p-6 hover:bg-gray-50/50 transition-colors group' : 'p-6 bg-[#022c16]/[0.02] hover:bg-[#022c16]/[0.04] transition-colors group border-l-4 border-[#022c16]'">
        <div class="flex items-start gap-4">
          <div [class]="m.lu ? 'w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-sm shrink-0' : 'w-10 h-10 rounded-full bg-[#022c16] text-white flex items-center justify-center font-bold text-sm shrink-0'">
            {{ m.nom.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="font-bold text-gray-900 text-sm">{{ m.nom }}</span>
                <span *ngIf="!m.lu" class="w-2 h-2 bg-[#022c16] rounded-full"></span>
              </div>
              <span class="text-xs text-gray-400">{{ m.createdAt | date:'dd/MM/yyyy' }}</span>
            </div>
            <p class="text-xs text-gray-400 mb-1">{{ m.email }}</p>
            <p class="text-sm font-semibold text-gray-700 mb-1">{{ m.sujet }}</p>
            <p class="text-sm text-gray-500 line-clamp-2">{{ m.contenu }}</p>
          </div>
          <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button (click)="action('Marquer lu', m.id)" *ngIf="!m.lu" class="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="Marquer comme lu">
              <i class="fa-solid fa-check text-xs"></i>
            </button>
            <button (click)="action('Répondre', m.id)" class="p-2 text-gray-400 hover:text-[#022c16] hover:bg-[#022c16]/10 rounded-lg transition-colors" title="Répondre">
              <i class="fa-solid fa-reply text-xs"></i>
            </button>
            <button (click)="action('Supprimer', m.id)" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
              <i class="fa-solid fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Confirmation Dialog -->
    <app-confirm-dialog
      [visible]="showConfirmDialog"
      [title]="confirmTitle"
      message="Cette action est irréversible."
      (confirm)="confirmDelete()"
      (cancel)="showConfirmDialog = false">
    </app-confirm-dialog>
  </div>
  `
})
export class AdminmessagesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  messages: any[] = [];
  total = 0;
  nonLus = 0;
  isLoading = true;
  showConfirmDialog = false;
  itemToDelete: string | null = null;
  confirmTitle = "Confirmer la suppression";

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

  action(type: string, id: string) {
    if (type === 'Marquer lu') {
      this.isLoading = true;
  showConfirmDialog = false;
  itemToDelete: string | null = null;
  confirmTitle = "Confirmer la suppression";
      this.adminData.updateEntity('messages', id, { lu: true }).pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => this.refreshData());
    } else if (type === 'Supprimer') {
      this.itemToDelete = id;
      this.confirmTitle = 'Supprimer ce message ?';
      this.showConfirmDialog = true;
        this.isLoading = true;
  showConfirmDialog = false;
  itemToDelete: string | null = null;
  confirmTitle = "Confirmer la suppression";
        this.adminData.deleteEntity('messages', id).pipe(
          takeUntil(this.destroy$)
        ).subscribe(() => this.refreshData());
      }
    } else if (type === 'Répondre') {
      alert('La fonctionnalité d\'envoi d\'email (Répondre) est en cours d\'intégration.');
    }
  }

  
  deleteItem = (id: string) => {
    this.deleteMessage(id);
  };
  deleteItem = (id: string) => {
    this.deleteMessage(id);
  };
  confirmDelete() {
    if (this.itemToDelete) {
      this.deleteItem(this.itemToDelete);
      this.itemToDelete = null;
      this.showConfirmDialog = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
