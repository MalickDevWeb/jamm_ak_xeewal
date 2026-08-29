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
  
  rectoBlob: File | null = null;
  versoBlob: File | null = null;
  isUploadingFiles = false;

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

  showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 5000);
  }

  async onSubmit() {
    if (!this.formData.prenom) {
      this.showError('Veuillez renseigner votre Prénom et Nom.');
      return;
    }
    if (!this.formData.telephone) {
      this.showError('Veuillez renseigner votre Numéro de téléphone.');
      return;
    }
    if (!this.formData.quartier) {
      this.showError('Veuillez sélectionner votre Quartier.');
      return;
    }

    this.errorMsg = '';
    this.isSubmitting = true;

    try {
      if (this.rectoBlob || this.versoBlob) {
        this.isUploadingFiles = true;
        this.cdr.markForCheck();
      }

      if (this.rectoBlob && !this.formData.carteRectoUrl) {
        const fd = new FormData();
        fd.append('file', this.rectoBlob);
        const res: any = await firstValueFrom(this.http.post(`${environment.apiUrl}/upload-public`, fd));
        if (res.success) {
          this.formData.carteRectoUrl = res.url;
        } else {
          throw new Error("Erreur d'upload du recto.");
        }
      }

      if (this.versoBlob && !this.formData.carteVersoUrl) {
        const fd = new FormData();
        fd.append('file', this.versoBlob);
        const res: any = await firstValueFrom(this.http.post(`${environment.apiUrl}/upload-public`, fd));
        if (res.success) {
          this.formData.carteVersoUrl = res.url;
        } else {
          throw new Error("Erreur d'upload du verso.");
        }
      }

      this.isUploadingFiles = false;
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
          this.showError('Erreur lors de l\'envoi. Veuillez réessayer.');
          this.cdr.markForCheck();
        }
      });
    } catch (err: any) {
      this.isSubmitting = false;
      this.isUploadingFiles = false;
      this.showError(err.message || "Erreur réseau. Veuillez réessayer.");
      this.cdr.markForCheck();
    }
  }

  resetForm() {
    this.success = false;
    this.formData = { prenom: '', nom: '', telephone: '', quartier: '', profession: '', pole: '', motivation: '', carteRectoUrl: '', carteVersoUrl: '' };
    this.removeRecto();
    this.removeVerso();
  }

  // --- Gestion des fichiers ---
  async compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              // Convert Blob to File object to keep the name
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
              resolve(compressedFile);
            } else reject(new Error('Compression failed'));
          }, 'image/jpeg', 0.7); // 70% quality JPEG
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  async onRectoSelected(event: any) {
    this.rectoError = '';
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      this.rectoError = 'Veuillez sélectionner une image (JPG, PNG).';
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      this.rectoError = "L'image est trop lourde (max 15MB).";
      return;
    }

    try {
      this.carteRectoName = file.name;
      // Compress the image before storing it
      this.rectoBlob = await this.compressImage(file);
      
      // Preview locale using the compressed blob
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.carteRectoBase64 = e.target.result;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(this.rectoBlob!);
    } catch (err) {
      this.rectoError = "Erreur lors de la compression de l'image.";
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
    if (file.size > 15 * 1024 * 1024) {
      this.versoError = "L'image est trop lourde (max 15MB).";
      return;
    }

    try {
      this.carteVersoName = file.name;
      // Compress the image before storing it
      this.versoBlob = await this.compressImage(file);

      // Preview locale using the compressed blob
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.carteVersoBase64 = e.target.result;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(this.versoBlob!);
    } catch (err) {
      this.versoError = "Erreur lors de la compression de l'image.";
      this.cdr.markForCheck();
    }
  }

  removeRecto() {
    this.carteRectoBase64 = null;
    this.carteRectoName = '';
    this.rectoError = '';
    this.rectoBlob = null;
    this.formData.carteRectoUrl = '';
  }

  removeVerso() {
    this.carteVersoBase64 = null;
    this.carteVersoName = '';
    this.versoError = '';
    this.versoBlob = null;
    this.formData.carteVersoUrl = '';
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
