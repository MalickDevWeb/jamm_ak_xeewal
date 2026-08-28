import { 
  Component, 
  AfterViewInit, 
  OnDestroy, 
  OnInit, 
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PublicDataService } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private scrollInterval: any;
  private resizeObserver: ResizeObserver | null = null;
  
  activites: any[] = [];
  homeContent: any = null;
  siteSettings: any = {};
  qrTargetUrl = '';
  qrImageUrl = '';

  constructor(
    private publicData: PublicDataService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    // Charger les activités
    this.publicData.getActivites().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.activites = res.data.slice(0, 5);
          this.cdr.markForCheck();
        }
      }
    });

    // Charger le contenu éditorial
    this.publicData.getEditorial('home').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.homeContent = res.data;
          this.cdr.markForCheck();
        }
      }
    });

    // Charger les paramètres
    this.publicData.getSettings().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.siteSettings = res.data;
        }
        this.buildQrCode();
        this.cdr.markForCheck();
      },
      error: () => {
        this.buildQrCode();
        this.cdr.markForCheck();
      }
    });
  }

  buildQrCode() {
    const target =
      this.siteSettings?.qr_code_url ||
      this.siteSettings?.whatsapp ||
      window.location.origin + '/adherer';

    this.qrTargetUrl = target;
    const encoded = encodeURIComponent(target);
    this.qrImageUrl =
      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=022c16&bgcolor=ffffff&margin=10&data=${encoded}`;
  }

  getMediaUrl(url: string | null): string {
    return url || 'https://picsum.photos/seed/default/600/400';
  }

  // TrackBy pour ngFor - évite les re-rendus inutiles
  trackByActivite(index: number, item: any): string {
    return item.id || index;
  }

  ngAfterViewInit() {
    // Exécuter le carousel hors de la zone Angular pour de meilleures performances
    this.ngZone.runOutsideAngular(() => {
      this.initCarousel();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initCarousel() {
    const carousel = document.getElementById('activities-carousel');
    if (!carousel) return;

    const originalCards = Array.from(carousel.children) as HTMLElement[];
    if (originalCards.length === 0) return;

    // Cloner les cartes pour l'effet infini
    for (let i = 0; i < 2; i++) {
      originalCards.forEach(card => {
        carousel.appendChild(card.cloneNode(true));
      });
    }

    const cardWidth = originalCards[0].offsetWidth + 24;
    let isScrolling = false;

    const scroll = () => {
      if (isScrolling) return;
      
      const lightbox = document.getElementById('gallery-lightbox');
      if (lightbox && !lightbox.classList.contains('hidden')) return;

      if (carousel.scrollLeft >= cardWidth * originalCards.length) {
        carousel.style.scrollBehavior = 'auto';
        carousel.scrollLeft = 0;
        void carousel.offsetWidth;
      }

      carousel.style.scrollBehavior = 'smooth';
      carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
    };

    const startScroll = () => {
      if (!this.scrollInterval) {
        this.scrollInterval = setInterval(scroll, 15000);
      }
    };

    const stopScroll = () => {
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
        this.scrollInterval = null;
      }
    };

    carousel.addEventListener('mouseenter', stopScroll, { passive: true });
    carousel.addEventListener('mouseleave', startScroll, { passive: true });
    carousel.addEventListener('touchstart', stopScroll, { passive: true });
    carousel.addEventListener('touchend', startScroll, { passive: true });

    startScroll();
  }
}
