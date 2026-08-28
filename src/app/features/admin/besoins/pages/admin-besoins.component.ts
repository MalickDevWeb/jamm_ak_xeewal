import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-besoins',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="animate-fade-in-up">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Besoins Déclarés</h2>
        <p class="text-sm text-gray-500 mt-1">{{ total }} besoins soumis par les citoyens.</p>
      </div>
    </div>

    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-500 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="space-y-4">
      <div *ngFor="let b of besoins" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2 flex-wrap">
              <span [class]="getUrgenceClass(b.urgence)" class="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ b.urgence }}
              </span>
              <span class="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{{ b.categorie }}</span>
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-1">Besoin à {{ b.quartier }}</h3>
            <p class="text-sm text-gray-500 mb-3">{{ b.description }}</p>
            <div class="flex items-center gap-4 text-xs text-gray-400">
              <span><i class="fa-solid fa-phone mr-1"></i>{{ b.contact || 'Anonyme' }}</span>
              <span><i class="fa-regular fa-calendar mr-1"></i>{{ b.createdAt | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
          <div class="flex flex-col items-end gap-3 shrink-0">
            <span [class]="getStatutClass(b.statut)" class="text-[11px] font-bold px-3 py-1.5 rounded-full">{{ b.statut.replace('_', ' ') }}</span>
            <div class="flex gap-2">
              <button (click)="action('Traiter', b.id)" class="px-3 py-1.5 text-xs font-bold text-[#022c16] bg-[#022c16]/10 hover:bg-[#022c16]/20 rounded-lg transition-colors">Traiter</button>
              <button (click)="action('Rejeter', b.id)" class="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Rejeter</button>
              <button (click)="action('Supprimer', b.id)" class="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><i class="fa-solid fa-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AdminBesoinsComponent implements OnInit {
  besoins: any[] = [];
  total = 0;
  isLoading = true;

  constructor(private adminData: AdminDataService) {}

  ngOnInit() {
    this.adminData.getBesoins().subscribe({
      next: (res: any) => { this.besoins = res.data; this.total = res.total; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  action(type: string, id?: string) {
    if (!id) return;
    if (type === 'Traiter') {
      this.isLoading = true;
      this.adminData.updateEntity('besoins', id, { statut: 'EN_COURS' }).subscribe(() => this.ngOnInit());
    } else if (type === 'Rejeter') {
      if (confirm('Rejeter ce besoin ?')) {
        this.isLoading = true;
        this.adminData.updateEntity('besoins', id, { statut: 'RESOLU' }).subscribe(() => this.ngOnInit());
      }
    } else if (type === 'Supprimer') {
      if (confirm('Supprimer définitivement ce besoin ?')) {
        this.isLoading = true;
        this.adminData.deleteEntity('besoins', id).subscribe(() => this.ngOnInit());
      }
    }
  }


  getUrgenceClass(u: string): string {
    const map: any = { 'HAUTE': 'bg-red-100 text-red-700', 'MOYENNE': 'bg-yellow-100 text-yellow-700', 'FAIBLE': 'bg-blue-100 text-blue-700' };
    return map[u] || 'bg-gray-100 text-gray-500';
  }
  getStatutClass(s: string): string {
    const map: any = { 'EN_ATTENTE': 'bg-yellow-100 text-yellow-700', 'EN_COURS': 'bg-blue-100 text-blue-700', 'RESOLU': 'bg-green-100 text-green-700' };
    return map[s] || 'bg-gray-100 text-gray-500';
  }
}
