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
    carousel.addEventListener('touchstart', stopScroll, {passive: true});
    carousel.addEventListener('touchend', startScroll, {passive: true});
    
    startScroll();
  }
}
