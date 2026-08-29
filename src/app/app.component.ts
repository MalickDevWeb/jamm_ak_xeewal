import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { PwaInstallBannerComponent } from './shared/components/pwa-install-banner/pwa-install-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PwaInstallBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'jamm-angular';
  private destroy$ = new Subject<void>();
  private revealObserver: IntersectionObserver | null = null;

  constructor(private router: Router) {
    // Remplacement global des alert() natifs par de beaux toasts
    this.overrideNativeAlert();
  }

  private overrideNativeAlert() {
    if (typeof window !== 'undefined') {
      window.alert = (message: string) => {
        const toast = document.createElement('div');
        toast.className = 'fixed top-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-6 z-[9999] bg-[#022c16] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 w-[90%] md:w-auto max-w-sm transition-all duration-500 transform translate-y-[-100px] opacity-0';
        toast.innerHTML = `<i class="fa-solid fa-bell text-[#F59E0B] text-lg"></i> <span class="font-medium text-sm leading-snug">${message}</span>`;
        document.body.appendChild(toast);
        
        // Animation in
        requestAnimationFrame(() => {
          toast.classList.remove('translate-y-[-100px]', 'opacity-0');
          toast.classList.add('translate-y-0', 'opacity-100');
        });

        // Auto-remove after 4s
        setTimeout(() => {
          toast.classList.remove('translate-y-0', 'opacity-100');
          toast.classList.add('translate-y-[-20px]', 'opacity-0');
          setTimeout(() => toast.remove(), 500);
        }, 4000);
      };
    }
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      requestAnimationFrame(() => {
        this.initRevealObserver();
      });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnectObserver();
  }

  private disconnectObserver() {
    if (this.revealObserver) {
      this.revealObserver.disconnect();
      this.revealObserver = null;
    }
  }

  private initRevealObserver() {
    this.disconnectObserver();

    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length === 0) return;

    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          this.revealObserver?.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(reveal => this.revealObserver?.observe(reveal));
  }
}
