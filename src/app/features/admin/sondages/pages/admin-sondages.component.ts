import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-sondages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="animate-fade-in-up">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Sondages</h2>
        <p class="text-sm text-gray-500 mt-1">{{ total }} sondages créés pour consulter les citoyens.</p>
      </div>
      <button (click)="action('Créer un sondage')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#022c16]/80 transition-all flex items-center gap-2">
        <i class="fa-solid fa-plus"></i> Créer un sondage
      </button>
    </div>

    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-500 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="space-y-6">
      <div *ngFor="let s of sondages; trackBy: trackById" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between gap-4 mb-5">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span [class]="s.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                    class="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                <i [class]="s.statut === 'ACTIF' ? 'fa-solid fa-circle-dot mr-1' : 'fa-solid fa-circle-xmark mr-1'"></i>{{ s.statut }}
              </span>
              <span class="text-xs text-gray-400">{{ s.participants }} participants</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900">{{ s.question }}</h3>
          </div>
        </div>

        <!-- Results bars -->
        <div class="space-y-3">
          <div *ngFor="let option of s.options; trackBy: trackByOptionId" class="group">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-gray-700">{{ option.texte }}</span>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-gray-900">{{ option.votes }}</span>
                <span class="text-xs text-gray-400">({{ getPct(option.votes, s.participants) }}%)</span>
              </div>
            </div>
            <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-[#022c16] rounded-full transition-all duration-700"
                   [style.width]="getPct(option.votes, s.participants) + '%'"></div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
          <div class="flex items-center gap-4 text-xs text-gray-400">
            <span><i class="fa-regular fa-calendar mr-1"></i>Créé le {{ s.createdAt | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="flex gap-2">
            <button (click)="action('Supprimer', s.id)" class="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><i class="fa-solid fa-trash"></i></button>
            <button (click)="action('Clôturer', s.id)" *ngIf="s.statut === 'ACTIF'" class="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Clôturer</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-black text-gray-900 text-lg">Créer un sondage</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Question du sondage</label>
            <input type="text" [(ngModel)]="formData.question" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Ex: Quel est le projet prioritaire ?">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Options (séparées par une virgule)</label>
            <input type="text" [(ngModel)]="formData.optionsStr" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Ex: Hôpital, Ecole, Route">
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Annuler</button>
            <button (click)="submitForm()" class="px-5 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#022c16]/90 rounded-xl transition-colors shadow-lg shadow-[#022c16]/30 flex items-center gap-2">
              <i class="fa-solid fa-check"></i> Publier
            </button>
          </div>
        </div>
      </div>
    </div>
  
  </div>
  `
})
export class AdminsondagesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  sondages: any[] = [];
  total = 0;
  isLoading = true;

  showModal = false;
  formData = {
    question: '',
    optionsStr: ''
  };

  constructor(
    private adminData: AdminDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.refreshData(); }

  refreshData() {
    this.adminData.getSondages().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => { 
        this.sondages = res.data; 
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

  trackByOptionId(index: number, item: any): string {
    return item.id;
  }

  getPct(votes: number, total: number): number {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  }

  action(type: string, id?: string) {
    if (type === 'Créer un sondage') {
      this.formData = { question: '', optionsStr: '' };
      this.showModal = true;
    } else if (type === 'Clôturer' && id) {
      this.isLoading = true;
      this.adminData.updateEntity('sondages', id, { statut: 'CLOTURE' }).pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => this.refreshData());
    } else if (type === 'Supprimer' && id) {
      if (confirm('Supprimer ce sondage ?')) {
        this.isLoading = true;
        this.adminData.deleteEntity('sondages', id).pipe(
          takeUntil(this.destroy$)
        ).subscribe(() => this.refreshData());
      }
    }
  }

  submitForm() {
    if (!this.formData.question || !this.formData.optionsStr) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    const options = this.formData.optionsStr.split(',').map(o => o.trim()).filter(o => o.length > 0);
      this.isLoading = true;
    this.showModal = false;
    this.adminData.createEntity('sondages', { question: this.formData.question, options }).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.refreshData());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
