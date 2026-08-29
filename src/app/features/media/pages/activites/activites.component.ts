import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicDataService } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-activites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [PublicDataService],
  templateUrl: './activites.component.html',
  styleUrl: './activites.component.css'
})
export class ActivitesComponent implements OnInit {
  activites: any[] = [];

  constructor(
    private publicData: PublicDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.publicData.getActivites().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.activites = res.data;
          this.cdr.markForCheck();
        }
      }
    });
  }

  getMediaUrl(url: string | null): string {
    if (!url) return 'https://picsum.photos/seed/default/600/400';
    return url.split(',')[0];
  }
}
