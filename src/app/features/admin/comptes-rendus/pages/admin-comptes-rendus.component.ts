import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { BulkDeleteService } from '../../../../core/services/bulk-delete.service';
import { BulkActionsBarComponent } from '../../../../shared/components/bulk-actions-bar/bulk-actions-bar.component';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-comptes-rendus',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AlertPopupComponent, ConfirmDialogComponent, BulkActionsBarComponent],
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


    

    <!-- Bulk Actions Bar -->
    <app-bulk-actions-bar
      [selectedCount]="selectedIds.size"
      [loading]="loadingBulk"
      (deleteSelected)="bulkDeleteSelected()"
      (deleteAll)="bulkDeleteAll()"
      (clear)="clearSelection()">
    </app-bulk-actions-bar>

<!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center shrink-0">
          <i class="fa-solid fa-file-contract text-[#008d36] text-2xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Comptes-Rendus</h2>
          <p class="text-[13px] text-gray-500 font-medium mt-0.5">{{ total }} rapports et synthèses disponibles.</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button (click)="action('Rédiger')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#008d36] transition-colors flex items-center gap-2">
          <i class="fa-solid fa-pen-nib"></i> Rédiger
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div *ngIf="isLoading" class="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-[#008d36] mb-4"></i>
        <p class="text-gray-500 text-sm font-medium">Chargement des comptes-rendus...</p>
      </div>
    </div>

    <div *ngIf="!isLoading && comptesRendus.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-file-contract text-3xl text-gray-300"></i>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">Aucun compte-rendu</h3>
      <p class="text-sm text-gray-500">Rédigez le premier rapport pour cette instance.</p>
    </div>

    <!-- Select All Bar -->
    <div *ngIf="!isLoading && comptesRendus.length > 0" class="mb-4 flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100">
      <input type="checkbox" [checked]="selectedIds.size === comptesRendus.length && comptesRendus.length > 0" (change)="toggleAllSelection()" class="w-4 h-4 cursor-pointer accent-[#008d36]">
      <span class="text-sm font-semibold text-gray-600">Sélectionner tout ({{ comptesRendus.length }})</span>
    </div>

    <div *ngIf="!isLoading && comptesRendus.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div *ngFor="let cr of comptesRendus; trackBy: trackById" class="relative bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 p-5 group hover:shadow-lg transition-all relative overflow-hidden flex flex-col"
           [class.bg-red-50]="isSelected(cr.id)"
           [class.ring-2]="isSelected(cr.id)"
           [class.ring-red-400]="isSelected(cr.id)">
        <input type="checkbox" [checked]="isSelected(cr.id)" (change)="toggleSelection(cr.id)" class="absolute top-3 right-3 w-4 h-4 cursor-pointer accent-[#008d36] z-10">
        
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span [class]="getStatutClass(cr.statut)" class="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{{ cr.statut }}</span>
            </div>
            <h3 class="text-[16px] font-bold text-gray-900 leading-snug line-clamp-2">{{ cr.titre }}</h3>
            <p class="text-[13px] text-gray-500 font-medium mt-2 flex items-center gap-1.5"><i class="fa-solid fa-location-dot text-gray-400"></i> {{ cr.lieu }}</p>
            <p class="text-[13px] text-gray-500 font-medium mt-1 flex items-center gap-1.5"><i class="fa-solid fa-user-pen text-gray-400"></i> {{ cr.auteur }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-[#e6f3eb] flex items-center justify-center shrink-0">
             <i class="fa-regular fa-file-lines text-[#008d36] text-xl"></i>
          </div>
        </div>
        
        <div class="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
          <span class="text-xs font-bold text-gray-400 flex items-center gap-1.5"><i class="fa-regular fa-calendar"></i> {{ cr.date | date:'dd/MM/yyyy' }}</span>
          <div class="flex gap-2">
            <button class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
               <i class="fa-solid fa-eye text-xs"></i>
            </button>
            <button (click)="action('Supprimer', cr.id)" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors">
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
               <i class="fa-solid fa-pen-nib text-[#008d36]"></i>
             </div>
             Nouveau compte-rendu
          </h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Titre <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.titre" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" placeholder="Titre du rapport">
          </div>
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Lieu</label>
            <input type="text" [(ngModel)]="formData.lieu" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" placeholder="Siège, Mairie, etc.">
          </div>
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Auteur</label>
            <input type="text" [(ngModel)]="formData.auteur" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" placeholder="Nom de l'auteur">
          </div>
          <div class="flex justify-end gap-3 pt-3">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">Annuler</button>
            <button (click)="submitForm()" class="px-6 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#008d36] rounded-xl transition-colors shadow-sm flex items-center gap-2">
              <i class="fa-solid fa-check"></i> Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AdminComptesRendusComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  comptesRendus: any[] = [];
  total = 0;
  isLoading = true;

  showModal = false;
  formData = {
    titre: '',
    lieu: '',
    auteur: 'Admin'
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


  // === BULK DELETE STATE ===
  selectedIds: Set<string> = new Set();
  loadingBulk = false;

  toggleSelection(id: string) {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
    this.cdr.markForCheck();
  }

  toggleAllSelection() {
    if (this.selectedIds.size === this.comptesRendus.length) this.selectedIds.clear();
    else this.comptesRendus.forEach((i: any) => this.selectedIds.add(i.id));
    this.cdr.markForCheck();
  }

  isSelected(id: string): boolean { return this.selectedIds.has(id); }

  clearSelection() {
    this.selectedIds.clear();
    this.cdr.markForCheck();
  }

  bulkDeleteSelected() {
    if (this.selectedIds.size === 0) return;
    this.openConfirm('Supprimer la selection ?', 'Vous allez supprimer ' + this.selectedIds.size + ' compte(s)-rendu. Cette action est irreversible.', 'bulk_delete_selected');
  }

  bulkDeleteAll() {
    this.openConfirm('Supprimer TOUS les compte(s)-rendu ?', 'ATTENTION: Cette action supprimera TOUS les compte(s)-rendu de la base.', 'bulk_delete_all');
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

  onConfirmAction() {
    this.showConfirmDialog = false;
    if (this.confirmActionType === 'delete' && this.confirmActionId) {
      this.isLoading = true;
      this.adminData.deleteEntity('comptes-rendus', this.confirmActionId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.refreshData();
          this.showAlert('Compte-rendu supprimé avec succès');
        },
        error: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.showAlert('Erreur lors de la suppression', 'error');
        }
      });
    } else if (this.confirmActionType === 'bulk_delete_selected') {
      this.loadingBulk = true;
      const ids = Array.from(this.selectedIds);
      Promise.all(ids.map(id => this.adminData.deleteEntity('comptes-rendus', id).toPromise()))
        .then(() => {
          this.comptesRendus = this.comptesRendus.filter((cr: any) => !this.selectedIds.has(cr.id));
          this.total = this.comptesRendus.length;
          this.selectedIds.clear();
          this.loadingBulk = false;
          this.cdr.markForCheck();
          this.showAlert(ids.length + ' compte(s)-rendu supprimé(s)');
        })
        .catch(() => { this.loadingBulk = false; this.cdr.markForCheck(); this.showAlert('Erreur', 'error'); });
    } else if (this.confirmActionType === 'bulk_delete_all') {
      this.loadingBulk = true;
      Promise.all(this.comptesRendus.map((cr: any) => this.adminData.deleteEntity('comptes-rendus', cr.id).toPromise()))
        .then(() => {
          this.comptesRendus = [];
          this.total = 0;
          this.selectedIds.clear();
          this.loadingBulk = false;
          this.cdr.markForCheck();
          this.showAlert('Tous les comptes-rendus supprimés');
        })
        .catch(() => { this.loadingBulk = false; this.cdr.markForCheck(); this.showAlert('Erreur', 'error'); });
    }
  }

  constructor(
    private adminData: AdminDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.refreshData(); }

  refreshData() {
    this.adminData.getComptesRendus().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => { 
        this.comptesRendus = res.data; 
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

  getStatutClass(statut: string): string {
    const map: any = {
      'PUBLIE': 'bg-[#e6f3eb] text-[#008d36]',
      'INTERNE': 'bg-purple-50 text-purple-600',
      'BROUILLON': 'bg-gray-100 text-gray-500'
    };
    return map[statut] || 'bg-gray-100 text-gray-500';
  }

  action(type: string, id?: string) {
    if (type === 'Rédiger') {
      this.formData = { titre: '', lieu: '', auteur: 'Admin' };
      this.showModal = true;
    } else if (type === 'Supprimer' && id) {
      this.openConfirm('Supprimer ce compte-rendu ?', 'Êtes-vous sûr de vouloir supprimer définitivement ce compte-rendu ?', 'delete', id);
    }
  }

  submitForm() {
    if (!this.formData.titre) {
      this.showAlert('Veuillez saisir un titre', 'info');
      return;
    }
      this.isLoading = true;
    this.showModal = false;
    this.adminData.createEntity('comptes-rendus', { 
      titre: this.formData.titre, 
      contenu: 'Contenu généré...', 
      lieu: this.formData.lieu,
      auteur: this.formData.auteur, 
      date: new Date().toISOString() 
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.refreshData());
  }

  ngOnDestroy() {
    this.destroy$!.next();
    this.destroy$!.complete();
  }
}
