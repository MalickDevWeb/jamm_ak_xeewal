import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-sondages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AlertPopupComponent, ConfirmDialogComponent],
  template: `
  <div class="animate-fade-in-up max-w-[1600px] mx-auto">

    <!-- Alert Popup -->
    <app-alert-popup 
      [message]="alertMessage" 
      [type]="alertType" 
      [visible]="showAlertPopup" 
      (close)="showAlertPopup = false">
    </app-alert-popup>

    <!-- Confirm Dialog -->
    <app-confirm-dialog
      [title]="confirmTitle"
      [message]="confirmMessage"
      [visible]="showConfirmDialog"
      (confirm)="onConfirmAction()"
      (cancel)="showConfirmDialog = false">
    </app-confirm-dialog>


    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center shrink-0">
          <i class="fa-solid fa-chart-bar text-[#008d36] text-2xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Sondages</h2>
          <p class="text-[13px] text-gray-500 font-medium mt-0.5">{{ total }} sondages créés pour consulter les citoyens.</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button (click)="action('Créer un sondage')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#008d36] transition-colors flex items-center gap-2">
          <i class="fa-solid fa-plus"></i> Créer un sondage
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div *ngIf="isLoading" class="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-[#008d36] mb-4"></i>
        <p class="text-gray-500 text-sm font-medium">Chargement des sondages...</p>
      </div>
    </div>
    
    <!-- Empty state -->
    <div *ngIf="!isLoading && sondages.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-chart-pie text-3xl text-gray-300"></i>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">Aucun sondage</h3>
      <p class="text-sm text-gray-500">Créez votre premier sondage pour interroger les citoyens.</p>
    </div>

    <!-- Cards Grid -->
    <div *ngIf="!isLoading && sondages.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div *ngFor="let s of sondages; trackBy: trackById" 
           class="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border-y border-r border-y-gray-100 border-r-gray-100 p-6 transition-all border-l-[6px]"
           [ngClass]="s.statut === 'ACTIF' ? 'border-l-[#008d36]' : 'border-l-gray-300'">
        
        <!-- Header carte -->
        <div class="flex items-start justify-between gap-4 mb-5">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span *ngIf="s.statut === 'ACTIF'" class="bg-[#e6f3eb] text-[#008d36] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center">
                <i class="fa-solid fa-circle-dot text-[8px] mr-1.5 animate-pulse"></i> ACTIF
              </span>
              <span *ngIf="s.statut !== 'ACTIF'" class="bg-gray-100 text-gray-500 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center">
                <i class="fa-solid fa-circle-xmark mr-1.5"></i> CLÔTURÉ
              </span>
              <span class="text-xs text-gray-500 font-medium bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">{{ s.participants }} participants</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 leading-snug">{{ s.question }}</h3>
          </div>
        </div>

        <!-- Options / Barres -->
        <div class="space-y-4 mb-6">
          <div *ngFor="let option of s.options; trackBy: trackByOptionId" class="group">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[13px] font-bold text-gray-700">{{ option.texte }}</span>
              <div class="flex items-center gap-2">
                <span class="text-[13px] font-black text-gray-900">{{ option.votes }}</span>
                <span class="text-xs font-bold text-gray-400 w-10 text-right">({{ getPct(option.votes, s.participants) }}%)</span>
              </div>
            </div>
            <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-1000 ease-out"
                   [ngClass]="s.statut === 'ACTIF' ? 'bg-[#008d36]' : 'bg-gray-400'"
                   [style.width]="getPct(option.votes, s.participants) + '%'"></div>
            </div>
          </div>
        </div>

        <!-- Footer carte -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
          <div class="flex items-center gap-2 text-xs font-medium text-gray-400">
            <i class="fa-regular fa-calendar"></i>
            Créé le {{ s.createdAt | date:'dd/MM/yyyy' }}
          </div>
          <div class="flex gap-2">
            <button (click)="action('Clôturer', s.id)" *ngIf="s.statut === 'ACTIF'" class="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              Clôturer
            </button>
            <button (click)="action('Supprimer', s.id)" class="w-9 h-9 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
              <i class="fa-solid fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in-up my-4 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 class="font-black text-xl text-gray-900 flex items-center gap-3">
             <div class="w-10 h-10 rounded-xl bg-[#e6f3eb] flex items-center justify-center">
               <i class="fa-solid fa-plus text-[#008d36]"></i>
             </div>
             Créer un sondage
          </h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        
        <div class="p-6 space-y-5">
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Question du sondage <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.question" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" placeholder="Ex: Quel est le projet prioritaire ?">
          </div>
          
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Options (séparées par une virgule) <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.optionsStr" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" placeholder="Ex: Hôpital, Ecole, Route">
            <p class="text-[11px] text-gray-400 font-medium mt-2"><i class="fa-solid fa-circle-info mr-1"></i> Séparez chaque choix par une virgule.</p>
          </div>
          
          <div class="flex justify-end gap-3 pt-2">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">Annuler</button>
            <button (click)="submitForm()" class="px-6 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#008d36] rounded-xl transition-colors shadow-sm flex items-center gap-2">
              <i class="fa-solid fa-check"></i> Publier
            </button>
          </div>
        </div>
      </div>
    </div>
  
  </div>
  `
})
export class AdminsondagesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  sondages: any[] = [];
  total = 0;
  isLoading = true;

  showModal = false;
  formData = {
    question: '',
    optionsStr: ''
  };

  
  // Alert State
  alertMessage = '';
  alertType: AlertType = 'success';
  showAlertPopup = false;

  showAlert(message: string, type: AlertType = 'success') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertPopup = true;
    setTimeout(() => this.showAlertPopup = false, 3000);
  }

  // Confirm State
  showConfirmDialog = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmActionType = '';
  confirmActionId: any = null;

  openConfirm(title: string, message: string, actionType: string, id: any = null) {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmActionType = actionType;
    this.confirmActionId = id;
    this.showConfirmDialog = true;
  }

  constructor(
    private adminData: AdminDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.refreshData(); }

  refreshData() {
    this.adminData.getSondages().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => { 
        this.sondages = res.data; 
        this.total = res.total; 
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

  trackByOptionId(index: number, item: any): string {
    return item.id;
  }

  getPct(votes: number, total: number): number {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  }

  action(type: string, id?: string) {
    if (type === 'Créer un sondage') {
      this.formData = { question: '', optionsStr: '' };
      this.showModal = true;
    } else if (type === 'Clôturer' && id) {
      this.isLoading = true;
      this.adminData.updateEntity('sondages', id, { statut: 'CLOTURE' }).pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => this.refreshData());
    } else if (type === 'Supprimer' && id) {
      this.openConfirm('Supprimer', 'Voulez-vous vraiment supprimer ce sondage ?', 'Supprimer', id);
    }
  }

  onConfirmAction() {
    this.showConfirmDialog = false;
    if (this.confirmActionType === 'Supprimer' && this.confirmActionId) {
      this.isLoading = true;
      this.adminData.deleteEntity('sondages', this.confirmActionId).pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.showAlert('Sondage supprimé avec succès', 'success');
        this.refreshData();
      });
    }
  }

  submitForm() {
    if (!this.formData.question || !this.formData.optionsStr) {
      this.showAlert('Veuillez remplir tous les champs', 'error');
      return;
    }
    const options = this.formData.optionsStr.split(',').map(o => o.trim()).filter(o => o.length > 0);
      this.isLoading = true;
    this.showModal = false;
    this.adminData.createEntity('sondages', { question: this.formData.question, options }).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.refreshData());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
