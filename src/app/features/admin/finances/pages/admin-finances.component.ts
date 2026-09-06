import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceConfigService, PaymentProviderConfig } from '../../../../core/services/finance-config.service';
import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';

@Component({
  selector: 'app-admin-finances',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AlertPopupComponent],
  template: `
    <div class="animate-fade-in-up max-w-[1200px] mx-auto pb-12">
      <!-- Alert Popup -->
      <app-alert-popup
        [message]="alertMessage"
        [type]="alertType"
        [visible]="showAlertPopup"
        (close)="showAlertPopup = false">
      </app-alert-popup>

      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center shrink-0">
            <i class="fa-solid fa-money-bill-transfer text-[#008d36] text-2xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Configuration Financière</h2>
            <p class="text-[13px] text-gray-500 font-medium mt-0.5">
              Gérez l'intégration des moyens de paiement (Wave, Orange Money, Manuel).
            </p>
          </div>
        </div>
      </div>

      <!-- Configuration Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- MANUAL PAYMENT CARD -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <i class="fa-solid fa-hand-holding-dollar text-gray-600 text-xl"></i>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg">Paiement Manuel (Espèces)</h3>
                <p class="text-xs text-gray-500">Collecte physique par un trésorier</p>
              </div>
            </div>
            <!-- Toggle Switch -->
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" [(ngModel)]="providers['MANUAL'].enabled" (change)="markAsDirty('MANUAL')">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008d36]"></div>
            </label>
          </div>

          <div *ngIf="providers['MANUAL'].enabled" class="space-y-4 animate-fade-in">
            <div class="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p class="text-xs text-blue-800 flex gap-2">
                <i class="fa-solid fa-circle-info mt-0.5"></i>
                Le paiement manuel nécessite qu'un trésorier valide la réception physique des fonds (statut PENDING_CONFIRMATION -> SUCCESS).
              </p>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              [disabled]="!isDirty('MANUAL') || isSaving"
              (click)="saveConfig('MANUAL')"
              class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#008d36] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Enregistrer
            </button>
          </div>
        </div>

        <!-- WAVE PAYMENT CARD -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <span class="text-blue-500 font-black text-xl">W</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg">Wave Mobile Money</h3>
                <p class="text-xs text-gray-500">Paiement automatisé via API Wave</p>
              </div>
            </div>
            <!-- Toggle Switch -->
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" [(ngModel)]="providers['WAVE'].enabled" (change)="markAsDirty('WAVE')">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008d36]"></div>
            </label>
          </div>

          <div *ngIf="providers['WAVE'].enabled" class="space-y-4 animate-fade-in">
            <!-- Mode Selection -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Environnement</label>
              <select [(ngModel)]="providers['WAVE'].mode" (change)="markAsDirty('WAVE')" class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]">
                <option value="SANDBOX">Sandbox (Test)</option>
                <option value="PRODUCTION">Production (Réel)</option>
              </select>
            </div>

            <!-- API Key -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Clé API (Secrète)</label>
              <input type="password" [(ngModel)]="providers['WAVE'].credentialsEncrypted" (input)="markAsDirty('WAVE')" placeholder="••••••••••••••••" class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]" />
            </div>

            <!-- Webhook Secret -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Secret Webhook</label>
              <input type="password" [(ngModel)]="providers['WAVE'].webhookSecretEncrypted" (input)="markAsDirty('WAVE')" placeholder="••••••••••••••••" class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]" />
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              [disabled]="!isDirty('WAVE') || isSaving"
              (click)="saveConfig('WAVE')"
              class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#008d36] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Enregistrer
            </button>
          </div>
        </div>

        <!-- ORANGE MONEY CARD -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                <span class="text-orange-500 font-black text-xl">OM</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg">Orange Money</h3>
                <p class="text-xs text-gray-500">Paiement automatisé via API Orange</p>
              </div>
            </div>
            <!-- Toggle Switch -->
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" [(ngModel)]="providers['ORANGE_MONEY'].enabled" (change)="markAsDirty('ORANGE_MONEY')">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008d36]"></div>
            </label>
          </div>

          <div *ngIf="providers['ORANGE_MONEY'].enabled" class="space-y-4 animate-fade-in">
            <!-- Mode Selection -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Environnement</label>
              <select [(ngModel)]="providers['ORANGE_MONEY'].mode" (change)="markAsDirty('ORANGE_MONEY')" class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]">
                <option value="SANDBOX">Sandbox (Test)</option>
                <option value="PRODUCTION">Production (Réel)</option>
              </select>
            </div>

            <!-- API Key -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Clé API (Authorization)</label>
              <input type="password" [(ngModel)]="providers['ORANGE_MONEY'].credentialsEncrypted" (input)="markAsDirty('ORANGE_MONEY')" placeholder="••••••••••••••••" class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]" />
            </div>

            <!-- Webhook Secret -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Code Marchand / Webhook Secret</label>
              <input type="password" [(ngModel)]="providers['ORANGE_MONEY'].webhookSecretEncrypted" (input)="markAsDirty('ORANGE_MONEY')" placeholder="••••••••••••••••" class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]" />
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              [disabled]="!isDirty('ORANGE_MONEY') || isSaving"
              (click)="saveConfig('ORANGE_MONEY')"
              class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#008d36] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Enregistrer
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AdminFinancesComponent implements OnInit {
  isSaving = false;
  dirtyState: Record<string, boolean> = {
    'MANUAL': false,
    'WAVE': false,
    'ORANGE_MONEY': false
  };

  providers: Record<string, PaymentProviderConfig> = {
    'MANUAL': { provider: 'MANUAL', enabled: false, mode: 'PRODUCTION' },
    'WAVE': { provider: 'WAVE', enabled: false, mode: 'SANDBOX' },
    'ORANGE_MONEY': { provider: 'ORANGE_MONEY', enabled: false, mode: 'SANDBOX' }
  };

  showAlertPopup = false;
  alertMessage = '';
  alertType: AlertType = 'success';

  constructor(
    private configService: FinanceConfigService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadConfigs();
  }

  loadConfigs() {
    this.configService.getConfigs().subscribe({
      next: (configs) => {
        configs.forEach(c => {
          if (this.providers[c.provider]) {
            this.providers[c.provider] = { ...this.providers[c.provider], ...c };
            // Ne pas ramener le mot de passe s'il n'est pas renvoyé, mais l'état est propre
            this.dirtyState[c.provider] = false;
          }
        });
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.triggerAlert('Erreur lors du chargement des configurations', 'error');
      }
    });
  }

  markAsDirty(providerId: string) {
    this.dirtyState[providerId] = true;
  }

  isDirty(providerId: string): boolean {
    return this.dirtyState[providerId];
  }

  saveConfig(providerId: string) {
    this.isSaving = true;
    const config = this.providers[providerId];
    
    this.configService.saveConfig(config).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.dirtyState[providerId] = false;
        this.triggerAlert(`Configuration ${providerId} enregistrée avec succès.`, 'success');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isSaving = false;
        this.triggerAlert(`Erreur lors de l'enregistrement de ${providerId}.`, 'error');
        this.cdr.markForCheck();
      }
    });
  }

  triggerAlert(message: string, type: AlertType) {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertPopup = true;
  }
}
