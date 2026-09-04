import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { PwaInstallBannerComponent } from '../../../../shared/components/pwa-install-banner/pwa-install-banner.component';
import { validateSenegalPhone, normalizeSenegalPhone, validatePassword } from '../../../../core/utils/validation.utils';

@Component({
  selector: 'app-super-admin-terrain-login',
  standalone: true,
  imports: [CommonModule, FormsModule, PwaInstallBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-[#022c16] to-[#011a0d] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <!-- Background elements -->
      <div class="absolute inset-0 z-0 opacity-10">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-yellow rounded-full blur-[100px]"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green rounded-full blur-[120px]"></div>
      </div>

      <div class="w-full max-w-md relative z-10">
        <!-- Logo -->
        <div class="text-center mb-10">
          <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(255,255,255,0.1)] p-2">
            <img src="assets/icons/icon-192x192.png" alt="Logo" class="w-full h-full object-contain">
          </div>
          <h1 class="text-3xl font-black text-white tracking-tight uppercase">JÀMM AK XÉEWAL</h1>
          <p class="text-brand-yellow font-bold mt-2 tracking-widest text-sm uppercase">Espace Super Admin Terrain</p>
        </div>

        <!-- Login Form -->
        <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-yellow via-yellow-300 to-brand-yellow"></div>
          
          <form (submit)="onLogin($event)" class="space-y-6">
            <div>
              <label class="block text-white/80 font-bold mb-2 text-sm uppercase tracking-wider">N° de Téléphone</label>
              <div class="relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold border-r border-white/20 pr-3">+221</span>
                <input type="tel" [(ngModel)]="telephone" name="telephone" required
                       class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-20 text-white font-bold tracking-wider placeholder-white/30 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
                       placeholder="77 123 45 67">
              </div>
            </div>

            <div>
              <label class="block text-white/80 font-bold mb-2 text-sm uppercase tracking-wider">Mot de passe</label>
              <div class="relative">
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" required
                       class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-white font-bold placeholder-white/30 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow transition-all"
                       placeholder="Votre mot de passe">
                <button type="button" (click)="showPassword = !showPassword"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                  <i [class]="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                </button>
              </div>
            </div>

            <div *ngIf="errorMsg" class="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
              <i class="fa-solid fa-triangle-exclamation"></i>
              {{ errorMsg }}
            </div>

            <button type="submit" [disabled]="isLoading"
                    class="w-full bg-brand-yellow text-brand-dark font-black text-lg uppercase tracking-widest py-4 rounded-2xl shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70">
              <span *ngIf="!isLoading">Connexion <i class="fa-solid fa-arrow-right-to-bracket ml-1"></i></span>
              <span *ngIf="isLoading"><i class="fa-solid fa-circle-notch fa-spin"></i> Authentification...</span>
            </button>
          </form>
        </div>

        <div class="mt-8 text-center">
          <a routerLink="/" class="text-white/40 hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors">
            <i class="fa-solid fa-arrow-left"></i> Retour au site public
          </a>
        </div>
      </div>
      
      <!-- PWA Install Popup (always present logic is handled in the component itself) -->
      <app-pwa-install-banner></app-pwa-install-banner>
    </div>
  `
})
export class SuperAdminTerrainLoginComponent {
  telephone = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMsg = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onLogin(event: Event) {
    event.preventDefault();
    this.errorMsg = '';

    // 1. Validation du téléphone (format sénégalais)
    const phoneCheck = validateSenegalPhone(this.telephone);
    if (!phoneCheck.valid) {
      this.errorMsg = phoneCheck.message || 'Numéro de téléphone invalide.';
      this.cdr.markForCheck();
      return;
    }

    // 2. Validation du mot de passe
    const pwdCheck = validatePassword(this.password);
    if (pwdCheck) {
      this.errorMsg = pwdCheck;
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;

    // Normaliser le numéro au format +221XXXXXXXXX avant envoi
    const phone = normalizeSenegalPhone(this.telephone) || this.telephone;

    this.http.post<any>(`${environment.apiUrl}/super-admin-terrain/login`, {
      telephone: phone,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.token) {
          localStorage.setItem('sat_token', res.token);
          localStorage.setItem('sat_user', JSON.stringify(res.data));
          this.router.navigate(['/super_admin_terrain/adherents']);
        } else {
          this.errorMsg = res.message || 'Erreur de connexion. Vérifiez vos accès.';
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'Erreur de connexion. Vérifiez vos accès.';
        this.cdr.markForCheck();
      }
    });
  }
}
