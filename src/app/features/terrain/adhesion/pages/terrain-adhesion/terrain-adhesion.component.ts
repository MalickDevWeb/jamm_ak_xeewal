import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';
import { PublicDataService, Option } from '../../../../../core/services/public-data.service';
import { QuartierSelectComponent } from '../../../../../shared/components/quartier-select/quartier-select.component';
import { validateSenegalPhone, normalizeSenegalPhone, requireText } from '../../../../../core/utils/validation.utils';

@Component({
  selector: 'app-terrain-adhesion',
  standalone: true,
  imports: [CommonModule, FormsModule, QuartierSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './terrain-adhesion.component.html',
  styleUrl: './terrain-adhesion.component.css'
})
export class TerrainAdhesionComponent implements OnInit, OnDestroy {
  @ViewChild('rectoInput') rectoInput!: ElementRef;
  @ViewChild('versoInput') versoInput!: ElementRef;
  @ViewChild('rectoCameraInput') rectoCameraInput!: ElementRef;
  @ViewChild('versoCameraInput') versoCameraInput!: ElementRef;

  private destroy$ = new Subject<void>();

  // Agent terrain info
  agentUser: any = null;
  agentPoints = 0;

  formData = {
    prenom: '',
    nom: '',
    telephone: '',
    quartier: '',
    profession: '',
    centreVote: '',
    bureauVote: '',
    carteRectoUrl: '',
    carteVersoUrl: ''
  };

  quartiers: Option[] = [];
  centresVote: { id: string; nom: string; bureaux: number }[] = [];
  bureauVoteOptions: string[] = [];

  isSubmitting = false;
  errorMsg = '';
  success = false;
  successName = '';

  // Images carte d'identité
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
    private router: Router
  ) {}

  ngOnInit() {
    // Charger les infos agent depuis localStorage
    const userRaw = localStorage.getItem('terrain_user');
    if (userRaw) {
      try {
        this.agentUser = JSON.parse(userRaw);
        this.agentPoints = this.agentUser.points || 0;
      } catch {}
    }
    this.loadOptions();
  }

  private loadOptions() {
    this.publicData.getOptions('quartier').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.quartiers = res.data;
          this.cdr.markForCheck();
        }
      }
    });

    this.publicData.getCentresVote().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.centresVote = res.data;
          this.cdr.markForCheck();
        }
      }
    });
  }

  onCentreVoteChange(centreName: string) {
    this.formData.bureauVote = '';
    if (!centreName) {
      this.bureauVoteOptions = [];
      return;
    }
    const centre = this.centresVote.find(c => c.nom === centreName);
    if (centre && centre.bureaux > 0) {
      this.bureauVoteOptions = Array.from({ length: centre.bureaux }, (_, i) => `Bureau N°${i + 1}`);
    } else {
      this.bureauVoteOptions = [];
    }
    this.cdr.markForCheck();
  }

  private scrollToCni(): void {
    try {
      const el = document.querySelector('app-terrain-adhesion form') as HTMLElement | null;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {}
  }

  trackByOption(index: number, item: any): string {
    return item.id;
  }

  async onSubmit() {
    // 1. Validation des champs texte obligatoires
    const prenomErr = requireText(this.formData.prenom, 'Le prénom');
    if (prenomErr) { this.errorMsg = prenomErr; this.cdr.markForCheck(); this.scrollToCni(); return; }
    const nomErr = requireText(this.formData.nom, 'Le nom');
    if (nomErr) { this.errorMsg = nomErr; this.cdr.markForCheck(); this.scrollToCni(); return; }
    if (!this.formData.quartier) {
      this.errorMsg = 'Veuillez sélectionner un quartier.';
      this.cdr.markForCheck();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 1b. Validation du format téléphone (numéro sénégalais)
    const phoneCheck = validateSenegalPhone(this.formData.telephone);
    if (!phoneCheck.valid) {
      this.errorMsg = phoneCheck.message || 'Numéro de téléphone invalide.';
      this.cdr.markForCheck();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Normaliser le téléphone avant envoi
    this.formData.telephone = normalizeSenegalPhone(this.formData.telephone) || this.formData.telephone;

    // 2. Validation des images de la carte d'identité (OBLIGATOIRE pour les agents terrain)
    // On accepte soit un fichier local (rectoBlob/versoBlob) soit une URL déjà uploadée (carteRectoUrl/carteVersoUrl)
    const hasRecto = !!(this.rectoBlob || this.formData.carteRectoUrl);
    const hasVerso = !!(this.versoBlob || this.formData.carteVersoUrl);

    if (!hasRecto || !hasVerso) {
      const missing: string[] = [];
      if (!hasRecto) missing.push('Recto');
      if (!hasVerso) missing.push('Verso');
      this.errorMsg = `Photo(s) de la carte d'identité manquante(s) : ${missing.join(' et ')}. Les deux faces (recto & verso) sont obligatoires pour valider l'inscription.`;
      this.cdr.markForCheck();
      // Mettre en évidence les zones concernées
      if (!hasRecto) this.rectoError = "La photo du recto est obligatoire.";
      if (!hasVerso) this.versoError = "La photo du verso est obligatoire.";
      // Scroll vers la section carte d'identité
      this.scrollToCni();
      return;
    }

    // 3. Vérifier qu'il n'y a pas d'erreur en cours sur les images (mauvais type, trop lourd...)
    if (this.rectoError || this.versoError) {
      this.errorMsg = "Veuillez corriger les erreurs sur les photos de la carte d'identité avant de valider.";
      this.cdr.markForCheck();
      this.scrollToCni();
      return;
    }

    this.isSubmitting = true;
    this.errorMsg = '';
    this.rectoError = '';
    this.versoError = '';
    this.cdr.markForCheck();

    try {
      // Upload des images si présentes
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

      // Envoyer l'adhésion via l'endpoint agent terrain
      const terrainToken = localStorage.getItem('terrain_token');
      this.http.post<any>(`${environment.apiUrl}/agents-terrain/adhesion`, this.formData, {
        headers: { Authorization: `Bearer ${terrainToken}` }
      }).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          this.success = true;
          this.successName = `${this.formData.prenom} ${this.formData.nom}`;

          // Mettre à jour les points
          if (res.agentPoints !== undefined) {
            this.agentPoints = res.agentPoints;
            // Mettre à jour localStorage
            if (this.agentUser) {
              this.agentUser.points = res.agentPoints;
              localStorage.setItem('terrain_user', JSON.stringify(this.agentUser));
            }
          } else {
            this.agentPoints++;
          }

          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.isSubmitting = false;
          const serverMsg = err?.error?.message || '';
          if (err.status === 409 || serverMsg.includes('déjà')) {
            this.errorMsg = 'Ce numéro de téléphone est déjà enregistré.';
          } else if (err.status === 401) {
            this.errorMsg = 'Session expirée. Veuillez vous reconnecter.';
            setTimeout(() => this.logout(), 2000);
          } else {
            this.errorMsg = serverMsg || "Une erreur est survenue. Veuillez réessayer.";
          }
          this.cdr.markForCheck();
        }
      });
    } catch (err: any) {
      this.isSubmitting = false;
      this.isUploadingFiles = false;
      this.errorMsg = "Erreur lors de l'envoi des fichiers.";
      this.cdr.markForCheck();
    }
  }

  resetForm() {
    this.success = false;
    this.successName = '';
    this.errorMsg = '';
    this.formData = { prenom: '', nom: '', telephone: '', quartier: '', profession: '', centreVote: '', bureauVote: '', carteRectoUrl: '', carteVersoUrl: '' };
    this.removeRecto();
    this.removeVerso();
    this.cdr.markForCheck();
  }

  logout() {
    localStorage.removeItem('terrain_token');
    localStorage.removeItem('terrain_user');
    this.router.navigate(['/terrain/login']);
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
    this.errorMsg = '';
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.match('image.*')) { this.rectoError = 'Veuillez sélectionner une image.'; return; }
    if (file.size > 5 * 1024 * 1024) { this.rectoError = "Image trop lourde (max 5MB)."; return; }
    this.carteRectoName = file.name;
    try {
      this.rectoBlob = await this.compressImage(file);
      const reader = new FileReader();
      reader.onload = (e: any) => { this.carteRectoBase64 = e.target.result; this.cdr.markForCheck(); };
      reader.readAsDataURL(this.rectoBlob);
    } catch { this.rectoError = "Erreur de compression."; this.cdr.markForCheck(); }
  }

  async onVersoSelected(event: any) {
    this.versoError = '';
    this.errorMsg = '';
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.match('image.*')) { this.versoError = 'Veuillez sélectionner une image.'; return; }
    if (file.size > 5 * 1024 * 1024) { this.versoError = "Image trop lourde (max 5MB)."; return; }
    this.carteVersoName = file.name;
    try {
      this.versoBlob = await this.compressImage(file);
      const reader = new FileReader();
      reader.onload = (e: any) => { this.carteVersoBase64 = e.target.result; this.cdr.markForCheck(); };
      reader.readAsDataURL(this.versoBlob);
    } catch { this.versoError = "Erreur de compression."; this.cdr.markForCheck(); }
  }

  removeRecto() { this.carteRectoBase64 = null; this.carteRectoName = ''; this.rectoError = ''; this.rectoBlob = null; this.formData.carteRectoUrl = ''; }
  removeVerso() { this.carteVersoBase64 = null; this.carteVersoName = ''; this.versoError = ''; this.versoBlob = null; this.formData.carteVersoUrl = ''; }
  triggerRectoUpload() { this.rectoInput?.nativeElement?.click(); }
  triggerVersoUpload() { this.versoInput?.nativeElement?.click(); }
  triggerRectoCamera() { this.rectoCameraInput?.nativeElement?.click(); }
  triggerVersoCamera() { this.versoCameraInput?.nativeElement?.click(); }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
