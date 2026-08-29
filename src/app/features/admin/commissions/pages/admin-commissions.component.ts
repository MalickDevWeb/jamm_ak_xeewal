import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-commissions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
  <div class="animate-fade-in-up">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Commissions</h2>
        <p class="text-sm text-gray-500 mt-1">{{ total }} commissions thématiques actives dans le mouvement.</p>
      </div>
      <button (click)="action('Nouvelle commission')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#022c16]/80 transition-all flex items-center gap-2">
        <i class="fa-solid fa-plus"></i> Nouvelle commission
      </button>
    </div>

    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-500 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div *ngFor="let c of commissions" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group relative overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 bg-[#022c16]/3 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-[#022c16]/10 text-[#022c16] flex items-center justify-center text-xl font-black">
            {{ c.nom.charAt(0) }}
          </div>
          <span [class]="c.statut === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                class="text-[11px] font-bold px-2.5 py-1 rounded-full">{{ c.statut }}</span>
        </div>

        <h3 class="text-base font-bold text-gray-900 mb-1 leading-snug">{{ c.nom }}</h3>
        <p class="text-xs text-gray-500 mb-4 flex items-center gap-1">
          <i class="fa-solid fa-user-tie"></i> {{ c.responsable || 'Non assigné' }}
        </p>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-gray-50 rounded-xl p-3 text-center">
            <p class="text-xl font-black text-[#022c16]">{{ c.membresCount }}</p>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Membres</p>
          </div>
          <div class="bg-gray-50 rounded-xl p-3 text-center">
            <p class="text-xl font-black text-[#022c16]">{{ c.reunions }}</p>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Réunions</p>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-50">
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dernier projet</p>
          <p class="text-sm text-gray-700 font-medium">{{ c.dernierProjet }}</p>
        </div>

        <div class="mt-4 flex gap-2">
          <button (click)="action('Voir détails', c.id)" class="flex-1 py-2 text-xs font-bold text-[#022c16] bg-[#022c16]/10 hover:bg-[#022c16]/20 rounded-xl transition-colors">Voir détails</button>
          <button (click)="action('Éditer', c.id)" class="py-2 px-3 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button (click)="action('Supprimer', c.id)" class="py-2 px-3 text-xs font-bold text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-black text-gray-900 text-lg">Nouvelle Commission</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Nom de la commission</label>
            <input type="text" [(ngModel)]="formData.nom" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Ex: Commission Santé">
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Annuler</button>
            <button (click)="submitForm()" class="px-5 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#022c16]/90 rounded-xl transition-colors shadow-lg shadow-[#022c16]/30">Créer</button>
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
export class AdmincommissionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  commissions: any[] = [];
  total = 0;
  isLoading = true;

  showModal = false;
  showConfirmDialog = false;
  itemToDelete: string | null = null;
  confirmTitle = "Confirmer la suppression";
  formData = {
    nom: ''
  };

  constructor(private adminData: AdminDataService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.refreshData(); }

  refreshData() {
    this.adminData.getCommissions().subscribe({
      next: (res: any) => { this.commissions = res.data; this.total = res.total; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  action(type: string, id?: string) {
    if (type === 'Nouvelle commission') {
      this.formData = { nom: '' };
      this.showModal = true;
    } else if (type === 'Supprimer' && id) {
      this.itemToDelete = id;
      this.confirmTitle = 'Supprimer cette commission ?';
      this.showConfirmDialog = true;
        this.isLoading = true;
        this.adminData.deleteEntity('commissions', id).subscribe(() => this.refreshData());
      }
    } else if (type === 'Éditer' && id) {
      const nouveauNom = prompt('Nouveau nom ?');
      if (nouveauNom) {
        this.isLoading = true;
        this.adminData.updateEntity('commissions', id, { nom: nouveauNom }).subscribe(() => this.refreshData());
      }
    } else {
      alert(type + ' : Formulaire en cours de développement.');
    }
  }

  submitForm() {
    if (!this.formData.nom) {
      alert('Veuillez saisir un nom');
      return;
    }
    this.isLoading = true;
    this.showModal = false;
  showConfirmDialog = false;
  itemToDelete: string | null = null;
  confirmTitle = "Confirmer la suppression";
    this.adminData.createEntity('commissions', { nom: this.formData.nom, responsable: 'Non assigné' }).subscribe(() => this.refreshData());
  }

  
  deleteItem = (id: string) => {
    this.deleteCommission(id);
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
