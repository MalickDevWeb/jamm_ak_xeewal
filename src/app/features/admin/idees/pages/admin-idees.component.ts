import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-idees',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
  <div class="animate-fade-in-up">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Boîte à Idées</h2>
        <p class="text-sm text-gray-500 mt-1">{{ total }} idées proposées par les citoyens.</p>
      </div>
      <button (click)="action('Nouvelle idée')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#022c16]/80 transition-all flex items-center gap-2">
        <i class="fa-solid fa-plus"></i> Nouvelle idée
      </button>
    </div>

    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-500 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div *ngFor="let idee of idees" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 bg-[#022c16]/3 rounded-bl-full pointer-events-none"></div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs bg-[#022c16]/10 text-[#022c16] px-2.5 py-1 rounded-full font-bold">{{ idee.categorie }}</span>
          <span [class]="getStatutClass(idee.statut)" class="text-[11px] font-bold px-2.5 py-1 rounded-full">{{ idee.statut.replace('_', ' ') }}</span>
        </div>
        <h3 class="text-base font-bold text-gray-900 mb-2">{{ idee.titre }}</h3>
        <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ idee.description }}</p>
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
          <button (click)="action('Rejeter', idee.id)" class="flex-1 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">Rejeter</button>
          <button (click)="action('Supprimer', idee.id)" class="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>

    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-black text-gray-900 text-lg">Nouvelle Idée</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Titre de l'idée</label>
            <input type="text" [(ngModel)]="formData.titre" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Ex: Créer un parc...">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
            <select [(ngModel)]="formData.categorie" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
              <option value="Environnement">Environnement</option>
              <option value="Santé">Santé</option>
              <option value="Éducation">Éducation</option>
              <option value="Sport">Sport</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea [(ngModel)]="formData.description" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Description de l'idée..."></textarea>
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
    const map: any = { 'NOUVELLE': 'bg-yellow-100 text-yellow-700', 'A_LETUDE': 'bg-blue-100 text-blue-700', 'VALIDEE': 'bg-green-100 text-green-700', 'REJETEE': 'bg-red-100 text-red-700' };
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
