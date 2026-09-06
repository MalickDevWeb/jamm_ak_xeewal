import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';

@Component({
  selector: 'app-admin-providers-config',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AlertPopupComponent],
  template: `
<div class="animate-fade-in-up max-w-[1200px] mx-auto pb-12">
  <app-alert-popup [visible]="showAlert" [type]="alertType" [message]="alertMessage" (close)="showAlert = false"></app-alert-popup>

  <div class="flex items-center gap-4 mb-8">
    <div class="w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center shrink-0">
      <i class="fa-solid fa-server text-[#008d36] text-2xl"></i>
    </div>
    <div>
      <h2 class="text-2xl font-black text-gray-900 tracking-tight">Configuration des Fournisseurs (API)</h2>
      <p class="text-[13px] text-gray-500 font-medium mt-0.5">
        Stockez de façon sécurisée (chiffrement AES-256) les identifiants d'envoi Email, SMS et Push.
      </p>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    <!-- SMTP Configuration -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      
      <div class="flex items-center justify-between mb-6 relative z-10">
        <h3 class="text-lg font-black text-gray-800 flex items-center gap-2">
          <i class="fa-solid fa-envelope text-blue-500"></i> Serveur SMTP (Email)
        </h3>
        <span class="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black tracking-wider uppercase rounded-full">
          {{ hasConfig('SMTP') ? 'Configuré' : 'Non configuré' }}
        </span>
      </div>

      <div class="space-y-4 relative z-10">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">Hôte (Host)</label>
            <input type="text" [(ngModel)]="smtpConfig.host" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">Port</label>
            <input type="number" [(ngModel)]="smtpConfig.port" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all">
          </div>
        </div>
        
        <div>
          <label class="block text-xs font-bold text-gray-600 mb-1">Utilisateur (Username)</label>
          <input type="text" [(ngModel)]="smtpConfig.user" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all">
        </div>
        
        <div>
          <label class="block text-xs font-bold text-gray-600 mb-1">Mot de passe (Password)</label>
          <input type="password" [(ngModel)]="smtpConfig.pass" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all">
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-600 mb-1">Email Expéditeur (From)</label>
          <input type="text" [(ngModel)]="smtpConfig.from" placeholder='"Mon App" <noreply@domain.com>' class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-all">
        </div>
        
        <label class="flex items-center gap-2 cursor-pointer pt-2">
          <input type="checkbox" [(ngModel)]="smtpConfig.secure" class="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500" />
          <span class="text-sm font-bold text-gray-800">Connexion sécurisée (SSL/TLS)</span>
        </label>

        <button (click)="saveProvider('SMTP', smtpConfig)" [disabled]="isSaving" class="mt-4 w-full py-3 bg-blue-500 text-white text-sm font-black rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50">
          Sauvegarder SMTP
        </button>
      </div>
    </div>

    <!-- SMS Configuration (Generic) -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      
      <div class="flex items-center justify-between mb-6 relative z-10">
        <h3 class="text-lg font-black text-gray-800 flex items-center gap-2">
          <i class="fa-solid fa-comment-sms text-orange-500"></i> Fournisseur SMS
        </h3>
        <span class="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black tracking-wider uppercase rounded-full">
          {{ hasConfig('MOCK_SMS') ? 'MOCK_SMS Actif' : (hasConfig('ORANGE_SMS') ? 'ORANGE_SMS' : 'Non configuré') }}
        </span>
      </div>

      <div class="space-y-4 relative z-10">
        <div class="mb-4">
          <label class="block text-xs font-bold text-gray-600 mb-2">Choisir le fournisseur</label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="smsProv" value="MOCK_SMS" [(ngModel)]="smsProviderType" class="text-orange-500 focus:ring-orange-500">
              <span class="text-sm font-bold text-gray-800">Mock (Simulation)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="smsProv" value="ORANGE_SMS" [(ngModel)]="smsProviderType" class="text-orange-500 focus:ring-orange-500">
              <span class="text-sm font-bold text-gray-800">Orange SMS</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-600 mb-1">Clé d'API (API Key / Token)</label>
          <input type="password" [(ngModel)]="smsConfig.apiKey" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-all">
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-600 mb-1">Nom de l'Expéditeur (Sender ID)</label>
          <input type="text" [(ngModel)]="smsConfig.senderId" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-all">
        </div>

        <button (click)="saveProvider(smsProviderType, smsConfig)" [disabled]="isSaving" class="mt-4 w-full py-3 bg-orange-500 text-white text-sm font-black rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50">
          Sauvegarder SMS
        </button>
      </div>
    </div>

    <!-- WhatsApp Configuration -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      
      <div class="flex items-center justify-between mb-6 relative z-10">
        <h3 class="text-lg font-black text-gray-800 flex items-center gap-2">
          <i class="fa-brands fa-whatsapp text-green-500"></i> API WhatsApp
        </h3>
        <span class="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black tracking-wider uppercase rounded-full">
          {{ hasConfig('WHATSAPP') ? 'Configuré' : 'Non configuré' }}
        </span>
      </div>

      <div class="space-y-4 relative z-10">
        <div>
          <label class="block text-xs font-bold text-gray-600 mb-1">Token d'accès (Access Token)</label>
          <input type="password" [(ngModel)]="whatsappConfig.accessToken" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-all">
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-600 mb-1">ID du numéro de téléphone (Phone Number ID)</label>
          <input type="text" [(ngModel)]="whatsappConfig.phoneNumberId" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-all">
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-600 mb-1">ID du compte WhatsApp Business</label>
          <input type="text" [(ngModel)]="whatsappConfig.businessAccountId" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition-all">
        </div>

        <button (click)="saveProvider('WHATSAPP', whatsappConfig)" [disabled]="isSaving" class="mt-4 w-full py-3 bg-green-500 text-white text-sm font-black rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50">
          Sauvegarder WhatsApp
        </button>
      </div>
    </div>

  </div>
</div>
  `
})
export class AdminProvidersConfigComponent implements OnInit {
  isSaving = false;
  isLoading = false;
  
  showAlert = false;
  alertType: AlertType = 'success';
  alertMessage = '';

  configuredProviders: any[] = [];

  smtpConfig = { host: '', port: 587, secure: false, user: '', pass: '', from: '' };
  
  smsProviderType = 'MOCK_SMS';
  smsConfig = { apiKey: '', senderId: '' };

  whatsappConfig = { accessToken: '', phoneNumberId: '', businessAccountId: '' };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadProviders();
  }

  loadProviders() {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/settings/providers`).subscribe({
      next: (res) => {
        this.configuredProviders = res.data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  hasConfig(providerName: string): boolean {
    return this.configuredProviders.some(p => p.provider === providerName && p.isActive);
  }

  saveProvider(providerName: string, configData: any) {
    this.isSaving = true;
    this.cdr.markForCheck();

    const payload = {
      provider: providerName,
      isActive: true,
      config: configData
    };

    this.http.post<any>(`${environment.apiUrl}/settings/providers`, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showAlertPopup('success', 'Configuration sauvegardée et chiffrée avec succès.');
        this.loadProviders();
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSaving = false;
        this.showAlertPopup('error', 'Erreur lors de la sauvegarde.');
        this.cdr.markForCheck();
      }
    });
  }

  showAlertPopup(type: AlertType, message: string) {
    this.alertType = type;
    this.alertMessage = message;
    this.showAlert = true;
  }
}
