import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicDataService } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [PublicDataService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private scrollInterval: any;
  activites: any[] = [];
  homeContent: any = null;
  siteSettings: any = {};

  // URL cible encodée dans le QR (ex: WhatsApp, lien d'adhésion, etc.)
  qrTargetUrl = '';
  // Image du QR Code générée dynamiquement
  qrImageUrl = '';

  constructor(private publicData: PublicDataService) {}

  ngOnInit() {
    this.publicData.getActivites().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.activites = res.data.slice(0, 5);
        }
      }
    });

    this.publicData.getEditorial('home').subscribe({
      next: (res: any) => {
        if (res.data) {
          this.homeContent = res.data;
        }
      }
    });

    // Chargement des paramètres (dont qr_code_url)
    this.publicData.getSettings().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.siteSettings = res.data;
        }
        this.buildQrCode();
      },
      error: () => {
        this.buildQrCode();
      }
    });
  }

  /**
   * Génère l'URL de l'image QR via l'API goqr.me (gratuite, pas de clé).
   * L'URL cible est celle configurée par l'admin (qr_code_url),
   * ou par défaut le lien WhatsApp, ou enfin la page /adherer.
   */
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

  ngAfterViewInit() {
    this.initCarousel();
  }

  ngOnDestroy() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }

  initCarousel() {
    const carousel = document.getElementById('activities-carousel');
    if (!carousel) return;

    const originalCards = Array.from(carousel.children);
    if (originalCards.length === 0) return;

    for (let i = 0; i < 2; i++) {
      originalCards.forEach(card => {
        carousel.appendChild(card.cloneNode(true));
      });
    }

    const startScroll = () => {
      this.scrollInterval = setInterval(() => {
        const lightbox = document.getElementById('gallery-lightbox');
        if (lightbox && !lightbox.classList.contains('hidden')) return;

        const cardElement = originalCards[0] as HTMLElement;
        const cardWidth = cardElement.offsetWidth + 24;

        if (carousel.scrollLeft >= cardWidth * originalCards.length) {
          carousel.style.scrollBehavior = 'auto';
          carousel.scrollLeft = 0;
          void carousel.offsetWidth;
        }

        carousel.style.scrollBehavior = 'smooth';
        carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }, 15000);
    };

    const stopScroll = () => clearInterval(this.scrollInterval);

    carousel.addEventListener('mouseenter', stopScroll);
    carousel.addEventListener('mouseleave', startScroll);
    carousel.addEventListener('touchstart', stopScroll, { passive: true });
    carousel.addEventListener('touchend', startScroll, { passive: true });

    startScroll();
  }
}
