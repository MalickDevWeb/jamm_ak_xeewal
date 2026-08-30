import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-comptes-rendus',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="animate-fade-in-up">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-white">Comptes-Rendus</h2>
        <p class="text-sm text-gray-400 mt-1">{{ total }} rapports et synthèses disponibles.</p>
      </div>
      <button (click)="action('Rédiger')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#022c16]/80 transition-all flex items-center gap-2">
        <i class="fa-solid fa-pen-nib"></i> Rédiger
      </button>
    </div>

    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-400 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="space-y-6">
      <div *ngFor="let cr of comptesRendus; trackBy: trackById" class="bg-white/5 border border-white/10 rounded-2xl shadow-sm border border-white/10 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between gap-4 mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span [class]="getStatutClass(cr.statut)" class="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{{ cr.statut }}</span>
            </div>
            <h3 class="text-lg font-bold text-white">{{ cr.titre }}</h3>
            <p class="text-xs text-gray-400 mt-1"><i class="fa-solid fa-location-dot mr-1"></i>{{ cr.lieu }} | {{ cr.auteur }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
          <span class="text-xs text-gray-400">{{ cr.date | date:'dd/MM/yyyy' }}</span>
          <div class="flex gap-2">
            <button (click)="action('Supprimer', cr.id)" class="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-500/10 rounded-lg transition-colors"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white/5 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h3 class="font-black text-white text-lg">Nouveau compte-rendu</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-200 mb-1">Titre</label>
            <input type="text" [(ngModel)]="formData.titre" class="w-full px-4 py-2.5 rounded-xl border border-white/20 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all outline-none">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-200 mb-1">Lieu</label>
            <input type="text" [(ngModel)]="formData.lieu" class="w-full px-4 py-2.5 rounded-xl border border-white/20 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all outline-none">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-200 mb-1">Auteur</label>
            <input type="text" [(ngModel)]="formData.auteur" class="w-full px-4 py-2.5 rounded-xl border border-white/20 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all outline-none">
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-300 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">Annuler</button>
            <button (click)="submitForm()" class="px-5 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#022c16]/90 rounded-xl transition-colors shadow-lg shadow-[#022c16]/30">Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Confirmation Dialog -->
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
      'PUBLIE': 'bg-brand-green/10 text-brand-green',
      'INTERNE': 'bg-purple-100 text-brand-yellowDark',
      'BROUILLON': 'bg-white/10 text-gray-400'
    };
    return map[statut] || 'bg-white/10 text-gray-400';
  }

  action(type: string, id?: string) {
    if (type === 'Rédiger') {
      this.formData = { titre: '', lieu: '', auteur: 'Admin' };
      this.showModal = true;
    } else if (type === 'Supprimer' && id) {
      if (confirm('Supprimer ce compte-rendu ?')) {
        this.isLoading = true;
        this.adminData.deleteEntity('comptes-rendus', id).pipe(
          takeUntil(this.destroy$)
        ).subscribe(() => this.refreshData());
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
