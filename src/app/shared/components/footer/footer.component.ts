import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { PublicDataService } from '../../../core/services/public-data.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  public environment = environment;
  socialLinks: any = { whatsapp: 'https://wa.me/', facebook: '#', tiktok: '#', youtube: '#' };

  constructor(private publicData: PublicDataService) {}

  ngOnInit() {
    this.publicData.getSettings().subscribe({
      next: (res: any) => { this.socialLinks = { ...this.socialLinks, ...(res.data || {}) }; },
      error: () => {}
    });
  }

}
