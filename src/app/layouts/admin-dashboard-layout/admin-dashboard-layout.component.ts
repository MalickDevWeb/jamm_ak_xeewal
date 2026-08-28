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

@Component({
  selector: 'app-admin-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-dashboard-layout.component.html',
  styleUrl: './admin-dashboard-layout.component.css'
})
export class AdminDashboardLayoutComponent implements OnInit, OnDestroy {
  notifications: AdminNotification[] = [];
  notificationsOpen = false;
  isLoading = false;
  private destroy$ = new Subject<void>();
  private readonly readStorageKey = 'jamm-admin-read-notifications';

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
        this.addNotifications(items, response.besoins?.data, 'Nouveau besoin déclaré', item => item.description || `Quartier ${item.quartier}`, 'fa-solid fa-hand-holding-heart', 'red', '/admin/besoins');
        this.addNotifications(items, response.idees?.data, 'Nouvelle idée proposée', item => item.titre, 'fa-solid fa-lightbulb', 'yellow', '/admin/idees');
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
    if (minutes < 1) return 'À l’instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (minutes < 1440) return `Il y a ${Math.floor(minutes / 60)} h`;
    return date.toLocaleDateString('fr-FR');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
