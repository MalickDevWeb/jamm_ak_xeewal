import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-finance-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Dashboard Financier</h1>
      <p>Tableau de bord consolidé, soldes des comptes (Caisse, Wave, etc.)</p>
    </div>
  `
})
export class AdminFinanceDashboardComponent {}
