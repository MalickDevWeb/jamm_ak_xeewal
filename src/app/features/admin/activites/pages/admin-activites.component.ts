import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Option } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-activites',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="animate-fade-in-up">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Activités</h2>
        <p class="text-sm text-gray-500 mt-1">{{ total }} activités enregistrées.</p>
      </div>
      <button (click)="action('Créer une activité')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#022c16]/80 transition-all flex items-center gap-2">
        <i class="fa-solid fa-plus"></i> Créer une activité
      </button>
    </div>

    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-500 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="space-y-6">
      <div *ngFor="let a of activites; trackBy: trackById" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="bg-blue-100 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{{ a.categorie }}</span>
              <span class="text-xs text-gray-400">{{ a.date | date:'dd/MM/yyyy' }}</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900">{{ a.titre }}</h3>
          </div>
          <div class="flex gap-2">
            <button (click)="action('Supprimer', a.id)" class="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-black text-gray-900 text-lg">Nouvelle activité</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Titre</label>
            <input type="text" [(ngModel)]="formData.titre" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
            <select [(ngModel)]="formData.categorie" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
              <option *ngFor="let c of categories; trackBy: trackByOption" [value]="c.value">{{ c.label }}</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Date</label>
            <input type="date" [(ngModel)]="formData.date" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Annuler</button>
            <button (click)="submitForm()" class="px-5 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#022c16]/90 rounded-xl transition-colors shadow-lg shadow-[#022c16]/30">Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AdminactivitesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  activites: any[] = [];
  total = 0;
  isLoading = true;

  // Options dynamiques depuis la base de données
  categories: Option[] = [];

  showModal = false;
  formData = {
    titre: '',
    categorie: '',
    date: ''
  };

  constructor(
    private adminData: AdminDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOptions();
    this.loadActivites();
  }

  private loadOptions() {
    this.adminData.getOptions('categorie_activite').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.categories = res.data;
          if (this.categories.length > 0 && !this.formData.categorie) {
            this.formData.categorie = this.categories[0].value;
          }
          this.cdr.markForCheck();
        }
      }
    });
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  trackByOption(index: number, item: Option): string {
    return item.id;
  }

  loadActivites() {
    this.isLoading = true;
    this.adminData.getActivites().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        this.activites = res.data;
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

  action(type: string, id?: string) {
    if (type === 'Créer une activité') {
      this.formData = { titre: '', categorie: this.categories[0]?.value || '', date: '' };
      this.showModal = true;
    } else if (type === 'Supprimer' && id) {
      if (confirm('Supprimer cette activité ?')) {
        this.adminData.deleteEntity('activites', id).pipe(
          takeUntil(this.destroy$)
        ).subscribe(() => this.loadActivites());
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
    this.adminData.createEntity('activites', { 
      titre: this.formData.titre, 
      categorie: this.formData.categorie,
      date: this.formData.date ? new Date(this.formData.date).toISOString() : new Date().toISOString()
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadActivites());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
