import { Component, OnInit, OnDestroy, HostListener, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PublicDataService } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-activites',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './activites.component.html',
  styleUrl: './activites.component.css'
})
export class ActivitesComponent implements OnInit {
  activites = signal<any[]>([]);
  evenements = signal<any[]>([]);
  activeTab = signal<'AGENDA' | 'GALERIE'>('AGENDA');
  isLoading = signal(true);

  // Lightbox state
  selectedActivite = signal<any>(null);
  lightboxMediaUrls = signal<string[]>([]);
  lightboxIndex = signal(0);
  
  // Broken image trackers
  brokenImages = new Set<string>();
  brokenLightboxImages = new Set<string>();

  private autoplayInterval: any;

  constructor(
    private publicData: PublicDataService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnDestroy() {
    this.stopAutoplay();
  }

  ngOnInit() {
    this.publicData.getActivites().subscribe({
      next: (res: any) => {
        this.activites.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });

    this.publicData.getEvenements().subscribe({
      next: (res: any) => {
        if (res.data) {
          const upcoming = res.data.filter((e: any) => e.statut === 'A_VENIR' || e.statut === 'EN_COURS');
          this.evenements.set(upcoming);
        }
      }
    });
  }

  setTab(tab: 'AGENDA' | 'GALERIE') {
    this.activeTab.set(tab);
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

  getMediaUrls(url: any): string[] {
    if (!url) return [];
    if (Array.isArray(url)) return url;
    if (typeof url === 'string') {
        try {
            const parsed = JSON.parse(url);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            return url.split(',').map((u: string) => u.trim()).filter(Boolean);
        }
    }
    return [];
  }

  getFirstMedia(url: string | null): string {
    const urls = this.getMediaUrls(url);
    return urls[0] || 'assets/president-photo.jpeg';
  }

  isVideo(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.mp4') || lower.includes('.webm') || lower.includes('youtube.com') || lower.includes('youtu.be') || (lower.includes('cloudinary.com') && lower.includes('/video/'));
  }

  isDirectVideo(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.mp4') || lower.includes('.webm') || (lower.includes('cloudinary.com') && lower.includes('/video/'));
  }

  isEmbedVideo(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('youtube.com') || lower.includes('youtu.be');
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    let finalUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      const vidId = url.split('v=')[1].split('&')[0];
      finalUrl = `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0`;
    } else if (url.includes('youtu.be/')) {
      const vidId = url.split('youtu.be/')[1].split('?')[0];
      finalUrl = `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(finalUrl);
  }

  getCardThumbnail(activite: any): string {
    if (this.brokenImages.has(activite.id)) {
      return 'assets/president-photo.jpeg';
    }

    const urls = this.getMediaUrls(activite.mediaUrl);
    const defaultImg = 'assets/president-photo.jpeg';
    if (urls.length === 0) return defaultImg;

    // Prioritize explicitly uploaded image
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

  onImageError(activiteId: string) {
    if (!this.brokenImages.has(activiteId)) {
      this.brokenImages.add(activiteId);
      // Angular signals update automatically in some contexts, but to be sure we could trigger a ref.
    }
  }

  onLightboxImageError(url: string) {
    this.brokenLightboxImages.add(url);
  }

  openLightbox(activite: any) {
    this.selectedActivite.set(activite);
    this.lightboxMediaUrls.set(this.getMediaUrls(activite.mediaUrl));
    this.lightboxIndex.set(0);
    this.startAutoplay();
  }

  closeLightbox() {
    this.selectedActivite.set(null);
    this.lightboxMediaUrls.set([]);
    this.lightboxIndex.set(0);
    this.stopAutoplay();
  }

  nextMedia() {
    const max = this.lightboxMediaUrls().length - 1;
    this.lightboxIndex.update(i => (i < max ? i + 1 : 0));
    this.resetAutoplay();
  }

  prevMedia() {
    const max = this.lightboxMediaUrls().length - 1;
    this.lightboxIndex.update(i => (i > 0 ? i - 1 : max));
    this.resetAutoplay();
  }

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
        const urls = this.lightboxMediaUrls();
        if (urls.length <= 1) return;
        const currentUrl = urls[this.lightboxIndex()];
        if (this.isVideo(currentUrl)) return;
        
        this.lightboxIndex.update(i => {
           const max = urls.length - 1;
           return (i < max ? i + 1 : 0);
        });
    }, 4000);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  resetAutoplay() {
    this.startAutoplay();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.selectedActivite()) return;
    if (event.key === 'ArrowRight') this.nextMedia();
    if (event.key === 'ArrowLeft') this.prevMedia();
    if (event.key === 'Escape') this.closeLightbox();
  }
}

