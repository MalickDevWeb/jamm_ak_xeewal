import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-maintenance-sat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="min-h-screen bg-brand-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
    
    <!-- LOGIN VIEW -->
    <div *ngIf="!loggedIn" class="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
      <div class="text-center mb-8">
        <div class="mx-auto h-16 w-16 bg-brand-green/20 rounded-2xl flex items-center justify-center mb-4 border border-brand-green/20 shadow-sm">
          <i class="fa-solid fa-server text-brand-green text-2xl"></i>
        </div>
        <h2 class="text-3xl font-black text-white tracking-tight">Super Admin</h2>
        <p class="mt-2 text-sm text-gray-400 font-medium">Accès restreint à la maintenance système</p>
      </div>

      <div class="bg-white/5 py-8 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl border border-white/10 sm:px-10">
        <form (ngSubmit)="onLogin()" class="space-y-6">
          <div *ngIf="loginError" class="bg-red-500/100/10 text-red-400 p-4 rounded-xl text-sm font-bold flex items-center gap-3 border border-red-500/20">
            <i class="fa-solid fa-triangle-exclamation"></i>
            {{ loginError }}
          </div>

          <div>
            <label for="email" class="block text-[13px] font-bold text-gray-200 mb-1.5 uppercase tracking-wider">Email Système</label>
            <div class="mt-1 relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i class="fa-solid fa-envelope text-gray-400"></i>
              </div>
              <input id="email" [(ngModel)]="email" name="email" type="email" required
                class="appearance-none block w-full pl-11 pr-4 py-3 bg-brand-dark border border-white/20 rounded-xl text-sm font-medium text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green transition-all">
            </div>
          </div>

          <div>
            <label for="password" class="block text-[13px] font-bold text-gray-200 mb-1.5 uppercase tracking-wider">Clé de sécurité</label>
            <div class="mt-1 relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i class="fa-solid fa-lock text-gray-400"></i>
              </div>
              <input id="password" [(ngModel)]="password" name="password" type="password" required
                class="appearance-none block w-full pl-11 pr-4 py-3 bg-brand-dark border border-white/20 rounded-xl text-sm font-medium text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green transition-all">
            </div>
          </div>

          <div>
            <button type="submit" [disabled]="isLoggingIn"
              class="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black text-white bg-brand-green hover:bg-brand-greenLight focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-greenLight transition-all disabled:opacity-70">
              <i [class]="isLoggingIn ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-arrow-right-to-bracket'"></i>
              {{ isLoggingIn ? 'Vérification...' : 'Déverrouiller le système' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DASHBOARD VIEW -->
    <div *ngIf="loggedIn" class="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 animate-fade-in-up">
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
              <input type="checkbox" [(ngModel)]="config['MAINTENANCE_MODE']" (change)="toggleMaintenance()" class="sr-only peer">
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
  </div>
  `
})
export class MaintenanceSatComponent implements OnInit {
  // Login State
  loggedIn = false;
  email = '';
  password = '';
  isLoggingIn = false;
  loginError = '';
  token = '';

  // Dashboard State
  isLoading = false;
  isSaving = false;
  saved = false;
  showSecret = false;

  config: any = {
    'MAINTENANCE_MODE': 'false',
    'SECRET_CLOUDINARY_CLOUD_NAME': '',
    'SECRET_CLOUDINARY_API_KEY': '',
    'SECRET_CLOUDINARY_API_SECRET': ''
  };

  private baseUrl = environment.apiUrl; // e.g. /api/v1

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

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
    
    this.http.post<any>(`${this.baseUrl}/maintenance_sat/login`, {
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

  getHeaders() {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  loadConfig() {
    this.isLoading = true;
    this.http.get<any>(`${this.baseUrl}/maintenance_sat/config`, { headers: this.getHeaders() })
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
    this.http.post<any>(`${this.baseUrl}/maintenance_sat/config`, this.config, { headers: this.getHeaders() })
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
          alert('Erreur lors de la sauvegarde');
          if (err.status === 401 || err.status === 403) {
            this.logout();
          }
          this.cdr.detectChanges();
        }
      });
  }
}
