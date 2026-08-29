import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicDataService } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-activites',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  // NO custom providers - use the root singleton so HTTP calls work correctly
  templateUrl: './activites.component.html',
  styleUrl: './activites.component.css'
})
export class ActivitesComponent implements OnInit {
  activites: any[] = [];
  isLoading = true;
  selectedActivite: any = null; // for lightbox

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
    return url.split(',').filter(u => u.trim());
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
  }

  closeLightbox() {
    this.selectedActivite = null;
  }
}
