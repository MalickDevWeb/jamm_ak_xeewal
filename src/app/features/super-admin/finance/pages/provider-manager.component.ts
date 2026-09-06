import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-provider-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Moyens de Paiement</h2>
          <p class="text-gray-500 text-sm mt-1">Configurez les connecteurs de paiement (Wave, Orange Money, Manuel)</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div *ngFor="let provider of providers" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                   [class.bg-[#022c16]]="provider.enabled" [class.text-white]="provider.enabled"
                   [class.bg-gray-100]="!provider.enabled" [class.text-gray-400]="!provider.enabled">
                <i class="fa-solid fa-credit-card"></i>
              </div>
              <div>
                <h3 class="font-bold text-gray-900">{{ provider.name }}</h3>
                <span class="text-xs px-2 py-0.5 rounded-full"
                      [class.bg-green-100]="provider.mode === 'PRODUCTION'" [class.text-green-700]="provider.mode === 'PRODUCTION'"
                      [class.bg-yellow-100]="provider.mode === 'SANDBOX'" [class.text-yellow-700]="provider.mode === 'SANDBOX'">
                  {{ provider.mode }}
                </span>
              </div>
            </div>
            
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" [checked]="provider.enabled" (change)="toggleProvider(provider)">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#022c16]"></div>
            </label>
          </div>
          
          <div class="p-6 space-y-4" *ngIf="provider.id !== 'MANUAL'">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Clé API / Token (Masqué)</label>
              <input type="password" [(ngModel)]="provider.credentials" placeholder="Entrez la nouvelle clé pour modifier..." 
                     class="w-full rounded-lg border-gray-300 focus:border-[#022c16] focus:ring-[#022c16] sm:text-sm">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
              <input type="password" [(ngModel)]="provider.webhookSecret" placeholder="Secret Webhook..." 
                     class="w-full rounded-lg border-gray-300 focus:border-[#022c16] focus:ring-[#022c16] sm:text-sm">
            </div>
            
            <div class="flex justify-end">
              <button (click)="saveConfig(provider)" class="px-4 py-2 bg-[#022c16] text-white rounded-lg text-sm font-medium hover:bg-[#011a0d] transition-colors">
                Enregistrer Config
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProviderManagerComponent implements OnInit {
  providers: any[] = [
    { id: 'MANUAL', name: 'Paiement Manuel', enabled: true, mode: 'PRODUCTION' },
    { id: 'WAVE', name: 'Wave Mobile Money', enabled: false, mode: 'SANDBOX' },
    { id: 'ORANGE_MONEY', name: 'Orange Money', enabled: false, mode: 'SANDBOX' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadConfigs();
  }

  loadConfigs() {
    this.http.get<any>(`${environment.apiUrl}/admin/payment-providers`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          res.data.forEach((config: any) => {
            const p = this.providers.find(x => x.id === config.provider);
            if (p) {
              p.enabled = config.enabled;
              p.mode = config.mode;
            }
          });
        }
      }
    });
  }

  toggleProvider(provider: any) {
    provider.enabled = !provider.enabled;
    this.saveConfig(provider);
  }

  saveConfig(provider: any) {
    this.http.post<any>(`${environment.apiUrl}/admin/payment-providers`, {
      provider: provider.id,
      enabled: provider.enabled,
      mode: provider.mode,
      credentials: provider.credentials ? { token: provider.credentials } : undefined,
      webhookSecret: provider.webhookSecret
    }).subscribe({
      next: (res) => {
        if (res.success) {
          alert('Configuration sauvegardée avec succès');
          provider.credentials = '';
          provider.webhookSecret = '';
        }
      }
    });
  }
}
