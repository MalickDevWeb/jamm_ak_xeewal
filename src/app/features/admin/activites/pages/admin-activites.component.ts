import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-activites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="animate-fade-in-up">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Activités & Visites</h2>
        <p class="text-sm text-gray-500 mt-1">{{ total }} événements partagés avec le public.</p>
      </div>
      <button (click)="action('Nouvelle activité')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#022c16]/80 transition-all flex items-center gap-2">
        <i class="fa-solid fa-plus"></i> Nouvelle activité
      </button>
    </div>

    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-500 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div *ngFor="let a of activites" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
        <div class="h-40 relative">
          <img [src]="a.mediaUrl || 'https://picsum.photos/seed/default/600/400'" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div class="absolute top-3 right-3">
            <span [class]="a.statut === 'PUBLIE' ? 'bg-green-500' : 'bg-gray-500'" class="text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {{ a.statut }}
            </span>
          </div>
          <div class="absolute bottom-3 left-3 flex gap-2">
            <span class="bg-[#022c16] text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide">
              {{ a.categorie }}
            </span>
            <span class="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1 border border-white/20">
              <i [class]="a.typeMedia === 'VIDEO' ? 'fa-solid fa-play' : 'fa-regular fa-images'"></i> {{ a.typeMedia }}
            </span>
          </div>
        </div>
        <div class="p-5 flex-1 flex flex-col">
          <p class="text-xs text-gray-400 mb-2 font-semibold"><i class="fa-regular fa-calendar mr-1"></i> {{ a.date | date:'dd/MM/yyyy' }}</p>
          <h3 class="text-base font-bold text-gray-900 leading-snug mb-4 flex-1">{{ a.titre }}</h3>
          <div class="pt-4 border-t border-gray-50 flex gap-2 mt-auto">
            <button (click)="action('Édition', a.id)" class="flex-[2] py-1.5 px-2 text-xs font-bold text-[#022c16] bg-[#022c16]/10 hover:bg-[#022c16]/20 rounded-lg transition-colors flex items-center justify-center gap-1.5"><i class="fa-solid fa-images"></i> Éditer & Médias</button>
            <button (click)="action('Masqué', a.id)" class="flex-1 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" *ngIf="a.statut === 'PUBLIE'">Masquer</button>
            <button (click)="action('Supprimé', a.id)" class="w-8 py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center shrink-0"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-black text-gray-900 text-lg">Nouvelle Activité</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Titre de l'activité</label>
            <input type="text" [(ngModel)]="formData.titre" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Ex: Grand rassemblement...">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
            <select [(ngModel)]="formData.categorie" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
              <option value="PROJET">Projet</option>
              <option value="MEETING">Meeting</option>
              <option value="TERRAIN">Terrain</option>
            </select>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Annuler</button>
            <button (click)="submitForm()" class="px-5 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#022c16]/90 rounded-xl transition-colors shadow-lg shadow-[#022c16]/30">Créer</button>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
})
export class AdminActivitesComponent implements OnInit {
  activites: any[] = [];
  total = 0;
  isLoading = true;

  showModal = false;
  formData = {
    titre: '',
    categorie: 'PROJET'
  };

  constructor(private adminData: AdminDataService) {}

  ngOnInit() {
    this.adminData.getActivites().subscribe({
      next: (res: any) => { this.activites = res.data; this.total = res.total; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  action(type: string, id?: string) {
    if (type === 'Nouvelle activité') {
      this.formData = { titre: '', categorie: 'PROJET' };
      this.showModal = true;
    } else if (type === 'Supprimé' && id) {
      if (confirm('Voulez-vous vraiment supprimer cette activité ?')) {
        this.isLoading = true;
        this.adminData.deleteEntity('activites', id).subscribe(() => this.ngOnInit());
      }
    } else if (type === 'Masqué' && id) {
      this.isLoading = true;
      this.adminData.updateEntity('activites', id, { statut: 'BROUILLON' }).subscribe(() => this.ngOnInit());
    } else {
      alert(type + ' : Formulaire en cours de développement.');
    }
  }

  submitForm() {
    if (!this.formData.titre) {
      alert('Veuillez saisir un titre');
      return;
    }
    this.isLoading = true;
    this.showModal = false;
    this.adminData.createEntity('activites', { titre: this.formData.titre, categorie: this.formData.categorie, date: new Date().toISOString() }).subscribe(() => this.ngOnInit());
  }
}
