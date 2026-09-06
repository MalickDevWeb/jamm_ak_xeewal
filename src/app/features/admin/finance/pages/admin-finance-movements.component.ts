import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceMovementsService, FinancialMovement } from '../../../../core/services/finance-movements.service';

@Component({
  selector: 'app-admin-finance-movements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="animate-fade-in-up">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-clock-rotate-left text-indigo-600 text-2xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Journal des mouvements</h2>
            <p class="text-[13px] text-gray-500 font-medium mt-0.5">Historique complet des transactions financières</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <select [(ngModel)]="filters.direction" (change)="loadMovements()" class="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] outline-none">
            <option value="">Tous les flux</option>
            <option value="CREDIT">Crédit (+)</option>
            <option value="DEBIT">Débit (-)</option>
          </select>
          <select [(ngModel)]="filters.sourceType" (change)="loadMovements()" class="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] outline-none">
            <option value="">Toutes les sources</option>
            <option value="PAYMENT">Paiement / Cotisation</option>
            <option value="EXPENSE">Dépense</option>
            <option value="REFUND">Remboursement</option>
          </select>
        </div>
      </div>

      <!-- Résumé de la page (si données dispo) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" *ngIf="meta">
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Crédit de la page</p>
            <h3 class="text-xl font-black text-green-600">+ {{ formatCurrency(meta.pageCredit) }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <i class="fa-solid fa-arrow-down"></i>
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Débit de la page</p>
            <h3 class="text-xl font-black text-red-600">- {{ formatCurrency(meta.pageDebit) }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <i class="fa-solid fa-arrow-up"></i>
          </div>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Net de la page</p>
            <h3 class="text-xl font-black text-gray-900">{{ formatCurrency(meta.pageNet) }}</h3>
          </div>
          <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
            <i class="fa-solid fa-scale-balanced"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div *ngIf="isLoading" class="p-10 flex justify-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#022c16]"></div>
        </div>

        <div *ngIf="!isLoading && movements.length === 0" class="p-10 text-center text-gray-500">
          Aucun mouvement trouvé pour ces filtres.
        </div>

        <div class="overflow-x-auto" *ngIf="!isLoading && movements.length > 0">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-500 border-b border-gray-100 uppercase tracking-wider text-[11px]">
              <tr>
                <th class="px-6 py-4 font-bold">Date & Heure</th>
                <th class="px-6 py-4 font-bold">Type / Direction</th>
                <th class="px-6 py-4 font-bold">Détails Source</th>
                <th class="px-6 py-4 font-bold">Compte Affecté</th>
                <th class="px-6 py-4 font-bold text-right">Montant</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let m of movements" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-gray-500 font-medium">
                  {{ formatDate(m.createdAt) }}
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
                        [ngClass]="m.direction === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                    <i class="fa-solid" [ngClass]="m.direction === 'CREDIT' ? 'fa-arrow-down' : 'fa-arrow-up'"></i>
                    {{ m.type }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="font-bold text-gray-900 text-xs">{{ m.sourceType }}</div>
                  <div class="text-[11px] font-mono text-gray-400 mt-1" *ngIf="m.externalReference">Réf: {{ m.externalReference }}</div>
                </td>
                <td class="px-6 py-4 text-gray-600 text-xs font-medium">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full" [ngClass]="getAccountColor(m.account?.type)"></div>
                    {{ m.account?.name || 'Inconnu' }}
                  </div>
                </td>
                <td class="px-6 py-4 text-right font-black text-sm" [ngClass]="m.direction === 'CREDIT' ? 'text-green-600' : 'text-red-600'">
                  {{ m.direction === 'CREDIT' ? '+' : '-' }} {{ formatCurrency(m.amount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Pagination (simplifiée) -->
      <div class="mt-6 flex justify-between items-center" *ngIf="meta && meta.totalPages > 1">
        <button (click)="changePage(-1)" [disabled]="meta.page === 1" class="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-gray-50">Précédent</button>
        <span class="text-sm text-gray-500 font-medium">Page {{ meta.page }} sur {{ meta.totalPages }}</span>
        <button (click)="changePage(1)" [disabled]="meta.page === meta.totalPages" class="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-gray-50">Suivant</button>
      </div>

    </div>
  `
})
export class AdminFinanceMovementsComponent implements OnInit {
  movements: FinancialMovement[] = [];
  meta: any = null;
  isLoading = true;
  
  filters = {
    page: 1,
    limit: 50,
    direction: '',
    sourceType: ''
  };

  constructor(
    private movementsService: FinanceMovementsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMovements();
  }

  loadMovements() {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.movementsService.getMovements(this.filters).subscribe({
      next: (res) => {
        this.movements = res.data;
        this.meta = res.meta;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  changePage(delta: number) {
    if (!this.meta) return;
    const newPage = this.meta.page + delta;
    if (newPage >= 1 && newPage <= this.meta.totalPages) {
      this.filters.page = newPage;
      this.loadMovements();
    }
  }

  formatCurrency(value: number): string {
    if (value === undefined || value === null) return '0 XOF';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value);
  }

  formatDate(dateString: string): string {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  }

  getAccountColor(type?: string) {
    switch (type) {
      case 'WAVE': return 'bg-blue-500';
      case 'ORANGE_MONEY': return 'bg-orange-500';
      case 'CAISSE': return 'bg-gray-500';
      case 'BANQUE': return 'bg-indigo-500';
      default: return 'bg-gray-300';
    }
  }
}
