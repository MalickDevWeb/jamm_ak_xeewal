import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-maintenance-sat',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertPopupComponent],
  template: `
  <ng-container *ngIf="!loggedIn">
    <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden font-sans">
      <!-- Background elements -->
      <div class="absolute top-0 left-0 w-full h-[40vh] bg-[#022c16] rounded-b-[3rem] shadow-xl"></div>
      <div class="absolute top-10 left-10 w-32 h-32 bg-[#f59e0b]/20 rounded-full blur-2xl"></div>
      <div class="absolute top-20 right-20 w-48 h-48 bg-[#008d36]/20 rounded-full blur-3xl"></div>

      <div class="w-full max-w-md relative z-10 animate-fade-in-up">
        <!-- Logo & Title -->
        <div class="text-center mb-8 mt-4">
          <div class="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center mb-5 shadow-lg border border-gray-100 relative overflow-hidden">
            <i class="fa-solid fa-server text-4xl text-[#f59e0b]"></i>
          </div>
          <h2 class="text-3xl font-black text-white tracking-tight drop-shadow-md">Super Admin</h2>
          <p class="text-white/90 text-sm mt-2 font-medium">Accès restreint à la maintenance système</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
          <form (ngSubmit)="onLogin()" class="space-y-6">
            
            <!-- Email -->
            <div>
              <label class="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wider">Email Système</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i class="fa-solid fa-envelope text-gray-400"></i>
                </div>
                <input id="email" [(ngModel)]="email" name="email" type="email" required
                       placeholder="admin@jammakxeewal.com"
                       class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition-all font-medium" />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wider">Clé de sécurité</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i class="fa-solid fa-lock text-gray-400"></i>
                </div>
                <input id="password" [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" required
                       placeholder="••••••••"
                       class="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition-all font-medium" />
                <button type="button" (click)="showPassword = !showPassword"
                        class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                  <i [class]="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Error -->
            <div *ngIf="loginError" class="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl animate-[fadeIn_0.3s_ease]">
              <i class="fa-solid fa-circle-exclamation text-red-500 text-lg"></i>
              <span class="text-sm text-red-700 font-medium">{{ loginError }}</span>
            </div>

            <!-- Submit -->
            <button type="submit" [disabled]="isLoggingIn"
                    class="w-full py-4 mt-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-[#022c16] font-black rounded-xl hover:from-[#fbbf24] hover:to-[#f59e0b] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-xl shadow-[#f59e0b]/20">
              <i [class]="isLoggingIn ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-arrow-right-to-bracket'"></i>
              <span>{{ isLoggingIn ? 'Vérification...' : 'Déverrouiller le système' }}</span>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <p class="text-center text-gray-500 text-xs mt-8 font-medium">
          Zone réservée. Toute tentative non autorisée est enregistrée.
        </p>
      </div>
    </div>
  </ng-container>

  <!-- DASHBOARD VIEW -->
  <ng-container *ngIf="loggedIn">
    <div class="min-h-screen bg-brand-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
            <i class="fa-solid fa-triangle-exclamation text-red-400 text-2xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-black text-white tracking-tight">Zone Critique Système</h2>
            <p class="text-[13px] text-gray-400 font-medium mt-0.5">Configurations globales & Clés d'API en direct.</p>
          </div>
        </div>
        <button (click)="logout()" class="px-5 py-2.5 text-gray-400 hover:bg-white/10 hover:text-white rounded-xl text-sm font-bold transition-colors">
          <i class="fa-solid fa-power-off mr-2"></i> Déconnexion
        </button>
      </div>

      <!-- Loader -->
      <div *ngIf="isLoading" class="flex justify-center py-20">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-brand-green"></i>
      </div>

      <div *ngIf="!isLoading" class="space-y-6">
        
        <!-- Maintenance Mode -->
        <div class="bg-white/5 border border-white/10 border border-white/10 rounded-2xl shadow-sm p-6 relative overflow-hidden border-l-[6px] border-l-red-500">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-white mb-1 flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-xs"><i class="fa-solid fa-ban"></i></div>
                Mode Maintenance
              </h3>
              <p class="text-[11px] font-medium text-gray-400 ml-9">Si activé, l'accès au site public renverra une erreur 503.</p>
            </div>
            
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [checked]="config['MAINTENANCE_MODE'] === 'true'" (change)="toggleMaintenance()" class="sr-only peer">
              <div class="w-14 h-7 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/5 border border-white/10 after:border-transparent after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500/100"></div>
              <span class="ml-3 text-sm font-black" [ngClass]="config['MAINTENANCE_MODE'] === 'true' ? 'text-red-400' : 'text-gray-400'">
                {{ config['MAINTENANCE_MODE'] === 'true' ? 'ACTIVÉ' : 'INACTIF' }}
              </span>
            </label>
          </div>
        </div>

        <!-- Cloudinary Keys -->
        <div class="bg-white/5 border border-white/10 border border-white/10 rounded-2xl shadow-sm p-6 relative overflow-hidden border-l-[6px] border-l-blue-500">
          <h3 class="text-base font-bold text-white mb-1 flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-blue-500/100/10 text-blue-400 flex items-center justify-center text-xs"><i class="fa-solid fa-cloud"></i></div>
            Configuration Cloudinary
          </h3>
          <p class="text-[11px] font-medium text-gray-400 mb-6 ml-9">Clés d'API pour l'hébergement des images et audios (chargées dynamiquement).</p>
          
          <div class="space-y-5">
            <div>
              <label class="block text-[13px] font-bold text-gray-200 mb-1.5 uppercase tracking-wider">Cloud Name</label>
              <input [(ngModel)]="config['SECRET_CLOUDINARY_CLOUD_NAME']" type="text"
                class="w-full px-4 py-3 bg-brand-dark border border-white/20 rounded-xl text-sm font-medium text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none font-mono">
            </div>
            <div>
              <label class="block text-[13px] font-bold text-gray-200 mb-1.5 uppercase tracking-wider">API Key</label>
              <input [(ngModel)]="config['SECRET_CLOUDINARY_API_KEY']" type="text"
                class="w-full px-4 py-3 bg-brand-dark border border-white/20 rounded-xl text-sm font-medium text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none font-mono">
            </div>
            <div>
              <label class="block text-[13px] font-bold text-gray-200 mb-1.5 uppercase tracking-wider">API Secret</label>
              <div class="relative">
                <input [type]="showSecret ? 'text' : 'password'" [(ngModel)]="config['SECRET_CLOUDINARY_API_SECRET']"
                  class="w-full px-4 py-3 bg-brand-dark border border-white/20 rounded-xl text-sm font-medium text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none font-mono pr-12">
                <button type="button" (click)="showSecret = !showSecret" class="absolute inset-y-0 right-0 px-4 text-gray-400 hover:text-gray-600">
                  <i class="fa-solid" [ngClass]="showSecret ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom Variables -->
        <div class="bg-white/5 border border-white/10 rounded-2xl shadow-sm p-6 relative overflow-hidden border-l-[6px] border-l-purple-500">
          <h3 class="text-base font-bold text-white mb-1 flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs"><i class="fa-solid fa-key"></i></div>
            Variables d'Environnement (Secrets)
          </h3>
          <p class="text-[11px] font-medium text-gray-400 mb-6 ml-9">Gérez dynamiquement n'importe quelle autre clé (ex: SMTP_USER, JWT_SECRET...). Les changements s'appliquent immédiatement.</p>
          
          <!-- Liste des variables existantes -->
          <div class="space-y-3 mb-6 ml-9">
            <ng-container *ngFor="let key of getCustomKeys()">
              <div class="flex items-center gap-3">
                <input [value]="key" disabled class="w-1/3 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-xs font-mono text-gray-400 cursor-not-allowed">
                <div class="relative flex-1">
                  <input [type]="visibleSecrets[key] ? 'text' : 'password'" [(ngModel)]="config[key]"
                    class="w-full px-3 py-2 bg-brand-dark border border-white/20 rounded-lg text-xs font-medium text-white focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none font-mono pr-10">
                  <button type="button" (click)="toggleSecret(key)" class="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-gray-200">
                    <i class="fa-solid" [ngClass]="visibleSecrets[key] ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </button>
                </div>
                <button (click)="removeCustomKey(key)" title="Supprimer" class="w-9 h-9 flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </ng-container>
            <div *ngIf="getCustomKeys().length === 0" class="text-xs text-gray-500 font-medium italic">Aucune variable personnalisée définie.</div>
          </div>

          <!-- Ajouter une nouvelle variable -->
          <div class="ml-9 p-4 bg-black/20 rounded-xl border border-white/5">
            <label class="block text-[11px] font-bold text-gray-300 mb-2 uppercase tracking-wider">Ajouter une nouvelle clé</label>
            <div class="flex flex-col sm:flex-row gap-3">
              <input [(ngModel)]="newKeyName" placeholder="NOM_DE_LA_CLE (ex: SMTP_PASSWORD)" type="text"
                class="w-full sm:w-1/3 px-3 py-2 bg-brand-dark border border-white/20 rounded-lg text-xs font-medium text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none font-mono uppercase">
              <input [(ngModel)]="newKeyValue" placeholder="Valeur secrète..." type="text"
                class="flex-1 px-3 py-2 bg-brand-dark border border-white/20 rounded-lg text-xs font-medium text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none font-mono">
              <button (click)="addCustomKey()" [disabled]="!newKeyName || !newKeyValue"
                class="px-4 py-2 bg-purple-500 text-white text-xs font-bold rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50">
                Ajouter
              </button>
            </div>
          </div>
        </div>

        <div class="pt-4 flex items-center justify-between">
          <div *ngIf="saved" class="bg-brand-green/20 border border-brand-green/20 text-brand-green rounded-xl px-4 py-3 text-sm flex items-center gap-2 animate-fade-in-up">
            <i class="fa-solid fa-circle-check"></i>
            <span class="font-black">Configuration appliquée en direct !</span>
          </div>
          <div *ngIf="!saved"></div>

          <button (click)="saveConfig()" [disabled]="isSaving"
            class="px-8 py-3.5 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
            <i [class]="isSaving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-triangle-exclamation'"></i>
            {{ isSaving ? 'Application...' : 'Appliquer les changements' }}
          </button>
        </div>
      </div>
    </div>
  </ng-container>
  `
})
export class MaintenanceSatComponent implements OnInit {
  // Login State
  loggedIn = false;
  email = '';
  password = '';
  isLoggingIn = false;
  loginError = '';
  showPassword = false;
  token = '';

  // Dashboard State
  isLoading = false;
  isSaving = false;
  saved = false;
  showSecret = false;
  visibleSecrets: { [key: string]: boolean } = {};
  
  newKeyName = '';
  newKeyValue = '';

  config: any = {
    'MAINTENANCE_MODE': 'false',
    'SECRET_CLOUDINARY_CLOUD_NAME': '',
    'SECRET_CLOUDINARY_API_KEY': '',
    'SECRET_CLOUDINARY_API_SECRET': ''
  };

  // Les clés de base qu'on affiche séparément
  private baseKeys = ['MAINTENANCE_MODE', 'SECRET_CLOUDINARY_CLOUD_NAME', 'SECRET_CLOUDINARY_API_KEY', 'SECRET_CLOUDINARY_API_SECRET'];

  getCustomKeys(): string[] {
    return Object.keys(this.config).filter(key => !this.baseKeys.includes(key));
  }

  toggleSecret(key: string) {
    this.visibleSecrets[key] = !this.visibleSecrets[key];
  }

  addCustomKey() {
    if (this.newKeyName && this.newKeyValue) {
      const key = this.newKeyName.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
      this.config[key] = this.newKeyValue;
      this.newKeyName = '';
      this.newKeyValue = '';
    }
  }

  removeCustomKey(key: string) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la clé ${key} ?`)) {
      this.adminData.maintenanceDeleteConfigKey(this.token, key).subscribe({
        next: () => {
          delete this.config[key];
          this.cdr.detectChanges();
          this.showAlert(`Clé ${key} supprimée`, 'success');
        },
        error: () => {
          this.showAlert('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  private baseUrl = environment.apiUrl; // e.g. /api/v1

  
  // Alert State
  alertMessage = '';
  alertType: AlertType = 'success';
  showAlertPopup = false;

  showAlert(message: string, type: AlertType = 'success') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertPopup = true;
    setTimeout(() => this.showAlertPopup = false, 3000);
  }

  // Confirm State
  showConfirmDialog = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmActionType = '';
  confirmActionId: any = null;

  openConfirm(title: string, message: string, actionType: string, id: any = null) {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmActionType = actionType;
    this.confirmActionId = id;
    this.showConfirmDialog = true;
  }

  constructor(private adminData: AdminDataService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const storedToken = localStorage.getItem('maintenance_sat_token');
    if (storedToken) {
      this.token = storedToken;
      this.loggedIn = true;
      this.loadConfig();
    }
  }

  onLogin() {
    this.isLoggingIn = true;
    this.loginError = '';
    
    this.adminData.maintenanceLogin({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.isLoggingIn = false;
        if (res.success && res.token) {
          this.token = res.token;
          localStorage.setItem('maintenance_sat_token', this.token);
          this.loggedIn = true;
          this.loadConfig();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoggingIn = false;
        this.loginError = 'Accès refusé. Clé de sécurité invalide.';
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.loggedIn = false;
    this.token = '';
    localStorage.removeItem('maintenance_sat_token');
    this.email = '';
    this.password = '';
  }

  loadConfig() {
    this.isLoading = true;
    this.adminData.maintenanceGetConfig(this.token)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success && res.data) {
            // merge default config with DB config
            this.config = { ...this.config, ...res.data };
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 401 || err.status === 403) {
            this.logout();
          }
          this.cdr.detectChanges();
        }
      });
  }

  toggleMaintenance() {
    this.config['MAINTENANCE_MODE'] = this.config['MAINTENANCE_MODE'] === 'true' ? 'false' : 'true';
  }

  saveConfig() {
    this.isSaving = true;
    this.adminData.maintenanceSetConfig(this.token, this.config)
      .subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.success) {
            this.saved = true;
            setTimeout(() => {
              this.saved = false;
              this.cdr.detectChanges();
            }, 4000);
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSaving = false;
          this.showAlert('Erreur lors de la sauvegarde', 'error');
          if (err.status === 401 || err.status === 403) {
            this.logout();
          }
          this.cdr.detectChanges();
        }
      });
  }
}
