import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceManualPaymentsService, ManualPayment } from '../../../../core/services/finance-manual-payments.service';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-admin-finance-manual-payments',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="animate-fade-in-up">
      <div class="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-hand-holding-dollar text-yellow-600 text-2xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Paiements Manuels en attente</h2>
            <p class="text-[13px] text-gray-500 font-medium mt-0.5">Confirmation de la réception physique des fonds (espèces)</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div *ngIf="isLoading" class="p-10 flex justify-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#022c16]"></div>
        </div>

        <div *ngIf="!isLoading && payments.length === 0" class="p-10 text-center text-gray-500">
          <i class="fa-solid fa-check-circle text-4xl text-green-200 mb-3 block"></i>
          Aucun paiement manuel en attente de confirmation.
        </div>

        <div class="overflow-x-auto" *ngIf="!isLoading && payments.length > 0">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-500 border-b border-gray-100 uppercase tracking-wider text-[11px]">
              <tr>
                <th class="px-6 py-4 font-bold">Date</th>
                <th class="px-6 py-4 font-bold">Membre</th>
                <th class="px-6 py-4 font-bold">Type</th>
                <th class="px-6 py-4 font-bold text-right">Montant</th>
                <th class="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let p of payments" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-gray-500 font-medium">{{ formatDate(p.createdAt) }}</td>
                <td class="px-6 py-4 font-bold text-gray-900">
                  <ng-container *ngIf="p.contributionPayments && p.contributionPayments.length > 0">
                    {{ p.contributionPayments[0].contribution.Adherent?.prenom }} {{ p.contributionPayments[0].contribution.Adherent?.nom }}
                  </ng-container>
                  <ng-container *ngIf="!p.contributionPayments || p.contributionPayments.length === 0">
                    N/A
                  </ng-container>
                </td>
                <td class="px-6 py-4 text-gray-600 font-medium">
                  <ng-container *ngIf="p.contributionPayments && p.contributionPayments.length > 0">
                    Cotisation (Année {{ p.contributionPayments[0].contribution.year }})
                  </ng-container>
                </td>
                <td class="px-6 py-4 text-right font-black text-[#022c16]">{{ formatCurrency(p.amount) }}</td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button *appHasPermission="'finance.payments.write'" (click)="confirm(p)" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                      Confirmer la réception
                    </button>
                    <button *appHasPermission="'finance.payments.write'" (click)="reject(p)" class="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                      Rejeter
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminFinanceManualPaymentsComponent implements OnInit {
  payments: ManualPayment[] = [];
  isLoading = true;

  constructor(
    private manualPaymentsService: FinanceManualPaymentsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.manualPaymentsService.getPendingPayments().subscribe({
      next: (res) => {
        this.payments = res.data || [];
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

  confirm(payment: ManualPayment) {
    if (confirm("Confirmez-vous avoir reçu ce montant physiquement ?")) {
      this.manualPaymentsService.confirmPayment(payment.id).subscribe({
        next: () => this.loadPayments(),
        error: (err) => alert("Erreur: " + err.message)
      });
    }
  }

  reject(payment: ManualPayment) {
    const reason = prompt("Raison du rejet :");
    if (reason !== null) {
      this.manualPaymentsService.rejectPayment(payment.id, reason).subscribe({
        next: () => this.loadPayments(),
        error: (err) => alert("Erreur: " + err.message)
      });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value);
  }

  formatDate(dateString: string): string {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  }
}
