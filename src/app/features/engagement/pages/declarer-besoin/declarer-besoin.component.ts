import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { PublicDataService, Option } from '../../../../core/services/public-data.service';
import { environment } from '../../../../../environments/environment';
import { QuartierSelectComponent } from '../../../../shared/components/quartier-select/quartier-select.component';

declare const RecordRTC: any;

type RecordingState = 'idle' | 'recording' | 'recording_locked' | 'paused' | 'done';
@Component({
  selector: 'app-declarer-besoin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, QuartierSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './declarer-besoin.component.html',
  styleUrl: './declarer-besoin.component.css'
})
export class DeclarerBesoinComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  formData = {
    titre: '',
    description: '',
    quartier: '',
    urgence: 'MOYENNE',
    nom_citoyen: '',
    telephone_citoyen: ''
  };

  // Mode de saisie : vocal ou texte
  inputMode: 'vocal' | 'text' = 'vocal';

  // === PUSH TO TALK ===
  touchStartY = 0;
  readonly LOCK_THRESHOLD = 50; // pixels to slide up to lock

  // === PHOTO UPLOAD ===
  imageBlob: File | null = null;
  imagePreviewUrl: string | null = null;
  cloudinaryImageUrl: string | null = null;
  isUploadingImage = false;
  imageError = '';

  // Options dynamiques depuis la base de données
  quartiers: Option[] = [];
  urgences: Option[] = [];

  // === VOCAL ===
  recordingState: RecordingState = 'idle';
  recordingTime: number = 0;
  MAX_RECORDING_SECONDS = 120;
  settingsLoaded = false;
  recordingTimerRef: any = null;
  private recorder: any = null;
  private stream: MediaStream | null = null;
  audioBlob: Blob | null = null;
  audioUrl: string | null = null;
  cloudinaryVocalUrl: string | null = null;
  isUploadingVocal = false;
  vocalError = '';
  vocalDuration: number = 0;
  audioFormat = 'webm';

  // === FORM ===
  isSubmitting = false;
  success = false;
  errorMsg = '';

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  constructor(
    private publicData: PublicDataService, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Charger les options dynamiques
    this.loadOptions();
    
    // Charger la durée max depuis les paramètres admin
    this.http.get<{ success: boolean; data: any }>(`${environment.apiUrl}/settings`).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        if (res.success && res.data?.vocal_max_seconds) {
          this.MAX_RECORDING_SECONDS = +res.data.vocal_max_seconds;
        }
        this.settingsLoaded = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.settingsLoaded = true;
        this.cdr.markForCheck();
      }
    });
  }

  private loadOptions() {
    // Charger les quartiers
    this.publicData.getOptions('quartier').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.quartiers = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error("Erreur lors du chargement des quartiers:", err)
    });

    // Charger les urgences
    this.publicData.getOptions('urgence').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.urgences = res.data;
          this.cdr.markForCheck();
        }
      }
    });
  }

  // TrackBy pour les options
  trackByOption(index: number, item: Option): string {
    return item.id;
  }

  // =====================
  //  VOCAL RECORDING
  // =====================

  get recordingTimeFormatted(): string {
    const m = Math.floor(this.recordingTime / 60).toString().padStart(2, '0');
    const s = (this.recordingTime % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  get remainingTime(): number {
    return Math.max(0, this.MAX_RECORDING_SECONDS - this.recordingTime);
  }

  get remainingTimeFormatted(): string {
    const secs = this.remainingTime;
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  get maxTimeFormatted(): string {
    const m = Math.floor(this.MAX_RECORDING_SECONDS / 60).toString().padStart(2, '0');
    const s = (this.MAX_RECORDING_SECONDS % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  get remainingProgress(): number {
    return (this.remainingTime / this.MAX_RECORDING_SECONDS) * 100;
  }

  get timerUrgencyClass(): string {
    if (this.remainingTime <= 10) return 'text-red-600 animate-pulse';
    if (this.remainingTime <= 30) return 'text-orange-500';
    return 'text-green-600';
  }

  get progressBarClass(): string {
    if (this.remainingTime <= 10) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (this.remainingTime <= 30) return 'bg-gradient-to-r from-orange-400 to-orange-500';
    return 'bg-gradient-to-r from-green-400 to-brand-green';
  }

  async startRecording() {
    if (this.recordingState === 'recording' || this.recordingState === 'recording_locked') return;
    this.vocalError = '';
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
          sampleSize: 16
        } as any
      });
      this.recordingTime = 0;
      this.audioBlob = null;
      if (this.audioUrl) { URL.revokeObjectURL(this.audioUrl); this.audioUrl = null; }

      try {
        const { default: RTC } = await import('recordrtc');
        this.recorder = new RTC(this.stream, {
          type: 'audio',
          mimeType: 'audio/webm;codecs=opus' as any,
          audioBitsPerSecond: 128000,
          numberOfAudioChannels: 1,
          desiredSampRate: 48000,
          timeSlice: 1000,
        });
        this.recorder.startRecording();
        this.audioFormat = 'webm';
        this.recordingState = 'recording';
      } catch {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
        this.audioFormat = mimeType.includes('ogg') ? 'ogg' : 'webm';
        const chunks: Blob[] = [];
        const mr = new MediaRecorder(this.stream, { mimeType, audioBitsPerSecond: 128000 });
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mr.onstop = () => {
          this.audioBlob = new Blob(chunks, { type: mimeType });
          if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
          this.audioUrl = URL.createObjectURL(this.audioBlob);
          this.stream?.getTracks().forEach(t => t.stop());
          this.cdr.markForCheck();
        };
        mr.start(250);
        (this.recorder as any) = { _native: mr };
        this.recordingState = 'recording';
      }

      this.recordingTimerRef = setInterval(() => {
        this.recordingTime++;
        if (this.recordingTime >= this.MAX_RECORDING_SECONDS) this.stopRecording();
      }, 1000);

    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        this.vocalError = "Accès au microphone refusé. Autorisez-le dans les paramètres du navigateur.";
      } else if (err.name === 'NotFoundError') {
        this.vocalError = "Aucun microphone détecté. Branchez un micro et réessayez.";
      } else {
        this.vocalError = "Impossible d'accéder au microphone. Vérifiez votre appareil.";
      }
    }
  }

  // === PUSH TO TALK EVENTS ===
  onTouchStart(event: TouchEvent | MouseEvent) {
    if (this.recordingState !== 'idle' && this.recordingState !== 'done') return;
    this.touchStartY = (event as TouchEvent).touches ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY;
    this.startRecording();
  }

  onTouchMove(event: TouchEvent | MouseEvent) {
    if (this.recordingState !== 'recording') return;
    const currentY = (event as TouchEvent).touches ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY;
    
    if (this.touchStartY - currentY > this.LOCK_THRESHOLD) {
      this.recordingState = 'recording_locked';
      this.cdr.markForCheck();
    }
  }

  onTouchEnd(event: TouchEvent | MouseEvent) {
    if (this.recordingState === 'recording') {
      this.stopRecording();
    }
  }

  pauseRecording() {
    if (!this.recorder) return;
    if ((this.recorder as any)._native) {
      (this.recorder as any)._native.pause();
    } else {
      this.recorder.pauseRecording();
    }
    this.recordingState = 'paused';
    clearInterval(this.recordingTimerRef);
  }

  resumeRecording() {
    if (!this.recorder) return;
    if ((this.recorder as any)._native) {
      (this.recorder as any)._native.resume();
    } else {
      this.recorder.resumeRecording();
    }
    this.recordingState = 'recording';
    this.recordingTimerRef = setInterval(() => {
      this.recordingTime++;
      if (this.recordingTime >= this.MAX_RECORDING_SECONDS) this.stopRecording();
    }, 1000);
  }

  stopRecording() {
    clearInterval(this.recordingTimerRef);
    this.vocalDuration = this.recordingTime;
    if (!this.recorder) { this.recordingState = 'done'; this.cdr.markForCheck(); return; }
    if ((this.recorder as any)._native) {
      (this.recorder as any)._native.stop();
      this.recordingState = 'done';
    } else {
      this.recorder.stopRecording(() => {
        this.audioBlob = this.recorder.getBlob();
        if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
        this.audioUrl = URL.createObjectURL(this.audioBlob!);
        this.stream?.getTracks().forEach(t => t.stop());
        this.recordingState = 'done';
        this.cdr.markForCheck();
      });
    }
    this.cdr.markForCheck();
  }

  resetVocal() {
    clearInterval(this.recordingTimerRef);
    if (this.recorder) {
      try {
        if ((this.recorder as any)._native) (this.recorder as any)._native.stop();
        else this.recorder.stopRecording(() => {});
      } catch {}
      this.recorder = null;
    }
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.audioBlob = null;
    if (this.audioUrl) { URL.revokeObjectURL(this.audioUrl); this.audioUrl = null; }
    this.cloudinaryVocalUrl = null;
    this.recordingState = 'idle';
    this.recordingTime = 0;
    this.vocalError = '';
    this.isUploadingVocal = false;
    this.imageBlob = null;
    this.imagePreviewUrl = null;
    this.cloudinaryImageUrl = null;
    this.imageError = '';
    this.cdr.markForCheck();
  }

  // =====================
  //  IMAGE UPLOAD
  // =====================

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

  async onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageError = '';
      if (file.size > 15 * 1024 * 1024) {
        this.imageError = "L'image est trop lourde (max 15MB).";
        this.cdr.markForCheck();
        return;
      }
      try {
        this.imageBlob = await this.compressImage(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviewUrl = e.target.result;
          this.cdr.markForCheck();
        };
        reader.readAsDataURL(this.imageBlob!);
      } catch (err) {
        this.imageError = "Erreur de compression d'image.";
        this.cdr.markForCheck();
      }
    }
  }

  // =====================
  //  FORM SUBMIT
  // =====================

  showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 5000);
  }

  async onSubmit() {
    if (!this.formData.quartier) {
      this.showError("Veuillez sélectionner votre quartier.");
      return;
    }

    if (!this.formData.telephone_citoyen) {
      this.showError("Veuillez renseigner votre numéro de téléphone.");
      return;
    }

    if (this.inputMode === 'vocal' && !this.audioBlob && !this.cloudinaryVocalUrl) {
      this.showError("Veuillez enregistrer un message vocal ou écrire votre problème.");
      return;
    } else if (this.inputMode === 'text' && !this.formData.description) {
      this.showError("Veuillez décrire le problème par écrit.");
      return;
    }

    this.isSubmitting = true;
    this.errorMsg = '';

    try {
      // 1. Upload audio if needed
      if (this.audioBlob && !this.cloudinaryVocalUrl) {
        this.isUploadingVocal = true;
        this.cdr.markForCheck();
        const fd = new FormData();
        fd.append('audio', this.audioBlob, `vocal-${Date.now()}.webm`);
        const res: any = await firstValueFrom(this.http.post(`${environment.apiUrl}/upload-audio`, fd));
        if (res.success) {
          this.cloudinaryVocalUrl = res.url;
        } else {
          throw new Error("Échec de l'envoi du message vocal.");
        }
        this.isUploadingVocal = false;
      }

      // 2. Upload image if needed
      if (this.imageBlob && !this.cloudinaryImageUrl) {
        this.isUploadingImage = true;
        this.cdr.markForCheck();
        const fd = new FormData();
        fd.append('file', this.imageBlob);
        const res: any = await firstValueFrom(this.http.post(`${environment.apiUrl}/upload-public`, fd));
        if (res.success) {
          this.cloudinaryImageUrl = res.url;
        } else {
          throw new Error("Échec de l'envoi de l'image.");
        }
        this.isUploadingImage = false;
      }

      // 3. Submit payload
      this.submitFinalPayload();

    } catch (err: any) {
      this.isUploadingVocal = false;
      this.isUploadingImage = false;
      this.isSubmitting = false;
      
      let friendlyError = "Une erreur est survenue lors de l'envoi des fichiers.";
      if (err.status === 0) {
        friendlyError = "Impossible de joindre le serveur. Veuillez vérifier votre connexion internet.";
      } else if (err.error && err.error.message) {
        friendlyError = err.error.message;
      }
      
      this.showError(friendlyError);
      this.cdr.markForCheck();
    }
  }

  private submitFinalPayload() {
    const contactInfo = this.formData.nom_citoyen
      ? `${this.formData.nom_citoyen} - ${this.formData.telephone_citoyen}`
      : this.formData.telephone_citoyen;

    const payload: any = {
      description: this.formData.description || '(Message vocal joint)',
      quartier: this.formData.quartier,
      contact: contactInfo,
      urgence: this.formData.urgence,
      telephone: this.formData.telephone_citoyen,
      nom: this.formData.nom_citoyen
    };

    if (this.cloudinaryVocalUrl) {
      payload.vocalUrl = this.cloudinaryVocalUrl;
    }

    if (this.cloudinaryImageUrl) {
      payload.photoUrl = this.cloudinaryImageUrl; // or adapt depending on how backend expects it
    }

    this.publicData.postBesoin(payload).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSubmitting = false;
        this.showError("Une erreur est survenue lors de l'envoi de votre signalement. Veuillez réessayer.");
        this.cdr.markForCheck();
      }
    });
  }

  resetForm() {
    this.success = false;
    this.errorMsg = '';
    this.formData = { titre: '', description: '', quartier: '', urgence: 'MOYENNE', nom_citoyen: '', telephone_citoyen: '' };
    this.resetVocal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.resetVocal();
  }
}
