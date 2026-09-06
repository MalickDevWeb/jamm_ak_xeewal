import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceExpensesService, Expense } from '../../../../core/services/finance-expenses.service';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-admin-finance-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, HasPermissionDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="animate-fade-in-up">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-file-invoice-dollar text-orange-600 text-2xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Dépenses</h2>
            <p class="text-[13px] text-gray-500 font-medium mt-0.5">Suivi et validation des dépenses</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <select [(ngModel)]="statusFilter" (change)="loadExpenses()" class="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] outline-none">
            <option value="">Tous les statuts</option>
            <option value="EN_ATTENTE_DE_VALIDATION">En attente de validation</option>
            <option value="VALIDEE">Validée</option>
            <option value="PAYEE">Payée</option>
            <option value="REJETEE">Rejetée</option>
          </select>
          <button *appHasPermission="'finance.expenses.create'" (click)="openSubmitModal()" class="px-4 py-2 bg-[#022c16] text-white rounded-xl text-sm font-bold hover:bg-[#008d36] transition-colors whitespace-nowrap">
            <i class="fa-solid fa-plus mr-1.5"></i> Nouvelle dépense
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div *ngIf="isLoading" class="p-10 flex justify-center">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#022c16]"></div>
        </div>

        <div *ngIf="!isLoading && expenses.length === 0" class="p-10 text-center text-gray-500">
          Aucune dépense trouvée.
        </div>

        <div class="overflow-x-auto" *ngIf="!isLoading && expenses.length > 0">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-500 border-b border-gray-100">
              <tr>
                <th class="px-6 py-4 font-bold">Date</th>
                <th class="px-6 py-4 font-bold">Bénéficiaire</th>
                <th class="px-6 py-4 font-bold">Catégorie</th>
                <th class="px-6 py-4 font-bold">Montant</th>
                <th class="px-6 py-4 font-bold text-center">Statut</th>
                <th class="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let e of expenses" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-gray-500 text-xs font-medium">{{ formatDate(e.createdAt) }}</td>
                <td class="px-6 py-4 font-bold text-gray-900">
                  {{ e.beneficiary }}
                  <div class="text-xs font-normal text-gray-500 truncate max-w-[200px]">{{ e.description }}</div>
                </td>
                <td class="px-6 py-4 text-gray-600 font-medium">{{ e.category }}</td>
                <td class="px-6 py-4 font-bold text-gray-900">{{ formatCurrency(e.amount) }}</td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider"
                        [ngClass]="getStatusClass(e.status)">
                    {{ formatStatusName(e.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button *appHasPermission="'finance.expenses.validate'" 
                            [disabled]="e.status !== 'EN_ATTENTE_DE_VALIDATION'" 
                            (click)="approve(e)" 
                            class="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 disabled:hidden transition-colors">
                      Valider
                    </button>
                    <button *appHasPermission="'finance.payments.write'" 
                            [disabled]="e.status !== 'VALIDEE'" 
                            (click)="pay(e)" 
                            class="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 disabled:hidden transition-colors">
                      Payer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Submit Modal -->
      <div *ngIf="showSubmitModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 class="text-lg font-bold text-gray-900">Nouvelle dépense</h3>
            <button (click)="closeSubmitModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          <div class="p-6 overflow-y-auto">
            <form (ngSubmit)="submitExpense()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Montant (XOF)</label>
                <input type="number" [(ngModel)]="newExpense.amount" name="amount" required class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Bénéficiaire</label>
                <input type="text" [(ngModel)]="newExpense.beneficiary" name="beneficiary" required class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Catégorie</label>
                <select [(ngModel)]="newExpense.category" name="category" required class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]">
                  <option value="EVENEMENT">Événement</option>
                  <option value="FONCTIONNEMENT">Fonctionnement</option>
                  <option value="AIDE_SOCIALE">Aide Sociale</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description</label>
                <textarea [(ngModel)]="newExpense.description" name="description" rows="3" class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]"></textarea>
              </div>
              <div class="pt-4 flex justify-end gap-3">
                <button type="button" (click)="closeSubmitModal()" class="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold transition-colors">Annuler</button>
                <button type="submit" [disabled]="isSubmitting" class="px-5 py-2 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#008d36] transition-all disabled:opacity-50">
                  <span *ngIf="!isSubmitting">Soumettre</span>
                  <span *ngIf="isSubmitting"><i class="fa-solid fa-spinner fa-spin"></i></span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminFinanceExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  isLoading = true;
  statusFilter = '';
  
  showSubmitModal = false;
  isSubmitting = false;
  newExpense = { amount: 0, category: 'FONCTIONNEMENT', beneficiary: '', description: '' };

  constructor(
    private expensesService: FinanceExpensesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadExpenses();
  }

  loadExpenses() {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.expensesService.getExpenses(1, 50, this.statusFilter).subscribe({
      next: (res) => {
        this.expenses = res.data;
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

  formatDate(dateString: string): string {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'PAYEE': return 'bg-green-100 text-green-700';
      case 'VALIDEE': return 'bg-blue-100 text-blue-700';
      case 'EN_ATTENTE_DE_VALIDATION': return 'bg-yellow-100 text-yellow-700';
      case 'REJETEE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  formatStatusName(status: string): string {
    return status ? status.replace(/_/g, ' ') : '';
  }

  openSubmitModal() {
    this.newExpense = { amount: 0, category: 'FONCTIONNEMENT', beneficiary: '', description: '' };
    this.showSubmitModal = true;
  }

  closeSubmitModal() {
    this.showSubmitModal = false;
  }

  submitExpense() {
    if (!this.newExpense.amount || !this.newExpense.beneficiary) return;
    this.isSubmitting = true;
    this.expensesService.submitExpense(this.newExpense).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeSubmitModal();
        this.loadExpenses();
      },
      error: (err) => {
        alert("Erreur: " + (err.error?.message || err.message));
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  approve(expense: Expense) {
    if (confirm('Valider cette dépense ?')) {
      this.expensesService.approveExpense(expense.id).subscribe({
        next: () => this.loadExpenses(),
        error: (err) => alert("Erreur: " + err.message)
      });
    }
  }

  pay(expense: Expense) {
    // Dans une version plus avancée, on demanderait de choisir le compte (AccountId)
    const accountId = prompt("Entrez l'ID du compte source (Optionnel pour test)");
    if (accountId !== null) {
      this.expensesService.payExpense(expense.id, accountId).subscribe({
        next: () => this.loadExpenses(),
        error: (err) => alert("Erreur: " + (err.error?.message || err.message))
      });
    }
  }
}
