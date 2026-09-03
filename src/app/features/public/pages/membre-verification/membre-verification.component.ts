import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-membre-verification',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './membre-verification.component.html',
})
export class MembreVerificationComponent implements OnInit {
  adherent = signal<any>(null);
  isLoading = signal(true);
  notFound = signal(false);

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.notFound.set(true); this.isLoading.set(false); return; }

    this.http.get<any>(`${environment.apiUrl}/adherents/${id}`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.adherent.set(res.data);
        } else {
          this.notFound.set(true);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.isLoading.set(false);
      }
    });
  }

  get memberNumber(): string {
    const id = this.adherent()?.id;
    return id ? 'JA-' + id.toString().substring(0, 6).toUpperCase() : 'JA-XXXX';
  }

  baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://jammakxeewal.sn';

  encodeURIComponent(uri: string): string {
    return encodeURIComponent(uri);
  }
}
