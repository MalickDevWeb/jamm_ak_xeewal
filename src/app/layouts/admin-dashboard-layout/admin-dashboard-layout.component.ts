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
    <div class="min-h-screen bg-slate-50 flex">
      <!-- Sidebar - Desktop -->
      <aside class="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 z-30">
        <div class="h-16 flex items-center px-6 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <i class="fa-solid fa-shield-halved text-white text-sm"></i>
            </div>
            <div>
              <h1 class="font-bold text-slate-800 text-sm">JÀMM AK XÉEWAL</h1>
              <p class="text-[10px] text-slate-400 uppercase tracking-wider">Administration</p>
            </div>
          </div>
        </div>
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <a *ngFor="let item of navItems; trackBy: trackByPath"
             [routerLink]="item.path"
             routerLinkActive="bg-emerald-50 text-emerald-700"
             class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group">
            <i [class]="item.icon + ' w-5 text-center text-slate-400 group-hover:text-slate-600 transition-colors'"></i>
            <span class="flex-1">{{ item.label }}</span>
            <span *ngIf="item.badge" class="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">{{ item.badge }}</span>
          </a>
        </nav>
        <div class="p-3 border-t border-slate-100">
          <button (click)="logout()" class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all">
            <i class="fa-solid fa-right-from-bracket w-5 text-center text-slate-400"></i>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <!-- Mobile Header -->
      <div class="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
        <div class="flex items-center gap-3">
          <button (click)="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <i class="fa-solid fa-bars text-slate-600"></i>
          </button>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <i class="fa-solid fa-shield-halved text-white text-xs"></i>
            </div>
            <span class="font-bold text-slate-800 text-sm">Admin</span>
          </div>
        </div>
        <button (click)="toggleNotifications()" class="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <i class="fa-regular fa-bell text-slate-600"></i>
          <span *ngIf="unreadCount > 0" class="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
        </button>
      </div>

      <!-- Mobile Menu Overlay -->
      <div *ngIf="mobileMenuOpen" class="lg:hidden fixed inset-0 z-50" (click)="mobileMenuOpen = false">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <aside class="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl" (click)="$event.stopPropagation()">
          <div class="h-16 flex items-center px-4 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <i class="fa-solid fa-shield-halved text-white text-sm"></i>
              </div>
              <span class="font-bold text-slate-800 text-sm">Admin</span>
            </div>
          </div>
          <nav class="px-3 py-4 space-y-1">
            <a *ngFor="let item of navItems; trackBy: trackByPath"
               [routerLink]="item.path"
               (click)="mobileMenuOpen = false"
               routerLinkActive="bg-emerald-50 text-emerald-700"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
              <i [class]="item.icon + ' w-5 text-center text-slate-400'"></i>
              <span class="flex-1">{{ item.label }}</span>
            </a>
          </nav>
          <div class="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-100">
            <button (click)="logout()" class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
              <i class="fa-solid fa-right-from-bracket w-5 text-center"></i>
              <span>Déconnexion</span>
            </button>
          </div>
        </aside>
      </div>

      <!-- Main Content -->
      <main class="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <header class="hidden lg:flex h-16 items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-20">
          <h2 class="text-lg font-semibold text-slate-800">{{ getPageTitle() }}</h2>
          <div class="flex items-center gap-3">
            <button (click)="refreshNotifications()" [disabled]="isLoading" class="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <i class="fa-solid fa-rotate text-slate-500" [class.fa-spin]="isLoading"></i>
            </button>
            <div class="relative">
              <button (click)="toggleNotifications()" class="p-2 rounded-lg hover:bg-slate-100 transition-colors relative">
                <i class="fa-regular fa-bell text-slate-600"></i>
                <span *ngIf="unreadCount > 0" class="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
              </button>
              <div *ngIf="notificationsOpen" class="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span class="font-semibold text-sm text-slate-800">Notifications</span>
                  <button *ngIf="notifications.length > 0" (click)="markAllNotificationsRead()" class="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Tout marquer lu</button>
                </div>
                <div class="max-h-80 overflow-y-auto">
                  <div *ngIf="notifications.length === 0" class="px-4 py-8 text-center">
                    <i class="fa-regular fa-bell-slash text-2xl text-slate-300 mb-2"></i>
                    <p class="text-sm text-slate-400">Aucune notification</p>
                  </div>
                  <button *ngFor="let n of notifications.slice(0, 10); trackBy: trackByNotificationId"
                          (click)="openNotification(n)"
                          class="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0" [class]="'bg-' + n.color + '-100 text-' + n.color + '-600'">
                      <i [class]="n.icon + ' text-xs'"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-slate-700 truncate">{{ n.title }}</p>
                      <p class="text-xs text-slate-400 truncate">{{ n.detail }}</p>
                      <p class="text-[10px] text-slate-300 mt-0.5">{{ notificationTime(n.createdAt) }}</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div class="p-4 lg:p-6">
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
    { path: '/admin/messages', label: 'Messages', icon: 'fa-solid fa-envelope' },
    { path: '/admin/activites', label: 'Activités', icon: 'fa-solid fa-calendar-days' },
    { path: '/admin/sondages', label: 'Sondages', icon: 'fa-solid fa-square-poll-vertical' },
    { path: '/admin/commissions', label: 'Commissions', icon: 'fa-solid fa-sitemap' },
    { path: '/admin/comptes-rendus', label: 'Comptes-rendus', icon: 'fa-solid fa-file-lines' },
    { path: '/admin/editorial', label: 'Contenu', icon: 'fa-solid fa-pen-nib' },
    { path: '/admin/settings', label: 'Paramètres', icon: 'fa-solid fa-gear' },
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

  refreshNotifications() {
    if (this.isLoading) return;
    this.isLoading = true;

    forkJoin({
      adherents: this.adminData.getAdherents(),
      besoins: this.adminData.getBesoins(),
      idees: this.adminData.getIdees(),
      messages: this.adminData.getMessages(),
      commissions: this.adminData.getCommissions(),
      sondages: this.adminData.getSondages(),
      activites: this.adminData.getActivites(),
      comptesRendus: this.adminData.getComptesRendus()
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: response => {
        const items: AdminNotification[] = [];
        this.addNotifications(items, response.adherents?.data, 'Nouvel adhérent', item => `${item.prenom} ${item.nom}`, 'fa-solid fa-user-plus', 'green', '/admin/adherents');
        this.addNotifications(items, response.besoins?.data, 'Nouveau besoin', item => item.description || `Quartier ${item.quartier}`, 'fa-solid fa-hand-holding-heart', 'red', '/admin/besoins');
        this.addNotifications(items, response.idees?.data, 'Nouvelle idée', item => item.titre, 'fa-solid fa-lightbulb', 'yellow', '/admin/idees');
        this.addNotifications(items, response.messages?.data, 'Nouveau message', item => item.sujet || item.nom, 'fa-solid fa-envelope', 'blue', '/admin/messages');
        this.addNotifications(items, response.commissions?.data, 'Nouvelle commission', item => item.nom, 'fa-solid fa-sitemap', 'purple', '/admin/commissions');
        this.addNotifications(items, response.sondages?.data, 'Nouveau sondage', item => item.question, 'fa-solid fa-square-poll-vertical', 'teal', '/admin/sondages');
        this.addNotifications(items, response.activites?.data, 'Nouvelle activité', item => item.titre, 'fa-solid fa-calendar-days', 'purple', '/admin/activites');
        this.addNotifications(items, response.comptesRendus?.data, 'Nouveau compte-rendu', item => item.titre, 'fa-solid fa-file-lines', 'teal', '/admin/comptes-rendus');
        this.notifications = items.sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()).slice(0, 40);
        this.cdr.markForCheck();
      }
    });
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
