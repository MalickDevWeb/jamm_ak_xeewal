import { Component, OnInit, OnDestroy, HostListener, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  isLoading = signal(true);

  // Lightbox state
  selectedActivite = signal<any>(null);
  lightboxMediaUrls = signal<string[]>([]);
  lightboxIndex = signal(0);

  constructor(private publicData: PublicDataService) {}

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
    return urls[0] || 'https://picsum.photos/seed/default/600/400';
  }

  isVideo(url: string): boolean {
    return url.includes('/video/') || url.endsWith('.mp4') || url.endsWith('.webm');
  }

  getCardThumbnail(url: string): string {
    if (!url) return 'https://picsum.photos/seed/default/600/400';

    if (url.includes('res.cloudinary.com') && this.isVideo(url)) {
      return url
        .replace('/video/upload/', '/video/upload/w_600,q_auto,so_0/')
        .replace(/\.(mp4|webm|mov|avi)$/i, '.jpg');
    }

    if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
      return url.replace('/image/upload/', '/image/upload/w_600,q_auto,f_auto/');
    }

    return url;
  }

  openLightbox(activite: any) {
    this.selectedActivite.set(activite);
    this.lightboxMediaUrls.set(this.getMediaUrls(activite.mediaUrl));
    this.lightboxIndex.set(0);
  }

  closeLightbox() {
    this.selectedActivite.set(null);
    this.lightboxMediaUrls.set([]);
    this.lightboxIndex.set(0);
  }

  nextMedia() {
    const max = this.lightboxMediaUrls().length - 1;
    this.lightboxIndex.update(i => (i < max ? i + 1 : 0));
  }

  prevMedia() {
    const max = this.lightboxMediaUrls().length - 1;
    this.lightboxIndex.update(i => (i > 0 ? i - 1 : max));
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.selectedActivite()) return;
    if (event.key === 'ArrowRight') this.nextMedia();
    if (event.key === 'ArrowLeft') this.prevMedia();
    if (event.key === 'Escape') this.closeLightbox();
  }
}

