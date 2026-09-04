import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-super-admin-terrain-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <!-- Sidebar / Mobile Menu -->
      <nav class="bg-[#022c16] text-white w-full md:w-64 shrink-0 flex flex-col md:min-h-screen z-50">
        <!-- Brand -->
        <div class="p-6 flex items-center justify-between md:justify-center border-b border-white/10 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
              <img src="assets/icons/icon-192x192.png" alt="Logo" class="w-full h-full object-contain">
            </div>
            <div>
              <h2 class="font-black text-sm uppercase tracking-wider leading-none">JÀMM AK</h2>
              <h2 class="font-black text-sm uppercase tracking-wider text-brand-yellow">XÉEWAL</h2>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button (click)="toggleNotifications($event)" class="relative p-2 rounded-lg hover:bg-white/5 transition-colors text-white/70">
              <i class="fa-regular fa-bell text-xl"></i>
              <span *ngIf="newAdherentsCount > 0" class="absolute top-1 right-1 w-4 h-4 text-[9px] font-bold bg-brand-yellow text-brand-dark rounded-full flex items-center justify-center">{{ newAdherentsCount > 9 ? '9+' : newAdherentsCount }}</span>
            </button>
            <button class="md:hidden text-white/70 hover:text-white" (click)="mobileMenuOpen = !mobileMenuOpen">
              <i class="fa-solid fa-bars text-2xl"></i>
            </button>
          </div>
        </div>

        <!-- Links (Desktop Only) -->
        <div class="hidden md:block flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          
          <div class="mb-4">
            <p class="px-3 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Gestion</p>
            <a routerLink="/super_admin_terrain/adherents" routerLinkActive="bg-white/10 text-brand-yellow" 
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium">
              <i class="fa-solid fa-users w-5"></i>
              Adhérents inscrits
            </a>
            <a routerLink="/super_admin_terrain/agents" routerLinkActive="bg-white/10 text-brand-yellow"
               class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-medium mt-1">
              <i class="fa-solid fa-street-view w-5"></i>
              Hommes de Terrain
            </a>
          </div>
        </div>

        <!-- User / Logout (Desktop Only) -->
        <div class="hidden md:block p-4 border-t border-white/10 shrink-0">
          <button (click)="logout()" class="w-full flex items-center justify-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl transition-all font-bold text-sm">
            <i class="fa-solid fa-power-off"></i> Déconnexion
          </button>
        </div>
      </nav>

      <!-- Notifications Dropdown (Absolute) -->
      <div *ngIf="notificationsOpen" (click)="$event.stopPropagation()" class="fixed md:absolute top-20 md:top-4 right-4 md:left-[270px] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]">
        <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <span class="font-bold text-sm text-gray-800">Nouvelles inscriptions</span>
          <button *ngIf="newAdherentsCount > 0" (click)="markAllRead()" class="text-xs text-[#022c16] hover:underline font-semibold">Tout marquer lu</button>
        </div>
        <div class="max-h-80 overflow-y-auto">
          <div *ngIf="newAdherents.length === 0" class="px-4 py-10 text-center">
            <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <i class="fa-regular fa-bell-slash text-xl text-gray-400"></i>
            </div>
            <p class="text-sm font-medium text-gray-500">Aucune nouvelle inscription</p>
          </div>
          <div *ngFor="let ad of newAdherents" class="w-full px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0">
            <div class="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <i class="fa-solid fa-user-plus text-sm"></i>
            </div>
            <div class="flex-1 min-w-0 pt-0.5">
              <p class="text-sm font-semibold text-gray-800 truncate">{{ ad.prenom }} {{ ad.nom }}</p>
              <p class="text-[11px] text-gray-400 mt-1">Inscrit par l'agent terrain</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <div class="flex-1 overflow-auto p-4 md:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>
      
      <!-- ===== MOBILE DRAWER ===== -->
      <!-- Backdrop / Overlay -->
      <div *ngIf="mobileMenuOpen"
           class="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
           (click)="mobileMenuOpen = false">
      </div>

      <!-- Drawer Panel (slide-in from right) -->
      <div class="md:hidden fixed top-0 right-0 h-full w-[85vw] max-w-[340px] bg-white z-[210] shadow-2xl flex flex-col overflow-hidden"
           [style.transform]="mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)'"
           style="transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);">

          <!-- En-tête du drawer -->
          <div class="flex items-center justify-between px-5 py-4 pt-12 border-b border-brand-green/20 bg-gradient-to-r from-[#022c16] to-[#034a28] shrink-0">
              <div class="flex items-center gap-3 min-w-0">
                  <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shrink-0">
                      <img src="assets/icons/icon-192x192.png" alt="Logo" class="w-full h-full object-contain">
                  </div>
                  <div class="min-w-0">
                      <span class="font-black text-white text-sm tracking-tight block truncate">JÀMM AK XÉEWAL</span>
                      <span class="text-brand-yellow text-[10px] font-bold uppercase tracking-widest">Admin Terrain</span>
                  </div>
              </div>
              <button (click)="mobileMenuOpen = false" class="shrink-0 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors ml-2">
                  <i class="fa-solid fa-xmark text-xl"></i>
              </button>
          </div>

          <!-- Liens de navigation -->
          <div class="flex-1 overflow-y-auto px-5 py-6 space-y-2 relative bg-[#f8fafc]">
              <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none mix-blend-multiply"></div>

              <a routerLink="/super_admin_terrain/adherents" routerLinkActive="!bg-[#022c16]/10 !text-[#022c16] !border-[#022c16]/20 !font-black !shadow-sm"
                 (click)="mobileMenuOpen = false"
                 class="flex items-center justify-between px-5 py-4 text-[15px] font-bold text-gray-600 bg-white hover:bg-gray-50 rounded-2xl border border-transparent transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative z-10 group">
                  <div class="flex items-center gap-4">
                      <div class="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#022c16] group-[.font-black]:text-[#022c16] group-[.font-black]:bg-white shadow-inner transition-colors">
                          <i class="fa-solid fa-users text-sm"></i>
                      </div>
                      Adhérents inscrits
                  </div>
                  <i class="fa-solid fa-chevron-right text-[10px] text-gray-300 group-hover:text-[#022c16] transition-colors"></i>
              </a>

              <a routerLink="/super_admin_terrain/agents" routerLinkActive="!bg-[#022c16]/10 !text-[#022c16] !border-[#022c16]/20 !font-black !shadow-sm"
                 (click)="mobileMenuOpen = false"
                 class="flex items-center justify-between px-5 py-4 text-[15px] font-bold text-gray-600 bg-white hover:bg-gray-50 rounded-2xl border border-transparent transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] relative z-10 group">
                  <div class="flex items-center gap-4">
                      <div class="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#022c16] group-[.font-black]:text-[#022c16] group-[.font-black]:bg-white shadow-inner transition-colors">
                          <i class="fa-solid fa-street-view text-sm"></i>
                      </div>
                      Hommes de Terrain
                  </div>
                  <i class="fa-solid fa-chevron-right text-[10px] text-gray-300 group-hover:text-[#022c16] transition-colors"></i>
              </a>
          </div>

          <!-- Footer Mobile Menu -->
          <div class="p-5 border-t border-gray-100 bg-white shrink-0 relative z-10">
              <button (click)="logout()" class="w-full flex items-center justify-center gap-2 bg-red-50 text-red-500 font-bold px-4 py-3.5 rounded-xl hover:bg-red-100 transition-colors">
                  <i class="fa-solid fa-power-off"></i> Déconnexion
              </button>
          </div>
      </div>
    </div>
  `
})
export class SuperAdminTerrainLayoutComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  notificationsOpen = false;
  newAdherents: any[] = [];
  newAdherentsCount = 0;
  
  private lastCheckedTime = new Date().toISOString();
  private pollingInterval: any;

  constructor(private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Poll every 30 seconds
    this.pollingInterval = setInterval(() => {
      this.checkNewAdherents();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.notificationsOpen) {
      this.notificationsOpen = false;
    }
  }

  toggleNotifications(event?: Event) {
    if (event) event.stopPropagation();
    this.notificationsOpen = !this.notificationsOpen;
  }

  markAllRead() {
    this.newAdherentsCount = 0;
    this.newAdherents = [];
    this.lastCheckedTime = new Date().toISOString();
    this.notificationsOpen = false;
    this.cdr.markForCheck();
  }

  checkNewAdherents() {
    const token = localStorage.getItem('sat_token');
    if (!token) return;

    this.http.get<any>(`${environment.apiUrl}/adherents?startDate=${this.lastCheckedTime}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          const newEntries = res.data.filter((ad: any) => !this.newAdherents.find(existing => existing.id === ad.id));
          if (newEntries.length > 0) {
            this.newAdherents = [...newEntries, ...this.newAdherents].slice(0, 50); // Keep max 50
            this.newAdherentsCount += newEntries.length;
            this.lastCheckedTime = new Date().toISOString();
            this.cdr.markForCheck();
          }
        }
      }
    });
  }

  logout() {
    localStorage.removeItem('sat_token');
    localStorage.removeItem('sat_user');
    this.router.navigate(['/super_admin_terrain/login']);
  }
}
