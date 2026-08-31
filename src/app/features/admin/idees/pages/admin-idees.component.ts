import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-idees',
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
          <i class="fa-solid fa-lightbulb text-[#008d36] text-2xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Boîte à Idées</h2>
          <p class="text-[13px] text-gray-500 font-medium mt-0.5">{{ total }} idées proposées par les citoyens.</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button (click)="action('Nouvelle idée')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#008d36] transition-colors flex items-center gap-2">
          <i class="fa-solid fa-plus"></i> Nouvelle idée
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div *ngIf="isLoading" class="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-[#008d36] mb-4"></i>
        <p class="text-gray-500 text-sm font-medium">Chargement des idées...</p>
      </div>
    </div>

    <!-- Empty state -->
    <div *ngIf="!isLoading && idees.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <i class="fa-regular fa-lightbulb text-3xl text-gray-300"></i>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">Aucune idée</h3>
      <p class="text-sm text-gray-500">La boîte à idées est vide pour le moment.</p>
    </div>

    <!-- Cards Grid -->
    <div *ngIf="!isLoading && idees.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div *ngFor="let idee of idees" class="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border-y border-r border-y-gray-100 border-r-gray-100 overflow-hidden flex flex-col p-5 group hover:shadow-lg transition-all border-l-[6px] border-l-[#008d36]">
        
        <div class="flex items-center justify-between mb-4">
          <span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#e6f3eb] text-[#008d36] uppercase tracking-wide truncate max-w-[150px]">{{ idee.categorie }}</span>
          <span [class]="getStatutClass(idee.statut)" class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide shrink-0">{{ idee.statut.replace('_', ' ') }}</span>
        </div>

        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full bg-[#e6f3eb] flex items-center justify-center shrink-0">
            <i class="fa-solid fa-lightbulb text-[#008d36] text-lg"></i>
          </div>
          <h3 class="font-bold text-[16px] text-gray-900 line-clamp-1" [title]="idee.titre">{{ idee.titre }}</h3>
        </div>

        <p class="text-[13px] text-gray-500 font-medium mb-4 line-clamp-2 min-h-[40px]">{{ idee.description }}</p>

        <div class="flex items-center justify-between mt-auto mb-4">
          <div class="flex items-center gap-3 text-[11px] font-medium text-gray-400">
            <span class="flex items-center gap-1"><i class="fa-solid fa-user"></i> Anonyme</span>
            <span class="flex items-center gap-1"><i class="fa-regular fa-calendar"></i> {{ idee.createdAt | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="flex items-center gap-1.5 bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full font-black text-xs border border-yellow-100">
            <i class="fa-solid fa-thumbs-up"></i>
            <span>{{ idee.votes || 0 }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-4 border-t border-gray-50 flex gap-2">
          <button (click)="action('Approuver', idee.id)" class="flex-1 py-2 text-xs font-black text-white bg-[#022c16] hover:bg-[#008d36] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm">
            <i class="fa-solid fa-check"></i> Approuver
          </button>
          <button (click)="action('Rejeter', idee.id)" class="flex-1 py-2 text-xs font-black text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-xmark"></i> Rejeter
          </button>
          <button (click)="action('Supprimer', idee.id)" class="w-10 h-9 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors shrink-0">
            <i class="fa-solid fa-trash text-xs"></i>
          </button>
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
             Nouvelle Idée
          </h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        
        <div class="p-6 space-y-5">
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Titre de l'idée <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.titre" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" placeholder="Ex: Créer un parc...">
          </div>
          
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Catégorie</label>
            <select [(ngModel)]="formData.categorie" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none appearance-none">
              <option value="Environnement">Environnement</option>
              <option value="Santé">Santé</option>
              <option value="Éducation">Éducation</option>
              <option value="Sport">Sport</option>
              <option value="Social">Social</option>
              <option value="Économie">Économie</option>
              <option value="Culture">Culture</option>
            </select>
          </div>
          
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Description <span class="text-red-500">*</span></label>
            <textarea [(ngModel)]="formData.description" rows="3" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none resize-none" placeholder="Description de l'idée..."></textarea>
          </div>
          
          <div class="flex justify-end gap-3 pt-2">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">Annuler</button>
            <button (click)="submitForm()" class="px-6 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#008d36] rounded-xl transition-colors shadow-sm flex items-center gap-2">
              <i class="fa-solid fa-plus"></i> Créer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AdminideesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  idees: any[] = [];
  total = 0;
  isLoading = true;

  showModal = false;
  formData = {
    titre: '',
    categorie: 'Environnement',
    description: ''
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

  onConfirmAction() {
    this.showConfirmDialog = false;
    if (this.confirmActionType === 'delete' && this.confirmActionId) {
      this.isLoading = true;
      this.adminData.deleteEntity('idees', this.confirmActionId).subscribe({
        next: () => {
          this.refreshData();
          this.showAlert('Idée supprimée avec succès');
        },
        error: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.showAlert('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  constructor(private adminData: AdminDataService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.refreshData(); }

  refreshData() {
    this.adminData.getIdees().subscribe({
      next: (res: any) => { this.idees = res.data; this.total = res.total; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  getStatutClass(s: string): string {
    const map: any = { 
       'NOUVELLE': 'bg-yellow-50 text-yellow-600', 
       'A_LETUDE': 'bg-[#e6f3eb] text-[#008d36]', 
       'VALIDEE': 'bg-[#e6f3eb] text-[#008d36]', 
       'REJETEE': 'bg-red-50 text-red-500' 
    };
    return map[s] || 'bg-gray-100 text-gray-500';
  }

  action(type: string, id?: string) {
    if (type === 'Nouvelle idée') {
      this.formData = { titre: '', categorie: 'Environnement', description: '' };
      this.showModal = true;
    } else if (id && type === 'Approuver') {
      this.isLoading = true;
      this.adminData.updateEntity('idees', id, { statut: 'VALIDEE' }).subscribe(() => this.refreshData());
    } else if (id && type === 'Rejeter') {
      this.isLoading = true;
      this.adminData.updateEntity('idees', id, { statut: 'REJETEE' }).subscribe(() => this.refreshData());
    } else if (id && type === 'Supprimer') {
      this.openConfirm('Supprimer cette idée ?', 'Voulez-vous vraiment supprimer définitivement cette idée ?', 'delete', id);
    }
  }

  submitForm() {
    if (!this.formData.titre) {
      this.showAlert('Veuillez saisir un titre', 'info');
      return;
    }
      this.isLoading = true;
    this.showModal = false;
    this.adminData.createEntity('idees', {
      titre: this.formData.titre,
      categorie: this.formData.categorie,
      description: this.formData.description,
      statut: 'NOUVELLE',
      votes: 0,
      createdAt: new Date().toISOString()
    }).subscribe(() => this.refreshData());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
