import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
  activites: any[] = [];
  isLoading = true;

  // Lightbox state
  selectedActivite: any = null;
  lightboxMediaUrls: string[] = [];
  lightboxIndex = 0;

  constructor(private publicData: PublicDataService) {}

  ngOnInit() {
    this.publicData.getActivites().subscribe({
      next: (res: any) => {
        this.activites = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getMediaUrls(url: string | null): string[] {
    if (!url) return [];
    return url.split(',').map(u => u.trim()).filter(Boolean);
  }

  getFirstMedia(url: string | null): string {
    const urls = this.getMediaUrls(url);
    return urls[0] || 'https://picsum.photos/seed/default/600/400';
  }

  isVideo(url: string): boolean {
    return url.includes('/video/') || url.endsWith('.mp4') || url.endsWith('.webm');
  }

  openLightbox(activite: any) {
    this.selectedActivite = activite;
    this.lightboxMediaUrls = this.getMediaUrls(activite.mediaUrl);
    this.lightboxIndex = 0;
  }

  closeLightbox() {
    this.selectedActivite = null;
    this.lightboxMediaUrls = [];
    this.lightboxIndex = 0;
  }

  nextMedia() {
    if (this.lightboxIndex < this.lightboxMediaUrls.length - 1) {
      this.lightboxIndex++;
    } else {
      this.lightboxIndex = 0; // loop
    }
  }

  prevMedia() {
    if (this.lightboxIndex > 0) {
      this.lightboxIndex--;
    } else {
      this.lightboxIndex = this.lightboxMediaUrls.length - 1; // loop
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (!this.selectedActivite) return;
    if (event.key === 'ArrowRight') this.nextMedia();
    if (event.key === 'ArrowLeft') this.prevMedia();
    if (event.key === 'Escape') this.closeLightbox();
  }
}
