import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { PublicDataService, Option } from '../../../../core/services/public-data.service';
import { AuthService } from '../../../../core/services/auth.service';
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
  @ViewChild('rectoCameraInput') rectoCameraInput!: ElementRef;
  @ViewChild('versoCameraInput') versoCameraInput!: ElementRef;

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
  private redirectTimeout: any;

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
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router
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

      const uploadPromises = [];

      if (this.rectoBlob && !this.formData.carteRectoUrl) {
        const fd = new FormData();
        fd.append('file', this.rectoBlob);
        uploadPromises.push(
          firstValueFrom(this.http.post(`${environment.apiUrl}/upload-public`, fd)).then((res: any) => {
            if (res.success) this.formData.carteRectoUrl = res.url;
            else throw new Error("Erreur d'upload du recto.");
          })
        );
      }

      if (this.versoBlob && !this.formData.carteVersoUrl) {
        const fd = new FormData();
        fd.append('file', this.versoBlob);
        uploadPromises.push(
          firstValueFrom(this.http.post(`${environment.apiUrl}/upload-public`, fd)).then((res: any) => {
            if (res.success) this.formData.carteVersoUrl = res.url;
            else throw new Error("Erreur d'upload du verso.");
          })
        );
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      this.isUploadingFiles = false;
      this.publicData.postAdherent(this.formData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          this.success = true;

          // Sauvegarde automatique du compte pour la page d'accueil
          const adherentData = {
              id: res?.data?.id || res?.id || Math.floor(1000 + Math.random() * 9000),
              prenom: this.formData.prenom,
              nom: this.formData.nom,
              quartier: this.formData.quartier,
              photo: this.formData.carteRectoUrl || null,
              statut: res?.data?.statut || res?.statut || 'EN_ATTENTE'
          };
          localStorage.setItem('current_adherent', JSON.stringify(adherentData));

          if (res?.token) {
            // Optionnel : stocker le token au cas où on en a besoin plus tard
            localStorage.setItem('citizen_token', res.token);
          }

          this.cdr.markForCheck();

          // Redirection automatique après 3 secondes pour voir la carte sur l'accueil
          this.redirectTimeout = setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        },
        error: (err: any) => {
          this.isSubmitting = false;
          console.error("Erreur postAdherent:", err);
          
          let friendlyError = "Une erreur est survenue lors de l'envoi. Veuillez réessayer.";
          const serverMsg = err?.error?.message || err?.error?.error || err?.message || '';
          const serverMsgLower = serverMsg.toLowerCase();
          
          // Si on suspecte un problème d'unicité (409, 400, CORS 0, ou 500 avec "unique")
          if (
            err.status === 409 || 
            err.status === 400 || 
            err.status === 0 || 
            (err.status === 500 && (serverMsgLower.includes('unique') || serverMsgLower.includes('duplicate') || serverMsgLower.includes('exist')))
          ) {
             friendlyError = "Cet utilisateur (numéro de téléphone) existe déjà.";
          } 
          // Si on a un vrai message du serveur (sans "http" générique)
          else if (serverMsg && !serverMsgLower.includes('http')) {
             friendlyError = serverMsgLower.includes('unique') || serverMsgLower.includes('duplicate') || serverMsgLower.includes('exist') 
               ? "Cet utilisateur (numéro de téléphone) existe déjà." 
               : serverMsg;
          }
          
          this.errorMsg = friendlyError;
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
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
      this.redirectTimeout = null;
    }
    this.success = false;
    this.formData = { prenom: '', nom: '', telephone: '', quartier: '', profession: '', pole: '', motivation: '', carteRectoUrl: '', carteVersoUrl: '' };
    this.removeRecto();
    this.removeVerso();
  }

  // --- Gestion des fichiers ---
  compressImage(file: File): Promise<File> {
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
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
              resolve(compressedFile);
            } else reject(new Error('Compression failed'));
          }, 'image/jpeg', 0.7);
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
    if (file.size > 5 * 1024 * 1024) {
      this.rectoError = "L'image est trop lourde (max 5MB).";
      return;
    }

    this.carteRectoName = file.name;
    
    try {
      this.rectoBlob = await this.compressImage(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.carteRectoBase64 = e.target.result;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(this.rectoBlob);
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
    if (file.size > 5 * 1024 * 1024) {
      this.versoError = "L'image est trop lourde (max 5MB).";
      return;
    }

    this.carteVersoName = file.name;

    try {
      this.versoBlob = await this.compressImage(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.carteVersoBase64 = e.target.result;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(this.versoBlob);
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

  triggerRectoCamera() {
    this.rectoCameraInput?.nativeElement?.click();
  }

  triggerVersoCamera() {
    this.versoCameraInput?.nativeElement?.click();
  }

  ngOnDestroy() {
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
