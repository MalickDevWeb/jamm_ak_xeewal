import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AdminDataService } from '../../core/services/admin-data.service';
import { Subject, forkJoin, takeUntil, finalize } from 'rxjs';

interface AdminNotification {
  id: string;
  title: string;
  detail: string;
  icon: string;
  color: string;
  route: string;
  createdAt: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#f8fafc] flex font-sans">
      <!-- Sidebar - Desktop -->
      <aside class="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 bg-white border-r border-gray-100 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <!-- Logo Header -->
        <div class="h-20 flex items-center px-6 bg-[#022c16]">
          <div class="flex items-center gap-3">
            <img src="assets/icons/icon-72x72.png" alt="Logo" class="w-10 h-10 object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
            <div class="w-10 h-10 rounded-xl bg-white/20 hidden items-center justify-center shrink-0">
              <i class="fa-solid fa-shield text-white text-lg"></i>
            </div>
            <div>
              <h1 class="font-black text-white text-sm tracking-wide">JÀMM AK XÉEWAL</h1>
              <p class="text-[10px] text-white/60 uppercase tracking-widest font-medium mt-0.5">Administration</p>
            </div>
          </div>
        </div>
        
        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <a *ngFor="let item of navItems; trackBy: trackByPath"
             [routerLink]="item.path"
             routerLinkActive="bg-[#e6f3eb] text-[#022c16] font-bold"
             [routerLinkActiveOptions]="{exact: item.path === '/admin/dashboard'}"
             class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all group">
            <i [class]="item.icon + ' w-5 text-center text-lg'" 
               [routerLinkActive]="'text-[#022c16]'" 
               class="text-gray-400 group-hover:text-gray-600 transition-colors"></i>
            <span class="flex-1">{{ item.label }}</span>
            <span *ngIf="item.badge" class="px-2 py-0.5 text-[11px] font-bold bg-[#e6f3eb] text-[#022c16] rounded-full">{{ item.badge }}</span>
          </a>
        </nav>
        
        <!-- Logout -->
        <div class="p-4 border-t border-gray-100">
          <button (click)="logout()" class="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-[14px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all">
            <i class="fa-solid fa-right-from-bracket w-5 text-center text-lg text-gray-400"></i>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <!-- Mobile Header -->
      <div class="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4 shadow-sm">
        <div class="flex items-center gap-3">
          <button (click)="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
            <i class="fa-solid fa-bars"></i>
          </button>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-[#022c16] flex items-center justify-center">
              <i class="fa-solid fa-shield text-white text-xs"></i>
            </div>
            <span class="font-bold text-gray-800 text-sm">Admin</span>
          </div>
        </div>
        <button (click)="toggleNotifications()" class="relative p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
          <i class="fa-regular fa-bell text-lg"></i>
          <span *ngIf="unreadCount > 0" class="absolute top-1.5 right-1.5 w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
        </button>
      </div>

      <!-- Mobile Menu Overlay -->
      <div *ngIf="mobileMenuOpen" class="lg:hidden fixed inset-0 z-[100]" (click)="mobileMenuOpen = false">
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"></div>
        <aside class="absolute left-0 top-0 bottom-0 w-[260px] bg-white shadow-2xl flex flex-col" (click)="$event.stopPropagation()">
          <div class="h-20 flex items-center px-6 bg-[#022c16]">
            <div class="flex items-center gap-3">
              <img src="assets/icons/icon-72x72.png" alt="Logo" class="w-10 h-10 object-contain" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'" />
              <div class="w-10 h-10 rounded-xl bg-white/20 hidden items-center justify-center shrink-0">
                <i class="fa-solid fa-shield text-white text-lg"></i>
              </div>
              <div>
                <h1 class="font-black text-white text-sm tracking-wide">JÀMM AK XÉEWAL</h1>
                <p class="text-[10px] text-white/60 uppercase tracking-widest font-medium mt-0.5">Administration</p>
              </div>
            </div>
          </div>
          <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <a *ngFor="let item of navItems; trackBy: trackByPath"
               [routerLink]="item.path"
               (click)="mobileMenuOpen = false"
               routerLinkActive="bg-[#e6f3eb] text-[#022c16] font-bold"
               [routerLinkActiveOptions]="{exact: item.path === '/admin/dashboard'}"
               class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium text-gray-500 hover:bg-gray-50 transition-all">
              <i [class]="item.icon + ' w-5 text-center text-lg'" [routerLinkActive]="'text-[#022c16]'"></i>
              <span class="flex-1">{{ item.label }}</span>
              <span *ngIf="item.badge" class="px-2 py-0.5 text-[11px] font-bold bg-[#e6f3eb] text-[#022c16] rounded-full">{{ item.badge }}</span>
            </a>
          </nav>
          <div class="p-4 border-t border-gray-100">
            <button (click)="logout()" class="flex items-center gap-3.5 w-full px-4 py-3 rounded-xl text-[14px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all">
              <i class="fa-solid fa-right-from-bracket w-5 text-center text-lg"></i>
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>
      </div>

      <!-- Main Content -->
      <main class="flex-1 lg:ml-[260px] pt-16 lg:pt-0 min-h-screen flex flex-col relative">
        <!-- Top Header Bar -->
        <header class="hidden lg:flex h-24 items-center justify-between px-8 bg-[#f8fafc] sticky top-0 z-20">
          <div>
            <h2 class="text-[28px] font-bold text-gray-900 flex items-center gap-2">
              Bienvenue, Admin <span class="text-2xl">👋</span>
            </h2>
            <p class="text-sm text-gray-500 mt-1">Voici un aperçu général de la plateforme.</p>
          </div>
          
          <div class="flex items-center gap-6">
            <!-- Search -->
            <div class="relative w-72">
              <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input type="text" placeholder="Rechercher..." class="w-full bg-white border border-gray-200 text-sm rounded-full pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all shadow-sm">
            </div>
            
            <!-- Notifications -->
            <div class="relative">
              <button (click)="toggleNotifications()" class="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm relative text-gray-600">
                <i class="fa-regular fa-bell text-lg"></i>
                <span *ngIf="unreadCount > 0" class="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-[#f8fafc]">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
              </button>
              
              <!-- Notifications Dropdown -->
              <div *ngIf="notificationsOpen" class="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                  <span class="font-bold text-sm text-gray-800">Notifications</span>
                  <button *ngIf="notifications.length > 0" (click)="markAllNotificationsRead()" class="text-xs text-[#022c16] hover:underline font-semibold">Tout marquer lu</button>
                </div>
                <div class="max-h-80 overflow-y-auto">
                  <div *ngIf="notifications.length === 0" class="px-4 py-10 text-center">
                    <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                      <i class="fa-regular fa-bell-slash text-xl text-gray-400"></i>
                    </div>
                    <p class="text-sm font-medium text-gray-500">Aucune notification</p>
                  </div>
                  <button *ngFor="let n of notifications.slice(0, 10); trackBy: trackByNotificationId"
                          (click)="openNotification(n)"
                          class="w-full px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 group">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0" [class]="'bg-' + n.color + '-100 text-' + n.color + '-600'">
                      <i [class]="n.icon + ' text-sm'"></i>
                    </div>
                    <div class="flex-1 min-w-0 pt-0.5">
                      <p class="text-sm font-semibold text-gray-800 truncate group-hover:text-[#022c16] transition-colors">{{ n.title }}</p>
                      <p class="text-[13px] text-gray-500 truncate mt-0.5">{{ n.detail }}</p>
                      <p class="text-[11px] text-gray-400 mt-1">{{ notificationTime(n.createdAt) }}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- User Profile -->
            <div class="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div class="w-10 h-10 rounded-full bg-[#022c16] text-white flex items-center justify-center font-bold shadow-sm">
                A
              </div>
              <div class="hidden sm:block text-left">
                <p class="text-sm font-bold text-gray-900 leading-tight">Admin</p>
                <p class="text-[11px] text-gray-500 font-medium">Super Admin</p>
              </div>
              <i class="fa-solid fa-chevron-down text-gray-400 text-xs ml-1"></i>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="flex-1 p-4 lg:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class AdminDashboardLayoutComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  notifications: AdminNotification[] = [];
  notificationsOpen = false;
  isLoading = false;
  private destroy$ = new Subject<void>();
  private readonly readStorageKey = 'jamm-admin-read-notifications';

  navItems: NavItem[] = [
    { path: '/admin/dashboard', label: 'Tableau de bord', icon: 'fa-solid fa-chart-pie' },
    { path: '/admin/adherents', label: 'Adhérents', icon: 'fa-solid fa-users' },
    { path: '/admin/besoins', label: 'Besoins', icon: 'fa-solid fa-hand-holding-heart' },
    { path: '/admin/idees', label: 'Idées', icon: 'fa-solid fa-lightbulb' },
    { path: '/admin/messages', label: 'Messages', icon: 'fa-solid fa-envelope', badge: 8 },
    { path: '/admin/activites', label: 'Activités', icon: 'fa-solid fa-calendar-days' },
    { path: '/admin/sondages', label: 'Sondages', icon: 'fa-solid fa-square-poll-vertical' },
    { path: '/admin/commissions', label: 'Commissions', icon: 'fa-solid fa-sitemap' },
    { path: '/admin/comptes-rendus', label: 'Comptes-rendus', icon: 'fa-solid fa-file-lines' },
    { path: '/admin/editorial', label: 'Contenu', icon: 'fa-solid fa-pen-nib' },
    { path: '/admin/settings', label: 'Paramètres', icon: 'fa-solid fa-gear' },
    { path: '/admin/options', label: 'Quartiers & Catégories', icon: 'fa-solid fa-list-ul' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private adminData: AdminDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.refreshNotifications();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByPath(index: number, item: NavItem): string {
    return item.path;
  }

  trackByNotificationId(index: number, item: AdminNotification): string {
    return item.id;
  }

  getPageTitle(): string {
    const currentPath = this.router.url;
    const item = this.navItems.find(nav => nav.path === currentPath);
    return item?.label || 'Dashboard';
  }

  async refreshNotifications() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      const { firstValueFrom } = await import('rxjs');
      
      // Fetch sequentially to prevent backend connection pool exhaustion (ECONNRESET)
      const adherents = await firstValueFrom(this.adminData.getAdherents().pipe(takeUntil(this.destroy$)));
      const besoins = await firstValueFrom(this.adminData.getBesoins().pipe(takeUntil(this.destroy$)));
      const idees = await firstValueFrom(this.adminData.getIdees().pipe(takeUntil(this.destroy$)));
      const messages = await firstValueFrom(this.adminData.getMessages().pipe(takeUntil(this.destroy$)));
      const commissions = await firstValueFrom(this.adminData.getCommissions().pipe(takeUntil(this.destroy$)));
      const sondages = await firstValueFrom(this.adminData.getSondages().pipe(takeUntil(this.destroy$)));
      const activites = await firstValueFrom(this.adminData.getActivites().pipe(takeUntil(this.destroy$)));
      const evenements = await firstValueFrom(this.adminData.getEvenements().pipe(takeUntil(this.destroy$)));
      const comptesRendus = await firstValueFrom(this.adminData.getComptesRendus().pipe(takeUntil(this.destroy$)));

      const items: AdminNotification[] = [];
      this.addNotifications(items, adherents?.data, 'Nouvel adhérent', (item: any) => `${item.prenom} ${item.nom}`, 'fa-solid fa-user-plus', 'green', '/admin/adherents');
      this.addNotifications(items, besoins?.data, 'Nouveau besoin', (item: any) => item.description || `Quartier ${item.quartier}`, 'fa-solid fa-hand-holding-heart', 'red', '/admin/besoins');
      this.addNotifications(items, idees?.data, 'Nouvelle idée', (item: any) => item.titre, 'fa-solid fa-lightbulb', 'yellow', '/admin/idees');
      this.addNotifications(items, messages?.data, 'Nouveau message', (item: any) => item.sujet || item.nom, 'fa-solid fa-envelope', 'blue', '/admin/messages');
      this.addNotifications(items, commissions?.data, 'Nouvelle commission', (item: any) => item.nom, 'fa-solid fa-sitemap', 'purple', '/admin/commissions');
      this.addNotifications(items, sondages?.data, 'Nouveau sondage', (item: any) => item.question, 'fa-solid fa-square-poll-vertical', 'teal', '/admin/sondages');
      this.addNotifications(items, activites?.data, 'Nouvelle activité', (item: any) => item.titre, 'fa-solid fa-calendar-days', 'purple', '/admin/activites');
      this.addNotifications(items, evenements?.data, 'Nouvel événement', (item: any) => item.titre, 'fa-solid fa-calendar-days', 'indigo', '/admin/evenements');
      this.addNotifications(items, comptesRendus?.data, 'Nouveau compte-rendu', (item: any) => item.titre, 'fa-solid fa-file-lines', 'teal', '/admin/comptes-rendus');
      
      this.notifications = items.sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()).slice(0, 40);
    } catch (err) {
      console.error('Erreur lors de la récupération des notifications', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private addNotifications(target: AdminNotification[], records: any[], title: string, detail: (item: any) => string, icon: string, color: string, route: string) {
    (records || []).forEach(item => {
      if (item.id && (item.createdAt || item.date)) target.push({ id: `${title}-${item.id}`, title, detail: detail(item), icon, color, route, createdAt: item.createdAt || item.date });
    });
  }

  get unreadCount(): number {
    const read = this.readNotificationIds;
    return this.notifications.filter(notification => !read.has(notification.id)).length;
  }

  get readNotificationIds(): Set<string> {
    try { return new Set(JSON.parse(localStorage.getItem(this.readStorageKey) || '[]')); } catch { return new Set(); }
  }

  toggleNotifications() { this.notificationsOpen = !this.notificationsOpen; }

  openNotification(notification: AdminNotification) {
    const read = this.readNotificationIds;
    read.add(notification.id);
    localStorage.setItem(this.readStorageKey, JSON.stringify(Array.from(read).slice(-200)));
    this.notificationsOpen = false;
    this.router.navigate([notification.route]);
  }

  markAllNotificationsRead() {
    localStorage.setItem(this.readStorageKey, JSON.stringify(this.notifications.map(notification => notification.id)));
  }

  notificationTime(value: string): string {
    const date = new Date(value);
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (minutes < 1440) return `Il y a ${Math.floor(minutes / 60)} h`;
    return date.toLocaleDateString('fr-FR');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
