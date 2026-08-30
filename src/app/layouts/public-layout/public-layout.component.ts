import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ChatbotComponent } from '../../shared/components/chatbot/chatbot.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ChatbotComponent, CommonModule],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css'
})
export class PublicLayoutComponent implements OnInit {
  isMaintenance = false;
  isChecking = true;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/settings`).subscribe({
      next: (res) => {
        this.isChecking = false;
        if (res.success && res.data && res.data['MAINTENANCE_MODE'] === 'true') {
          this.isMaintenance = true;
          this.router.navigate(['/maintenance']);
        } else if (this.router.url === '/maintenance') {
          // If not in maintenance but on maintenance page, redirect to home
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.isChecking = false;
      }
    });
  }
}
