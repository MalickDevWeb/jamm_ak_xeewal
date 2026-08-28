import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicDataService } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-axes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './axes.component.html',
  styleUrl: './axes.component.css'
})
export class AxesComponent implements OnInit {
  content: any = null;

  constructor(private publicData: PublicDataService) {}

  ngOnInit() {
    this.publicData.getEditorial('axes').subscribe({
      next: (res: any) => {
        if (res.data) {
          this.content = res.data;
        }
      }
    });
  }
}
