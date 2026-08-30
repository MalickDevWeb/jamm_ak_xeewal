import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-commissions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="animate-fade-in-up max-w-[1600px] mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center shrink-0">
          <i class="fa-solid fa-users-gear text-[#008d36] text-2xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Commissions</h2>
          <p class="text-[13px] text-gray-500 font-medium mt-0.5">{{ total }} commissions thématiques actives dans le mouvement.</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button (click)="action('Nouvelle commission')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#008d36] transition-colors flex items-center gap-2">
          <i class="fa-solid fa-plus"></i> Nouvelle commission
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div *ngIf="isLoading" class="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-[#008d36] mb-4"></i>
        <p class="text-gray-500 text-sm font-medium">Chargement des commissions...</p>
      </div>
    </div>

    <div *ngIf="!isLoading && commissions.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-users-gear text-3xl text-gray-300"></i>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">Aucune commission</h3>
      <p class="text-sm text-gray-500">Créez votre première commission.</p>
    </div>

    <!-- Cards Grid -->
    <div *ngIf="!isLoading && commissions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      <div *ngFor="let c of commissions" 
           class="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border-y border-r border-y-gray-100 border-r-gray-100 p-5 group hover:shadow-lg transition-all border-l-[6px]"
           [ngClass]="c.statut === 'ACTIVE' ? 'border-l-[#008d36]' : 'border-l-yellow-400'">
        
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-[#e6f3eb] text-[#008d36] flex items-center justify-center text-xl font-black shrink-0">
            {{ c.nom.charAt(0) }}
          </div>
          <span *ngIf="c.statut === 'ACTIVE'" class="bg-[#e6f3eb] text-[#008d36] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">ACTIVE</span>
          <span *ngIf="c.statut !== 'ACTIVE'" class="bg-yellow-50 text-yellow-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{{ c.statut }}</span>
        </div>

        <h3 class="text-base font-bold text-gray-900 mb-1 leading-snug truncate">{{ c.nom }}</h3>
        <p class="text-xs text-gray-500 mb-4 flex items-center gap-1.5 font-medium">
          <i class="fa-solid fa-user-tie text-gray-400"></i> {{ c.responsable || 'Non assigné' }}
        </p>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p class="text-xl font-black text-[#022c16]">{{ c.membresCount }}</p>
            <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Membres</p>
          </div>
          <div class="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <p class="text-xl font-black text-[#022c16]">{{ c.reunions }}</p>
            <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">Réunions</p>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 mb-5">
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dernier projet</p>
          <p class="text-sm text-gray-700 font-medium truncate">{{ c.dernierProjet || '-' }}</p>
        </div>

        <div class="flex gap-2">
          <button (click)="action('Voir détails', c.id)" class="flex-1 py-2 text-xs font-bold text-[#008d36] bg-[#e6f3eb] hover:bg-[#d1e8d9] rounded-xl transition-colors">Détails</button>
          <button (click)="action('Éditer', c.id)" class="w-10 h-9 flex items-center justify-center text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <i class="fa-solid fa-pen text-xs"></i>
          </button>
          <button (click)="action('Supprimer', c.id)" class="w-10 h-9 flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
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
             Nouvelle Commission
          </h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <div class="p-6">
          <div class="mb-5">
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Nom de la commission <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.nom" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" placeholder="Ex: Commission Santé">
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">Annuler</button>
            <button (click)="submitForm()" class="px-6 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#008d36] rounded-xl transition-colors shadow-sm flex items-center gap-2">
              <i class="fa-solid fa-check"></i> Créer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AdmincommissionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  commissions: any[] = [];
  total = 0;
  isLoading = true;

  showModal = false;
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
      if (confirm('Voulez-vous vraiment supprimer cette commission ?')) {
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
    this.adminData.createEntity('commissions', { nom: this.formData.nom, responsable: 'Non assigné' }).subscribe(() => this.refreshData());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
