import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-idees',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="animate-fade-in-up">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-white">Boîte à Idées</h2>
        <p class="text-sm text-gray-400 mt-1">{{ total }} idées proposées par les citoyens.</p>
      </div>
      <button (click)="action('Nouvelle idée')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#022c16]/80 transition-all flex items-center gap-2">
        <i class="fa-solid fa-plus"></i> Nouvelle idée
      </button>
    </div>

    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-400 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div *ngFor="let idee of idees" class="bg-white/5 border border-white/10 rounded-2xl shadow-sm border border-white/10 p-6 hover:shadow-md transition-all group relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 bg-brand-green/5 rounded-bl-full pointer-events-none"></div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs bg-brand-green/20 text-brand-green px-2.5 py-1 rounded-full font-bold">{{ idee.categorie }}</span>
          <span [class]="getStatutClass(idee.statut)" class="text-[11px] font-bold px-2.5 py-1 rounded-full">{{ idee.statut.replace('_', ' ') }}</span>
        </div>
        <h3 class="text-base font-bold text-white mb-2">{{ idee.titre }}</h3>
        <p class="text-sm text-gray-400 mb-4 line-clamp-2">{{ idee.description }}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 text-xs text-gray-400">
            <span><i class="fa-solid fa-user mr-1"></i>Anonyme</span>
            <span><i class="fa-regular fa-calendar mr-1"></i>{{ idee.createdAt | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full font-bold text-sm border border-amber-100">
            <i class="fa-solid fa-thumbs-up text-xs"></i>
            <span>{{ idee.votes }}</span>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-50 flex gap-2">
          <button (click)="action('Approuver', idee.id)" class="flex-1 py-1.5 text-xs font-bold text-white bg-[#022c16] hover:bg-[#022c16]/80 rounded-lg transition-colors">Approuver</button>
          <button (click)="action('Rejeter', idee.id)" class="flex-1 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-500/10 rounded-lg transition-colors border border-red-100">Rejeter</button>
          <button (click)="action('Supprimer', idee.id)" class="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-500/10 rounded-lg transition-colors border border-red-100"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>

    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white/5 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h3 class="font-black text-white text-lg">Nouvelle Idée</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-200 mb-1">Titre de l'idée</label>
            <input type="text" [(ngModel)]="formData.titre" class="w-full px-4 py-2.5 rounded-xl border border-white/20 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all outline-none" placeholder="Ex: Créer un parc...">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-200 mb-1">Catégorie</label>
            <select [(ngModel)]="formData.categorie" class="w-full px-4 py-2.5 rounded-xl border border-white/20 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all outline-none">
              <option value="Environnement">Environnement</option>
              <option value="Santé">Santé</option>
              <option value="Éducation">Éducation</option>
              <option value="Sport">Sport</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-200 mb-1">Description</label>
            <textarea [(ngModel)]="formData.description" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-white/20 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all outline-none" placeholder="Description de l'idée..."></textarea>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-300 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">Annuler</button>
            <button (click)="submitForm()" class="px-5 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#022c16]/90 rounded-xl transition-colors shadow-lg shadow-[#022c16]/30">Créer</button>
          </div>
        </div>
      </div>
    </div>

  
    <!-- Confirmation Dialog -->
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
    const map: any = { 'NOUVELLE': 'bg-brand-yellow/10 text-brand-yellow', 'A_LETUDE': 'bg-brand-green/10 text-brand-green', 'VALIDEE': 'bg-brand-green/10 text-brand-green', 'REJETEE': 'bg-red-500/10 text-red-400' };
    return map[s] || 'bg-white/10 text-gray-400';
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
      if (confirm('Voulez-vous vraiment supprimer cette idée ?')) {
        this.isLoading = true;
        this.adminData.deleteEntity('idees', id).subscribe(() => this.refreshData());
      }
    }
  }

  submitForm() {
    if (!this.formData.titre) {
      alert('Veuillez saisir un titre');
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
