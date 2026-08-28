import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicDataService } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-galerie',
  standalone: true,
  imports: [CommonModule],
  providers: [PublicDataService],
  templateUrl: './galerie.component.html',
  styleUrl: './galerie.component.css'
})
export class GalerieComponent implements OnInit {
  photos: string[] = [];

  constructor(private publicData: PublicDataService) {}

  ngOnInit() {
    this.publicData.getActivites().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.photos = res.data.map((a: any) => a.media_url).filter((url: any) => url);
        }
      }
    });
  }
}
