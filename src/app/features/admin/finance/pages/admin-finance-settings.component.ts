import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-finance-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Configuration des Providers</h1>
      <p>Saisie sécurisée des credentials, test de connexion, activation.</p>
    </div>
  `
})
export class AdminFinanceSettingsComponent {}
