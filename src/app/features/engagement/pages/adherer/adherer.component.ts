import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { PublicDataService, Option } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-adherer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './adherer.component.html',
  styleUrl: './adherer.component.css'
})
export class AdhererComponent implements OnInit, OnDestroy {
  @ViewChild('rectoInput') rectoInput!: ElementRef;
  @ViewChild('versoInput') versoInput!: ElementRef;

  private destroy$ = new Subject<void>();

  formData = {
    prenom: '',
    nom: '',
    telephone: '',
    quartier: '',
    profession: '',
    pole: '',
    motivation: '',
    carteRectoUrl: '',
    carteVersoUrl: ''
  };

  // Options dynamiques depuis la base de données
  quartiers: Option[] = [];
  poles: Option[] = [];

  isSubmitting = false;
  errorMsg = '';
  success = false;

  // Variables pour les images de carte d'identité
  carteRectoBase64: string | null = null;
  carteVersoBase64: string | null = null;
  carteRectoName = '';
  carteVersoName = '';
  rectoError = '';
  versoError = '';

  constructor(
    private publicData: PublicDataService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOptions();
  }

  private loadOptions() {
    // Charger les quartiers
    this.publicData.getOptions('quartier').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.quartiers = res.data;
          this.cdr.markForCheck();
        } else {
          console.error('Failed to load quartiers:', res);
        }
      },
      error: (err) => {
        console.error('Error loading quartiers:', err);
      }
    });

    // Charger les pôles
    this.publicData.getOptions('pole').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.poles = res.data;
          this.cdr.markForCheck();
        } else {
          console.error('Failed to load poles:', res);
        }
      },
      error: (err) => {
        console.error('Error loading poles:', err);
      }
    });
  }

  // TrackBy pour les options
  trackByOption(index: number, item: Option): string {
    return item.id;
  }

  onSubmit() {
    if (!this.formData.prenom || !this.formData.nom || !this.formData.telephone || !this.formData.quartier) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    this.isSubmitting = true;

    this.publicData.postAdherent(this.formData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSubmitting = false;
        alert('Erreur lors de l\'envoi. Veuillez réessayer.');
        this.cdr.markForCheck();
      }
    });
  }

  resetForm() {
    this.success = false;
    this.formData = { prenom: '', nom: '', telephone: '', quartier: '', profession: '', pole: '', motivation: '', carteRectoUrl: '', carteVersoUrl: '' };
    this.removeRecto();
    this.removeVerso();
  }

  // --- Gestion des fichiers ---
  async onRectoSelected(event: any) {
    this.rectoError = '';
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      this.rectoError = 'Veuillez sélectionner une image (JPG, PNG).';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.rectoError = "L'image est trop lourde (max 5MB).";
      return;
    }

    this.carteRectoName = file.name;
    this.cdr.markForCheck();

    // Upload vers Cloudinary
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res: any = await firstValueFrom(this.http.post(`${environment.apiUrl}/upload-public`, fd));
      if (res.success) {
        this.formData.carteRectoUrl = res.url;
        // Also show preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.carteRectoBase64 = e.target.result;
          this.cdr.markForCheck();
        };
        reader.readAsDataURL(file);
      } else {
        this.rectoError = res.message || "Erreur lors de l'envoi de l'image.";
        this.cdr.markForCheck();
      }
    } catch (err: any) {
      this.rectoError = "Erreur réseau lors de l'envoi de l'image. Veuillez réessayer.";
      console.error('Upload recto error:', err);
      this.cdr.markForCheck();
    }
  }

  async onVersoSelected(event: any) {
    this.versoError = '';
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      this.versoError = 'Veuillez sélectionner une image (JPG, PNG).';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.versoError = "L'image est trop lourde (max 5MB).";
      return;
    }

    this.carteVersoName = file.name;
    this.cdr.markForCheck();

    // Upload vers Cloudinary
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res: any = await firstValueFrom(this.http.post(`${environment.apiUrl}/upload-public`, fd));
      if (res.success) {
        this.formData.carteVersoUrl = res.url;
        // Also show preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.carteVersoBase64 = e.target.result;
          this.cdr.markForCheck();
        };
        reader.readAsDataURL(file);
      } else {
        this.versoError = res.message || "Erreur lors de l'envoi de l'image.";
        this.cdr.markForCheck();
      }
    } catch (err: any) {
      this.versoError = "Erreur réseau lors de l'envoi de l'image. Veuillez réessayer.";
      console.error('Upload verso error:', err);
      this.cdr.markForCheck();
    }
  }

  removeRecto() {
    this.carteRectoBase64 = null;
    this.carteRectoName = '';
    this.rectoError = '';
  }

  removeVerso() {
    this.carteVersoBase64 = null;
    this.carteVersoName = '';
    this.versoError = '';
  }

  triggerRectoUpload() {
    this.rectoInput?.nativeElement?.click();
  }

  triggerVersoUpload() {
    this.versoInput?.nativeElement?.click();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
