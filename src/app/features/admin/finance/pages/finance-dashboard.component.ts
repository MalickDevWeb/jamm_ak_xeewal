import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HasPermissionDirective } from '../../../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-finance-dashboard',
  standalone: true,
  imports: [CommonModule, HasPermissionDirective],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Tableau de bord financier</h2>
          <p class="text-gray-500 text-sm mt-1">Vue d'ensemble des comptes et des mouvements récents</p>
        </div>
        
        <div class="flex gap-3">
          <button *appHasPermission="'finance.expenses.create'" class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Saisir une dépense
          </button>
          <button *appHasPermission="'finance.payments.create'" class="px-4 py-2 bg-[#022c16] text-white rounded-lg text-sm font-medium hover:bg-[#011a0d] transition-colors">
            Nouveau Paiement
          </button>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center shrink-0">
            <i class="fa-solid fa-arrow-trend-up text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Total Encaissé</p>
            <h3 class="text-2xl font-bold text-gray-900">450 000 XOF</h3>
          </div>
        </div>
        
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div class="w-12 h-12 bg-red-100 text-red-700 rounded-full flex items-center justify-center shrink-0">
            <i class="fa-solid fa-arrow-trend-down text-xl"></i>
          </div>
          <div>
            <p class="text-sm text-gray-500 mb-1">Total Dépenses</p>
            <h3 class="text-2xl font-bold text-gray-900">120 000 XOF</h3>
          </div>
        </div>
        
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
          <div class="absolute right-0 top-0 w-32 h-32 bg-[#022c16] opacity-5 rounded-full -mr-10 -mt-10"></div>
          <div class="w-12 h-12 bg-[#022c16] text-white rounded-full flex items-center justify-center shrink-0 z-10">
            <i class="fa-solid fa-wallet text-xl"></i>
          </div>
          <div class="z-10">
            <p class="text-sm text-gray-500 mb-1">Solde Global</p>
            <h3 class="text-2xl font-bold text-[#022c16]">330 000 XOF</h3>
          </div>
        </div>
      </div>

      <!-- Derniers mouvements -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-900">Derniers mouvements</h3>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-500">
              <tr>
                <th class="px-6 py-4 font-medium">Date</th>
                <th class="px-6 py-4 font-medium">Type</th>
                <th class="px-6 py-4 font-medium">Description</th>
                <th class="px-6 py-4 font-medium">Compte</th>
                <th class="px-6 py-4 font-medium text-right">Montant</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <!-- Mouvement Fictif 1 -->
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-gray-500">Aujourd'hui, 10:30</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <i class="fa-solid fa-arrow-down"></i> Encaissement
                  </span>
                </td>
                <td class="px-6 py-4 font-medium text-gray-900">Cotisation Annuelle - Modou Fall</td>
                <td class="px-6 py-4 text-gray-500">Wave</td>
                <td class="px-6 py-4 text-right font-bold text-green-600">+ 15 000 XOF</td>
              </tr>
              
              <!-- Mouvement Fictif 2 -->
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-gray-500">Hier, 15:45</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <i class="fa-solid fa-arrow-up"></i> Dépense
                  </span>
                </td>
                <td class="px-6 py-4 font-medium text-gray-900">Location salle réunion</td>
                <td class="px-6 py-4 text-gray-500">Caisse</td>
                <td class="px-6 py-4 text-right font-bold text-red-600">- 25 000 XOF</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class FinanceDashboardComponent {
  // Les vraies données viendraient de /api/v1/finance/dashboard
}
