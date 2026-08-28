import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-adherents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="animate-fade-in-up">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Adhérents</h2>
        <p class="text-sm text-gray-500 mt-1">{{ total }} membres inscrits au mouvement.</p>
      </div>
      <button (click)="action('Ajouter un adhérent')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#022c16]/80 transition-all flex items-center gap-2">
        <i class="fa-solid fa-user-plus"></i> Ajouter un adhérent
      </button>
    </div>

    <!-- Loading -->
    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-500 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

    <!-- Table -->
    <div *ngIf="!isLoading" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50/50">
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Adhérent</th>
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Commission</th>
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Date d'adhésion</th>
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr *ngFor="let a of adherents" class="hover:bg-gray-50/50 transition-colors group">
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-[#022c16]/10 text-[#022c16] flex items-center justify-center font-bold text-sm shrink-0">
                    {{ a.prenom.charAt(0) }}
                  </div>
                  <span class="font-semibold text-gray-900 text-sm">{{ a.prenom }} {{ a.nom }}</span>
                </div>
              </td>
              <td class="py-4 px-6">
                <div>
                  <p class="text-sm text-gray-700">{{ a.telephone }}</p>
                </div>
              </td>
              <td class="py-4 px-6">
                <span class="text-sm text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg font-medium">{{ a.quartier }}</span>
              </td>
              <td class="py-4 px-6 text-sm text-gray-500">{{ a.createdAt | date:'dd/MM/yyyy' }}</td>
              <td class="py-4 px-6">
                <span [class]="getStatutClass(a.statut)" class="text-[11px] font-bold px-2.5 py-1 rounded-full">{{ a.statut }}</span>
              </td>
              <td class="py-4 px-6">
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button (click)="action('Valider', a.id)" class="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" *ngIf="a.statut === 'EN_ATTENTE'"><i class="fa-solid fa-check text-xs"></i></button>
                  <button (click)="action('Éditer', a.id)" class="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><i class="fa-solid fa-pen text-xs"></i></button>
                  <button (click)="action('Supprimer', a.id)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-black text-gray-900 text-lg">Nouvel Adhérent</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Prénom</label>
              <input type="text" [(ngModel)]="formData.prenom" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Nom</label>
              <input type="text" [(ngModel)]="formData.nom" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Téléphone</label>
            <input type="text" [(ngModel)]="formData.telephone" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Quartier</label>
            <input type="text" [(ngModel)]="formData.quartier" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Annuler</button>
            <button (click)="submitForm()" class="px-5 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#022c16]/90 rounded-xl transition-colors shadow-lg shadow-[#022c16]/30">Ajouter</button>
          </div>
        </div>
      </div>
    </div>

  </div>
  `
})
export class AdminAdherentsComponent implements OnInit {
  adherents: any[] = [];
  total = 0;
  isLoading = true;

  showModal = false;
  formData = {
    prenom: '',
    nom: '',
    telephone: '',
    quartier: ''
  };

  constructor(private adminData: AdminDataService) {}

  ngOnInit() {
    this.adminData.getAdherents().subscribe({
      next: (res: any) => { this.adherents = res.data; this.total = res.total; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  getStatutClass(statut: string): string {
    const map: any = {
      'ACTIF': 'bg-green-100 text-green-700',
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-700',
      'INACTIF': 'bg-gray-100 text-gray-500'
    };
    return map[statut] || 'bg-gray-100 text-gray-500';
  }

  action(type: string, id?: string) {
    if (type === 'Ajouter un adhérent') {
      this.formData = { prenom: '', nom: '', telephone: '', quartier: '' };
      this.showModal = true;
    } else if (type === 'Supprimer' && id) {
      if (confirm('Voulez-vous vraiment supprimer cet adhérent ?')) {
        this.isLoading = true;
        this.adminData.deleteEntity('adherents', id).subscribe(() => this.ngOnInit());
      }
    } else if (type === 'Valider' && id) {
      this.isLoading = true;
      this.adminData.updateEntity('adherents', id, { statut: 'ACTIF' }).subscribe(() => this.ngOnInit());
    } else {
      alert(type + ' : Formulaire en cours de développement.');
    }
  }

  submitForm() {
    if (!this.formData.nom || !this.formData.prenom || !this.formData.telephone) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }
    this.isLoading = true;
    this.showModal = false;
    this.adminData.createEntity('adherents', this.formData).subscribe(() => this.ngOnInit());
  }
}
