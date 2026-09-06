import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';
import { FinanceDashboardService, FinancialDashboardData } from '../../../../core/services/finance-dashboard.service';

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-fade-in-up">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Tableau de bord financier</h2>
          <p class="text-gray-500 text-sm mt-1">Vue d'ensemble des comptes, cotisations et mouvements récents</p>
        </div>
        
        <div class="flex gap-3">
          <button *appHasPermission="'finance.expenses.create'" routerLink="/admin/finance/expenses" class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Saisir une dépense
          </button>
          <button *appHasPermission="'finance.payments.create'" routerLink="/admin/finance/manual-payments" class="px-4 py-2 bg-[#022c16] text-white rounded-lg text-sm font-medium hover:bg-[#011a0d] transition-colors shadow-sm">
            Nouveau Paiement
          </button>
        </div>
      </div>

      <ng-container *ngIf="isLoading">
        <div class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022c16]"></div>
        </div>
      </ng-container>

      <ng-container *ngIf="error">
        <div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <i class="fa-solid fa-circle-exclamation text-xl"></i>
          <p>{{ error }}</p>
        </div>
      </ng-container>

      <ng-container *ngIf="!isLoading && !error && data">
        <!-- Statistiques Principales -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group">
            <div class="absolute right-0 top-0 w-24 h-24 bg-green-100 opacity-20 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
            <p class="text-sm text-gray-500 font-medium mb-1">Total Encaissé (Historique)</p>
            <h3 class="text-2xl font-black text-gray-900">{{ formatCurrency(data.totalCredit) }}</h3>
            <div class="flex items-center gap-1.5 mt-2 text-xs font-medium text-green-600">
              <i class="fa-solid fa-arrow-trend-up"></i>
              <span>Ce mois: +{{ formatCurrency(data.monthly.credit) }}</span>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group">
            <div class="absolute right-0 top-0 w-24 h-24 bg-red-100 opacity-20 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
            <p class="text-sm text-gray-500 font-medium mb-1">Total Dépenses (Historique)</p>
            <h3 class="text-2xl font-black text-gray-900">{{ formatCurrency(data.totalDebit) }}</h3>
            <div class="flex items-center gap-1.5 mt-2 text-xs font-medium text-red-600">
              <i class="fa-solid fa-arrow-trend-down"></i>
              <span>Ce mois: -{{ formatCurrency(data.monthly.debit) }}</span>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group">
            <div class="absolute right-0 top-0 w-32 h-32 bg-[#022c16] opacity-5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
            <p class="text-sm text-gray-500 font-medium mb-1">Solde Global Réel</p>
            <h3 class="text-2xl font-black text-[#022c16]">{{ formatCurrency(data.globalBalance) }}</h3>
            <div class="flex items-center gap-1.5 mt-2 text-xs font-medium text-gray-500">
              <i class="fa-solid fa-wallet"></i>
              <span>Solde cumulé</span>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group border-l-4 border-l-orange-400">
            <div class="absolute right-0 top-0 w-24 h-24 bg-orange-100 opacity-20 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
            <p class="text-sm text-gray-500 font-medium mb-1">Solde Projeté</p>
            <h3 class="text-2xl font-black text-gray-900">{{ formatCurrency(data.projectedBalance) }}</h3>
            <div class="flex items-center gap-1.5 mt-2 text-xs font-medium text-orange-600">
              <i class="fa-solid fa-hourglass-half"></i>
              <span>Après paiement des dépenses validées</span>
            </div>
          </div>

        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Soldes par compte -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-1 flex flex-col">
            <div class="p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 class="text-base font-bold text-gray-900">Soldes par compte</h3>
            </div>
            <div class="p-5 space-y-4 flex-1">
              <div *ngIf="data.accounts.length === 0" class="text-center text-gray-500 text-sm py-4">
                Aucun compte actif
              </div>
              <div *ngFor="let acc of data.accounts" class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" 
                       [ngClass]="{
                         'bg-blue-50 text-blue-600': acc.type === 'WAVE',
                         'bg-orange-50 text-orange-600': acc.type === 'ORANGE_MONEY',
                         'bg-gray-100 text-gray-600': acc.type === 'CAISSE',
                         'bg-indigo-50 text-indigo-600': acc.type === 'BANQUE',
                         'bg-purple-50 text-purple-600': acc.type === 'AUTRE'
                       }">
                    <i class="fa-solid" 
                       [ngClass]="{
                         'fa-w': acc.type === 'WAVE',
                         'fa-money-bill-transfer': acc.type === 'ORANGE_MONEY',
                         'fa-box-archive': acc.type === 'CAISSE',
                         'fa-building-columns': acc.type === 'BANQUE',
                         'fa-wallet': acc.type === 'AUTRE'
                       }"></i>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-900">{{ acc.name }}</p>
                    <p class="text-[11px] text-gray-500 font-medium">{{ acc.type }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-[#022c16]">{{ formatCurrency(acc.balance) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions en attente -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
            <div class="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 class="text-base font-bold text-gray-900">Actions en attente</h3>
              <span class="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                {{ data.pending.manualPayments + data.pending.expenses }} action(s)
              </span>
            </div>
            <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- Paiements Manuels -->
              <div routerLink="/admin/finance/manual-payments" class="p-4 rounded-xl border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer bg-white">
                <div class="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <i class="fa-solid fa-hand-holding-dollar text-xl"></i>
                </div>
                <div>
                  <h4 class="text-gray-900 font-bold mb-1">Paiements Manuels</h4>
                  <p class="text-sm text-gray-500 mb-2">Paiements en attente de confirmation physique par le trésorier.</p>
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-md">
                    {{ data.pending.manualPayments }} à confirmer
                  </span>
                </div>
              </div>

              <!-- Dépenses à valider -->
              <div routerLink="/admin/finance/expenses" class="p-4 rounded-xl border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer bg-white">
                <div class="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                  <i class="fa-solid fa-file-invoice-dollar text-xl"></i>
                </div>
                <div>
                  <h4 class="text-gray-900 font-bold mb-1">Dépenses</h4>
                  <p class="text-sm text-gray-500 mb-2">Dépenses soumises en attente de validation par l'administration.</p>
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-md">
                    {{ data.pending.expenses }} à valider ({{ formatCurrency(data.pending.expensesTotal) }})
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Derniers mouvements (Feed) -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 class="text-base font-bold text-gray-900">Mouvements récents</h3>
            <button routerLink="/admin/finance/movements" class="text-sm text-[#022c16] font-bold hover:underline">Voir tout le journal</button>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-white text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th class="px-6 py-4 font-bold">Date</th>
                  <th class="px-6 py-4 font-bold">Type</th>
                  <th class="px-6 py-4 font-bold">Source</th>
                  <th class="px-6 py-4 font-bold">Compte</th>
                  <th class="px-6 py-4 font-bold text-right">Montant</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr *ngIf="data.recentMovements.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                    Aucun mouvement récent enregistré.
                  </td>
                </tr>
                <tr *ngFor="let m of data.recentMovements" class="hover:bg-gray-50 transition-colors group">
                  <td class="px-6 py-4 text-gray-500 text-xs font-medium">{{ formatDate(m.createdAt) }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
                          [ngClass]="{
                            'bg-green-100 text-green-700': m.direction === 'CREDIT',
                            'bg-red-100 text-red-700': m.direction === 'DEBIT'
                          }">
                      <i class="fa-solid" [ngClass]="m.direction === 'CREDIT' ? 'fa-arrow-down' : 'fa-arrow-up'"></i>
                      {{ m.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-bold text-gray-800 text-xs">{{ m.sourceType }}</td>
                  <td class="px-6 py-4 text-gray-500 text-xs font-medium">{{ m.account?.name || 'N/A' }}</td>
                  <td class="px-6 py-4 text-right font-black text-sm" [ngClass]="m.direction === 'CREDIT' ? 'text-green-600' : 'text-red-600'">
                    {{ m.direction === 'CREDIT' ? '+' : '-' }} {{ formatCurrency(m.amount) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class FinanceDashboardComponent implements OnInit {
  data: FinancialDashboardData | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private dashboardService: FinanceDashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.isLoading = true;
    this.error = null;
    this.dashboardService.getDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.data = res.data;
        } else {
          this.error = "Erreur lors de la récupération des données";
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Dashboard error:', err);
        this.error = "Erreur de connexion au serveur";
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value);
  }

  formatDate(dateString: string): string {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    }).format(d);
  }
}
