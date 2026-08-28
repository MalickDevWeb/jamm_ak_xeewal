import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-comptes-rendus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="animate-fade-in-up">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Comptes-Rendus</h2>
        <p class="text-sm text-gray-500 mt-1">{{ total }} rapports et synthèses disponibles.</p>
      </div>
      <button (click)="action('Rédiger')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#022c16]/80 transition-all flex items-center gap-2">
        <i class="fa-solid fa-pen-nib"></i> Rédiger
      </button>
    </div>

    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-500 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
      <div *ngFor="let cr of comptesRendus" class="p-5 hover:bg-gray-50/50 transition-colors group flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div class="flex items-start gap-4 flex-1">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-file-lines text-lg"></i>
          </div>
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h3 class="font-bold text-gray-900 text-sm group-hover:text-[#022c16] transition-colors">{{ cr.titre }}</h3>
              <span [class]="getStatutClass(cr.statut)" class="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">{{ cr.statut }}</span>
            </div>
            <p class="text-xs text-gray-500 mb-1"><i class="fa-solid fa-location-dot w-4 text-center text-gray-400"></i> {{ cr.lieu }}</p>
            <div class="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
              <span><i class="fa-regular fa-calendar mr-1"></i> {{ cr.date | date:'dd/MM/yyyy' }}</span>
              <span>•</span>
              <span><i class="fa-solid fa-user-pen mr-1"></i> {{ cr.auteur }}</span>
            </div>
          </div>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button (click)="action('Lire', cr.id)" class="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold text-[#022c16] bg-[#022c16]/10 hover:bg-[#022c16]/20 rounded-lg transition-colors">Lire</button>
          <button (click)="action('Éditer', cr.id)" class="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Éditer</button>
          <button (click)="action('Supprimer', cr.id)" class="flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>

    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-black text-gray-900 text-lg">Rédiger un Compte-Rendu</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Titre</label>
            <input type="text" [(ngModel)]="formData.titre" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Ex: Réunion du comité">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Lieu</label>
            <input type="text" [(ngModel)]="formData.lieu" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Ex: Mairie de Thiès">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Auteur</label>
            <input type="text" [(ngModel)]="formData.auteur" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Annuler</button>
            <button (click)="submitForm()" class="px-5 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#022c16]/90 rounded-xl transition-colors shadow-lg shadow-[#022c16]/30">Publier</button>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
})
export class AdminComptesRendusComponent implements OnInit {
  comptesRendus: any[] = [];
  total = 0;
  isLoading = true;

  showModal = false;
  formData = {
    titre: '',
    lieu: '',
    auteur: 'Admin'
  };

  constructor(private adminData: AdminDataService) {}

  ngOnInit() {
    this.adminData.getComptesRendus().subscribe({
      next: (res: any) => { this.comptesRendus = res.data; this.total = res.total; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  getStatutClass(statut: string): string {
    const map: any = {
      'PUBLIE': 'bg-green-100 text-green-700',
      'INTERNE': 'bg-purple-100 text-purple-700',
      'BROUILLON': 'bg-gray-100 text-gray-500'
    };
    return map[statut] || 'bg-gray-100 text-gray-500';
  }

  action(type: string, id?: string) {
    if (type === 'Rédiger') {
      this.formData = { titre: '', lieu: '', auteur: 'Admin' };
      this.showModal = true;
    } else if (type === 'Supprimer' && id) {
      if (confirm('Supprimer ce compte-rendu ?')) {
        this.isLoading = true;
        this.adminData.deleteEntity('comptes-rendus', id).subscribe(() => this.ngOnInit());
      }
    } else if (type === 'Lire') {
      alert('Lecture non implémentée.');
    } else if (type === 'Éditer' && id) {
      alert('Éditeur WYSIWYG à venir.');
    }
  }

  submitForm() {
    if (!this.formData.titre) {
      alert('Veuillez saisir un titre');
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
    }).subscribe(() => this.ngOnInit());
  }
}
