import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicDataService } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-mouvement',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mouvement.component.html',
  styleUrl: './mouvement.component.css'
})
export class MouvementComponent implements OnInit {
  content: any = null;

  constructor(private publicData: PublicDataService) {}

  ngOnInit() {
    this.publicData.getEditorial('mouvement').subscribe({
      next: (res: any) => {
        if (res.data) {
          this.content = res.data;
        }
      }
    });
  }
}
