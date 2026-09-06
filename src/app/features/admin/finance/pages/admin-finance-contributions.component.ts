import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceContributionsService, Contribution } from '../../../../core/services/finance-contributions.service';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-admin-finance-contributions',
  standalone: true,
  imports: [CommonModule, FormsModule, HasPermissionDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="animate-fade-in-up">
      <div class="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-hand-holding-dollar text-blue-600 text-2xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Cotisations</h2>
            <p class="text-[13px] text-gray-500 font-medium mt-0.5">Suivi des cotisations des membres</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <select [(ngModel)]="statusFilter" (change)="loadContributions()" class="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] outline-none">
            <option value="">Tous les statuts</option>
            <option value="PAYEE">Payée</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="PARTIELLEMENT_PAYEE">Partielle</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div *ngIf="isLoading" class="p-10 flex justify-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#022c16]"></div>
        </div>

        <div *ngIf="!isLoading && contributions.length === 0" class="p-10 text-center text-gray-500">
          Aucune cotisation trouvée.
        </div>

        <div class="overflow-x-auto" *ngIf="!isLoading && contributions.length > 0">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th class="px-6 py-4 font-bold">Membre</th>
                <th class="px-6 py-4 font-bold">Période</th>
                <th class="px-6 py-4 font-bold">Montant Attendu</th>
                <th class="px-6 py-4 font-bold">Payé</th>
                <th class="px-6 py-4 font-bold text-center">Statut</th>
                <th class="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let c of contributions" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-bold text-gray-900">
                  {{ c.member?.prenom }} {{ c.member?.nom }}
                  <div class="text-xs font-normal text-gray-500">{{ c.member?.telephone }}</div>
                </td>
                <td class="px-6 py-4 text-gray-600 font-medium">Année {{ c.year }}</td>
                <td class="px-6 py-4 font-bold text-gray-900">{{ formatCurrency(c.expectedAmount) }}</td>
                <td class="px-6 py-4 font-bold text-green-600">{{ formatCurrency(c.totalPaid) }}</td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
                        [ngClass]="getStatusClass(c.status)">
                    {{ c.status.replace('_', ' ') }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button *appHasPermission="'finance.contributions.write'" (click)="cancel(c)" [disabled]="c.status === 'PAYEE' || c.status === 'ANNULEE'" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors">
                    Annuler
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminFinanceContributionsComponent implements OnInit {
  contributions: Contribution[] = [];
  isLoading = true;
  statusFilter = '';

  constructor(
    private contributionsService: FinanceContributionsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadContributions();
  }

  loadContributions() {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.contributionsService.getContributions(1, 50, this.statusFilter).subscribe({
      next: (res) => {
        this.contributions = res.data;
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'PAYEE': return 'bg-green-100 text-green-700';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-700';
      case 'PARTIELLEMENT_PAYEE': return 'bg-blue-100 text-blue-700';
      case 'ANNULEE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  cancel(contribution: Contribution) {
    if (confirm('Voulez-vous vraiment annuler cette cotisation ?')) {
      this.contributionsService.cancelContribution(contribution.id, 'Annulation par un administrateur').subscribe({
        next: () => {
          this.loadContributions();
        },
        error: (err) => {
          alert("Erreur lors de l'annulation: " + (err.error?.message || err.message));
        }
      });
    }
  }
}
