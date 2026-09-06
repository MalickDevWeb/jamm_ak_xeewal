import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-terrain-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col relative">
      
      <!-- Top Navigation Bar (Mobile First) -->
      <header class="bg-[#022c16] text-white h-16 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 shadow-md">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <i class="fa-solid fa-leaf text-white"></i>
          </div>
          <div>
            <h1 class="text-sm font-black tracking-wide">JÀMM AK XÉEWAL</h1>
            <p class="text-[10px] text-white/70 uppercase">Espace Adhérent</p>
          </div>
        </div>

        <div class="relative">
          <button (click)="toggleNotifPanel($event)" class="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors relative">
            <i class="fa-solid fa-bell text-lg"></i>
            <span *ngIf="unreadCount > 0" class="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[9px] font-bold text-white flex items-center justify-center rounded-full border-2 border-[#022c16]">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <!-- Notification Dropdown -->
          <div *ngIf="showNotifs" (click)="$event.stopPropagation()" class="absolute top-full right-0 mt-2 w-[90vw] max-w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
            <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 class="font-bold text-gray-800 text-sm">Notifications</h3>
              <button (click)="loadNotifications()" class="text-[#008d36] hover:text-[#022c16] text-xs font-semibold">
                <i class="fa-solid fa-rotate-right" [class.fa-spin]="isLoading"></i>
              </button>
            </div>

            <div class="max-h-[60vh] overflow-y-auto">
              <div *ngIf="notifications.length === 0" class="py-8 text-center text-gray-400">
                <i class="fa-regular fa-bell-slash text-2xl mb-2"></i>
                <p class="text-xs">Aucune notification.</p>
              </div>

              <div *ngFor="let n of notifications" 
                   class="px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                   [ngClass]="{'bg-[#e6f3eb]/30': !n.isRead}">
                <div class="flex justify-between items-start gap-2 mb-1">
                  <h4 class="text-sm font-bold text-gray-900 leading-tight" [ngClass]="{'text-[#022c16]': !n.isRead}">{{ n.title }}</h4>
                  <span *ngIf="!n.isRead" class="w-2 h-2 rounded-full bg-[#008d36] shrink-0 mt-1"></span>
                </div>
                <p class="text-xs text-gray-600 mb-2 leading-snug">{{ n.message }}</p>
                
                <div class="flex items-center justify-between mt-2">
                  <span class="text-[10px] text-gray-400">{{ n.createdAt | date:'dd/MM HH:mm' }}</span>
                  <button *ngIf="!n.isRead" (click)="markAsRead(n.deliveryId)" class="text-[10px] font-bold text-[#008d36] hover:underline">
                    Marquer comme lu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Notif Backdrop (mobile) -->
      <div *ngIf="showNotifs" (click)="showNotifs = false" class="fixed inset-0 z-40 bg-gray-900/10 backdrop-blur-sm"></div>

      <!-- Main Content Container -->
      <main class="flex-1 w-full pt-16 pb-20">
        <router-outlet></router-outlet>
      </main>

      <!-- Bottom Nav (Mobile) -->
      <nav class="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 z-40 flex items-center justify-around px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <a class="flex flex-col items-center p-2 text-[#008d36] font-bold">
          <i class="fa-solid fa-house text-lg mb-1"></i>
          <span class="text-[9px] uppercase tracking-wider">Accueil</span>
        </a>
        <!-- Add other links if needed -->
      </nav>
    </div>
  `
})
export class TerrainLayoutComponent implements OnInit, OnDestroy {
  showNotifs = false;
  unreadCount = 0;
  notifications: any[] = [];
  isLoading = false;
  
  // Simulation: On prend un ID d'adhérent fictif ou via auth (MVP)
  private currentMemberId = 'member-123'; // Vous pourrez brancher ça sur le vrai AuthService
  private pollingSub?: Subscription;

  constructor(
    private notifService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadNotifications();
    
    // Polling toutes les 30 secondes pour le MVP (Simulation Temps Réel)
    this.pollingSub = interval(30000).subscribe(() => {
      this.loadNotifications();
    });
  }

  ngOnDestroy() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
    }
  }

  toggleNotifPanel(event: Event) {
    event.stopPropagation();
    this.showNotifs = !this.showNotifs;
    if (this.showNotifs) {
      this.loadNotifications();
    }
  }

  loadNotifications() {
    this.isLoading = true;
    this.notifService.getMyNotifications(this.currentMemberId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.data) {
          this.notifications = res.data.notifications || [];
          this.unreadCount = res.data.unreadCount || 0;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  markAsRead(deliveryId: string) {
    this.notifService.markAsRead(deliveryId).subscribe({
      next: () => {
        // Mettre à jour localement pour être instantané
        const notif = this.notifications.find(n => n.deliveryId === deliveryId);
        if (notif) {
          notif.isRead = true;
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
        this.cdr.markForCheck();
      }
    });
  }
}
