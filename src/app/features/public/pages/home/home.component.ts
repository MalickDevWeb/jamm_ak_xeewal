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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  
  activites: any[] = [];
  homeContent: any = null;
  mouvementContent: any = null;
  axesContent: any = null;
  siteSettings: any = {};
  evenements: any[] = [];
  qrTargetUrl = '';
  qrImageUrl = '';

  readonly defaultHeroTitle = `Écouter les besoins, <br/>\n<span class='text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-300 to-brand-yellow drop-shadow-none'>Construire Ensemble.</span>`;
  readonly defaultHeroParagraph = `JÀMM AK XÉEWAL n'est pas qu'une idée, c'est <strong class="text-white">une force en action sur le terrain</strong>.<br/><br/>Rejoignez des centaines de citoyens engagés pour transformer notre quartier, rue par rue.`;

  // Gallery state
  isGalleryOpen = false;
  currentGallery: string[] = [];
  currentIndex = 0;
  
  // Broken image tracker
  brokenImages = new Set<string>();
  brokenLightboxImages = new Set<string>();

  constructor(
    private publicData: PublicDataService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.publicData.getActivites().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.activites = res.data.slice(0, 6);
          this.cdr.markForCheck();
        }
      }
    });

    this.publicData.getEvenements().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.evenements = res.data.filter((e: any) => e.statut === 'A_VENIR' || e.statut === 'EN_COURS').slice(0, 5);
          this.cdr.markForCheck();
        }
      }
    });

    this.publicData.getEditorial('home').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.homeContent = res.data;
          this.cdr.markForCheck();
        }
      }
    });

    this.publicData.getEditorial('mouvement').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.mouvementContent = res.data;
          this.cdr.markForCheck();
        }
      }
    });

    this.publicData.getEditorial('axes').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.axesContent = res.data;
          this.cdr.markForCheck();
        }
      }
    });

    this.publicData.getSettings().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res?.data) this.siteSettings = res.data;
        this.buildQrCode();
        this.cdr.markForCheck();
      },
      error: () => { this.buildQrCode(); this.cdr.markForCheck(); }
    });
  }

  buildQrCode() {
    const target = this.siteSettings?.qr_code_url || this.siteSettings?.whatsapp || window.location.origin + '/adherer';
    this.qrTargetUrl = target;
    const encoded = encodeURIComponent(target);
    this.qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=022c16&bgcolor=ffffff&margin=10&data=${encoded}`;
  }

  getMediaUrl(activite: any): string {
    if (this.brokenImages.has(activite.id)) {
      return 'assets/media_1787574641552.jpg';
    }

    const url = activite.mediaUrl;
    const urls = this.getAllMediaUrls(url);
    const defaultImg = 'assets/media_1787574641552.jpg';
    if (urls.length === 0) return defaultImg;
    
    // If there's an actual image in the list, prioritize it as the thumbnail!
    const image = urls.find(u => !this.isVideo(u));
    if (image) {
      return image;
    }
    
    const firstUrl = urls[0];
    if (this.isVideo(firstUrl)) {
      if (firstUrl.includes('youtube.com/watch?v=')) {
        const vidId = firstUrl.split('v=')[1].split('&')[0];
        return `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`;
      } else if (firstUrl.includes('youtu.be/')) {
        const vidId = firstUrl.split('youtu.be/')[1].split('?')[0];
        return `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`;
      } else if (firstUrl.includes('res.cloudinary.com') && firstUrl.includes('/video/')) {
        return firstUrl.replace(/\.(mp4|webm|ogg|mov)$/i, '.jpg');
      }
      return defaultImg;
    }
    
    return firstUrl || defaultImg;
  }

  getAllMediaUrls(url: string | null): string[] {
    const defaultImg = 'assets/media_1787574641552.jpg';
    if (!url || typeof url !== 'string' || url.trim() === '' || url === '[]' || url === 'null' || url === 'undefined') {
      return [defaultImg];
    }
    
    let parsedUrls: string[] = [];
    try {
      const parsed = JSON.parse(url);
      if (Array.isArray(parsed)) {
        parsedUrls = parsed;
      } else if (typeof parsed === 'string') {
        parsedUrls = [parsed];
      }
    } catch(e) {
      // If it's not JSON, assume it's comma separated
      parsedUrls = url.split(',');
    }
    
    // Filter out invalid URLs (must be string, non-empty, and not look like stringified JSON brackets)
    const validUrls = parsedUrls
      .map(u => typeof u === 'string' ? u.trim() : '')
      .filter(u => u.length > 0 && !u.startsWith('[') && !u.startsWith('{') && u !== '""' && u !== "''" && u !== 'null');
      
    return validUrls.length > 0 ? validUrls : [defaultImg];
  }

  trackByActivite(index: number, item: any): string {
    return item.id || index;
  }

  openGallery(images: string[]): void {
    if (!images || images.length === 0) return;
    this.currentGallery = images;
    this.currentIndex = 0;
    this.isGalleryOpen = true;
    this.cdr.markForCheck();
  }

  closeGallery(): void {
    this.isGalleryOpen = false;
    this.currentGallery = [];
    this.cdr.markForCheck();
  }

  prevGalleryImage(event?: Event): void {
    if (event) event.stopPropagation();
    this.currentIndex = (this.currentIndex - 1 + this.currentGallery.length) % this.currentGallery.length;
    this.cdr.markForCheck();
  }

  nextGalleryImage(event?: Event): void {
    if (event) event.stopPropagation();
    this.currentIndex = (this.currentIndex + 1) % this.currentGallery.length;
    this.cdr.markForCheck();
  }

  isVideo(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return this.isEmbedVideo(url) || this.isDirectVideo(url);
  }

  isEmbedVideo(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com');
  }

  isDirectVideo(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.mp4') || lower.includes('.webm') || (lower.includes('cloudinary.com') && lower.includes('/video/'));
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    let finalUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      finalUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      finalUrl = url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  }

  onImageError(activiteId: string) {
    if (!this.brokenImages.has(activiteId)) {
      this.brokenImages.add(activiteId);
      this.cdr.markForCheck();
    }
  }

  onLightboxImageError(url: string) {
    if (!this.brokenLightboxImages.has(url)) {
      this.brokenLightboxImages.add(url);
      this.cdr.markForCheck();
    }
  }

  ngAfterViewInit() {
    this.ngZone.runOutsideAngular(() => this.initCarousel());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.scrollInterval) clearInterval(this.scrollInterval);
  }

  private initCarousel() {
    const carousel = document.getElementById('activities-carousel');
    if (!carousel) return;
    const originalCards = Array.from(carousel.children) as HTMLElement[];
    if (originalCards.length === 0) return;

    for (let i = 0; i < 2; i++) {
      originalCards.forEach(card => carousel.appendChild(card.cloneNode(true)));
    }

    const cardWidth = originalCards[0].offsetWidth + 24;

    const scroll = () => {
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
      if (!this.scrollInterval) this.scrollInterval = setInterval(scroll, 8000);
    };
    const stopScroll = () => {
      if (this.scrollInterval) { clearInterval(this.scrollInterval); this.scrollInterval = null; }
    };

    carousel.addEventListener('mouseenter', stopScroll, { passive: true });
    carousel.addEventListener('mouseleave', startScroll, { passive: true });
    carousel.addEventListener('touchstart', stopScroll, { passive: true });
    carousel.addEventListener('touchend', startScroll, { passive: true });
    startScroll();
  }


  addToCalendar(event: any): void {
    if (!event) return;

    const formatDate = (dateStr: string, timeStr: string | null): string => {
      const date = new Date(dateStr);
      if (timeStr) {
        const parts = timeStr.split(":");
        date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      } else {
        date.setHours(9, 0, 0, 0);
      }
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const formatDateEnd = (dateStr: string, timeStr: string | null): string => {
      const date = new Date(dateStr);
      if (timeStr) {
        const parts = timeStr.split(":");
        date.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      } else {
        date.setHours(17, 0, 0, 0);
      }
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const uid = event.id + "@jammakxeewal.sn";
    const now = new Date();
    const nowStr = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const start = formatDate(event.date, event.heureDebut);
    const end = formatDateEnd(event.date, event.heureFin);

    const title = event.titre || "Événement JÀMM AK XÉEWAL";
    const location = event.lieu || "";
    const description = (event.description || "").replace(/\n/g, "\\n");

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//JAMM AK XEEWAL//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + uid,
      "DTSTAMP:" + nowStr,
      "DTSTART:" + start,
      "DTEND:" + end,
      "SUMMARY:" + title
    ];

    if (location) lines.push("LOCATION:" + location);
    if (description) lines.push("DESCRIPTION:" + description);
    lines.push("STATUS:CONFIRMED");
    lines.push("END:VEVENT");
    lines.push("END:VCALENDAR");

    const icsContent = lines.join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = title.replace(/[^a-zA-Z0-9À-ÿ\s]/g, "").replace(/\s+/g, "_") + ".ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  trackByEventId(index: number, event: any): string {
    return event?.id || index.toString();
  }
}
