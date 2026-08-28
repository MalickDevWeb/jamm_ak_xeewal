import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pwa-install-banner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
  <!-- ══════════════════════════════════════════════════
       BANNIÈRE D'INSTALLATION PWA — PREMIUM SLIDE-IN
  ══════════════════════════════════════════════════ -->

  <!-- Overlay flouté derrière (optionnel, ferme au clic) -->
  <div *ngIf="showBanner()"
       class="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[90] transition-opacity duration-500"
       (click)="dismiss()"
       role="presentation">
  </div>

  <!-- Bannière principale -->
  <div *ngIf="showBanner()"
       class="fixed top-0 left-0 right-0 z-[95] flex justify-center px-3 pt-3 sm:pt-4"
       role="dialog"
       aria-modal="true"
       aria-label="Installer l'application">

    <div class="w-full max-w-sm sm:max-w-md
                bg-white rounded-[2rem] overflow-hidden
                shadow-[0_25px_60px_-10px_rgba(2,44,22,0.45)]
                border border-white/60
                transform transition-all duration-500"
         [class.translate-y-0]="showBanner()"
         [class.-translate-y-full]="!showBanner()"
         style="animation: slideDown 0.45s cubic-bezier(0.34,1.56,0.64,1) both;">

      <!-- Bande décorative multicolore en haut -->
      <div class="h-1.5 w-full bg-gradient-to-r from-[#022c16] via-[#008d36] to-[#F59E0B]"></div>

      <!-- Contenu principal -->
      <div class="p-5 sm:p-6">

        <!-- Ligne 1 : Logo + Texte + Fermer -->
        <div class="flex items-start gap-4">

          <!-- Icône de l'app -->
          <div class="relative flex-shrink-0">
            <div class="w-16 h-16 rounded-[1.2rem] overflow-hidden border-2 border-[#022c16]/10 shadow-lg shadow-[#022c16]/20">
              <img src="assets/icons/icon-192x192.png"
                   alt="JÀMM AK XÉEWAL"
                   class="w-full h-full object-cover">
            </div>
            <!-- Badge animé -->
            <span class="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008d36] opacity-75"></span>
              <span class="relative inline-flex rounded-full h-4 w-4 bg-[#008d36] border-2 border-white"></span>
            </span>
          </div>

          <!-- Texte -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="inline-block bg-[#F59E0B]/15 text-amber-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-amber-200/80">
                Installer l'application
              </span>
            </div>
            <h2 class="font-black text-[#022c16] text-base sm:text-lg leading-tight tracking-tight">
              JÀMM AK XÉEWAL
            </h2>
            <p class="text-gray-500 text-xs sm:text-sm mt-0.5 leading-snug">
              Accédez au mouvement <strong class="text-[#022c16] font-bold">en 1 tap</strong>, même sans connexion.
            </p>
          </div>

          <!-- Bouton fermer -->
          <button (click)="dismiss()"
                  class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors active:scale-90 mt-0.5"
                  aria-label="Fermer">
            <i class="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <!-- Ligne 2 : Avantages rapides -->
        <div class="mt-4 grid grid-cols-3 gap-2">
          <div class="flex flex-col items-center gap-1.5 bg-[#022c16]/5 rounded-xl py-3 px-2">
            <i class="fa-solid fa-bolt text-[#F59E0B] text-base"></i>
            <span class="text-[10px] font-bold text-[#022c16] text-center leading-tight">Accès rapide</span>
          </div>
          <div class="flex flex-col items-center gap-1.5 bg-[#022c16]/5 rounded-xl py-3 px-2">
            <i class="fa-solid fa-wifi-slash text-[#008d36] text-base"></i>
            <span class="text-[10px] font-bold text-[#022c16] text-center leading-tight">Hors ligne</span>
          </div>
          <div class="flex flex-col items-center gap-1.5 bg-[#022c16]/5 rounded-xl py-3 px-2">
            <i class="fa-solid fa-bell text-purple-500 text-base"></i>
            <span class="text-[10px] font-bold text-[#022c16] text-center leading-tight">Notifications</span>
          </div>
        </div>

        <!-- Ligne 3 : Boutons CTA -->
        <div class="mt-4 flex items-center gap-3">
          <!-- Bouton principal : Installer -->
          <button (click)="install()"
                  [disabled]="isInstalling()"
                  class="flex-1 py-3.5 rounded-xl font-black text-sm text-white
                         bg-[#022c16] hover:bg-[#033d1e]
                         active:scale-[0.97] transition-all
                         shadow-[0_8px_20px_-6px_rgba(2,44,22,0.5)]
                         flex items-center justify-center gap-2
                         disabled:opacity-70 disabled:cursor-not-allowed">
            <i [class]="isInstalling() ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-download'"></i>
            {{ isInstalling() ? 'Installation...' : 'Installer gratuitement' }}
          </button>

          <!-- Bouton secondaire : Plus tard -->
          <button (click)="later()"
                  class="flex-shrink-0 py-3.5 px-4 rounded-xl font-bold text-sm text-gray-500
                         bg-gray-100 hover:bg-gray-200
                         active:scale-[0.97] transition-all">
            Plus tard
          </button>
        </div>

        <!-- iOS : instructions spécifiques -->
        <div *ngIf="isIos()" class="mt-3 flex items-start gap-2.5 bg-blue-50 rounded-xl p-3 border border-blue-100">
          <i class="fa-brands fa-apple text-blue-500 text-lg flex-shrink-0 mt-0.5"></i>
          <p class="text-blue-700 text-xs leading-snug">
            Sur iPhone/iPad, appuyez sur
            <i class="fa-solid fa-arrow-up-from-bracket text-blue-500"></i>
            <strong> Partager</strong> puis
            <strong>"Sur l'écran d'accueil"</strong> pour installer.
          </p>
        </div>

      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════
       Animation CSS inline
  ═══════════════════════════════════ -->
  <style>
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-110%); }
      to   { opacity: 1; transform: translateY(0); }
    }
  </style>
  `
})
export class PwaInstallBannerComponent implements OnInit, OnDestroy {

  showBanner   = signal(false);
  isInstalling = signal(false);
  isIos        = signal(false);

  private deferredPrompt: any = null;
  private readonly STORAGE_KEY = 'pwa_install_dismissed';
  private readonly DELAY_DAYS  = 3; // Réafficher après 3 jours si "Plus tard"

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Ne pas montrer si déjà installé en mode standalone
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if ((navigator as any).standalone === true) return; // iOS standalone

    // Détection iOS (Safari n'a pas beforeinstallprompt)
    const ua = navigator.userAgent;
    const iosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    this.isIos.set(iosDevice);

    // Vérifier si l'utilisateur a déjà refusé ou installé
    if (this.wasDismissedRecently()) return;

    if (iosDevice) {
      // Sur iOS, afficher les instructions après un délai
      setTimeout(() => {
        this.showBanner.set(true);
        this.cdr.markForCheck();
      }, 2500);
      return;
    }

    // Android / Desktop Chrome : intercepter l'événement natif
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault(); // Empêche la bannière native en bas
      this.deferredPrompt = e;

      // Afficher notre belle bannière après 2.5s (première visite)
      setTimeout(() => {
        this.showBanner.set(true);
        this.cdr.markForCheck();
      }, 2500);
    });

    // Masquer si l'app est installée depuis une autre source
    window.addEventListener('appinstalled', () => {
      this.showBanner.set(false);
      this.markDismissed(999); // Ne plus jamais afficher
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {}

  /** Lancer l'installation native (Android/Chrome) */
  async install() {
    if (this.isIos()) return; // iOS gère via les instructions

    if (!this.deferredPrompt) {
      this.showBanner.set(false);
      return;
    }

    this.isInstalling.set(true);

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        this.markDismissed(999);
      } else {
        this.markDismissed(this.DELAY_DAYS);
      }
    } catch (_) {}

    this.deferredPrompt = null;
    this.isInstalling.set(false);
    this.showBanner.set(false);
    this.cdr.markForCheck();
  }

  /** "Plus tard" → réafficher dans DELAY_DAYS jours */
  later() {
    this.markDismissed(this.DELAY_DAYS);
    this.showBanner.set(false);
  }

  /** Fermer sans mémoriser (sera re-proposé à la prochaine visite) */
  dismiss() {
    this.markDismissed(1);
    this.showBanner.set(false);
  }

  private markDismissed(days: number) {
    const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
    localStorage.setItem(this.STORAGE_KEY, expiry.toString());
  }

  private wasDismissedRecently(): boolean {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return false;
    return Date.now() < parseInt(raw, 10);
  }
}
