import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-terrain-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
      <!-- Background elements -->
      <div class="absolute top-0 left-0 w-full h-[40vh] bg-[#022c16] rounded-b-[3rem] shadow-xl"></div>
      <div class="absolute top-10 left-10 w-32 h-32 bg-[#f59e0b]/20 rounded-full blur-2xl"></div>
      <div class="absolute top-20 right-20 w-48 h-48 bg-[#008d36]/20 rounded-full blur-3xl"></div>

      <div class="w-full max-w-md relative z-10">
        <!-- Logo & Title -->
        <div class="text-center mb-8 mt-4">
          <div class="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center mb-5 shadow-lg border border-gray-100 relative overflow-hidden">
            <i class="fa-solid fa-street-view text-4xl text-[#f59e0b]"></i>
          </div>
          <h1 class="text-3xl font-black text-white tracking-tight drop-shadow-md">Agent Terrain</h1>
          <p class="text-white/90 text-sm mt-2 font-medium">JÀMM AK XÉEWAL — Espace de travail</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
          <form (submit)="onSubmit($event)" class="space-y-6">
            <!-- Telephone -->
            <div>
              <label class="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wider">Téléphone</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span class="text-gray-400 font-bold border-r border-gray-200 pr-2">+221</span>
                </div>
                <input
                  type="tel"
                  [(ngModel)]="telephone"
                  name="telephone"
                  required
                  placeholder="77 123 45 67"
                  class="w-full pl-[4.5rem] pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition-all font-bold tracking-widest"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wider">Mot de passe</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i class="fa-solid fa-lock text-gray-400"></i>
                </div>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  class="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-[#f59e0b] transition-all font-medium"
                />
                <button type="button" (click)="showPassword = !showPassword"
                        class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                  <i [class]="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Error -->
            <div *ngIf="errorMessage" class="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl animate-[fadeIn_0.3s_ease]">
              <i class="fa-solid fa-circle-exclamation text-red-500 text-lg"></i>
              <span class="text-sm text-red-700 font-medium">{{ errorMessage }}</span>
            </div>

            <!-- Submit -->
            <button type="submit" [disabled]="isLoading"
                    class="w-full py-4 mt-2 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-[#022c16] font-black rounded-xl hover:from-[#fbbf24] hover:to-[#f59e0b] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-xl shadow-[#f59e0b]/20">
              <i *ngIf="isLoading" class="fa-solid fa-circle-notch fa-spin"></i>
              <span>{{ isLoading ? 'Connexion en cours...' : 'Accéder à l\\'espace' }}</span>
            </button>
          </form>
        </div>

        <!-- Footer -->
        <p class="text-center text-gray-500 text-xs mt-8 font-medium">
          Accès sécurisé et réservé aux agents autorisés.
        </p>
      </div>
    </div>
  `
})
export class TerrainLoginComponent {
  telephone = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  isLoading = false;

  constructor(private router: Router, private http: HttpClient) {}

  onSubmit(event: Event) {
    event.preventDefault();
    this.isLoading = true;
    this.errorMessage = '';

    this.http.post<any>(`${environment.apiUrl}/agents-terrain/login`, {
      telephone: this.telephone,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          localStorage.setItem('terrain_token', res.data.token);
          localStorage.setItem('terrain_user', JSON.stringify(res.data.user));
          this.router.navigate(['/terrain']);
        } else {
          this.errorMessage = res.message || 'Erreur de connexion';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
      }
    });
  }
}
