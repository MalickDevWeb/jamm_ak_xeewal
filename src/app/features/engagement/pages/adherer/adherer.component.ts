import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { PublicDataService, Option } from '../../../../core/services/public-data.service';
import { QuartierSelectComponent } from '../../../../shared/components/quartier-select/quartier-select.component';

@Component({
  selector: 'app-adherer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, QuartierSelectComponent],
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



  async onSubmit() {
    if (!this.formData.prenom || !this.formData.nom || !this.formData.telephone || !this.formData.quartier) {
      this.errorMsg = 'Veuillez remplir tous les champs obligatoires.';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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
          this.errorMsg = "Une erreur est survenue lors de l'envoi. Veuillez réessayer.";
          window.scrollTo({ top: 0, behavior: 'smooth' });
          this.cdr.markForCheck();
        }
      });
    } catch (err: any) {
      this.isSubmitting = false;
      this.isUploadingFiles = false;
      
      let friendlyError = "Une erreur est survenue lors de l'envoi des fichiers.";
      if (err.status === 0) {
        friendlyError = "Impossible de joindre le serveur. Veuillez vérifier votre connexion internet.";
      } else if (err.error && err.error.message) {
        friendlyError = err.error.message;
      }
      
      this.errorMsg = friendlyError;
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    this.rectoBlob = file;
    
    // Preview locale
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.carteRectoBase64 = e.target.result;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
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
    this.versoBlob = file;

    // Preview locale
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.carteVersoBase64 = e.target.result;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
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
