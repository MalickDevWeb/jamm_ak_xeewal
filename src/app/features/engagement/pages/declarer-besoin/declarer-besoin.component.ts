import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PublicDataService } from '../../../../core/services/public-data.service';
import { environment } from '../../../../../environments/environment';

// RecordRTC import dynamique (meilleure compatibilité cross-browser)
declare const RecordRTC: any;

type RecordingState = 'idle' | 'recording' | 'paused' | 'done';

@Component({
  selector: 'app-declarer-besoin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  providers: [PublicDataService],
  templateUrl: './declarer-besoin.component.html',
  styleUrl: './declarer-besoin.component.css'
})
export class DeclarerBesoinComponent implements OnInit, OnDestroy {

  formData = {
    titre: '',
    description: '',
    quartier: '',
    urgence: 'Moyenne',
    localite: '',
    nom_citoyen: '',
    telephone_citoyen: ''
  };

  // === VOCAL ===
  recordingState: RecordingState = 'idle';
  recordingTime: number = 0;
  MAX_RECORDING_SECONDS = 120;
  settingsLoaded = false;
  recordingTimerRef: any = null;
  private recorder: any = null;         // RecordRTC instance
  private stream: MediaStream | null = null;
  audioBlob: Blob | null = null;
  audioUrl: string | null = null;
  cloudinaryVocalUrl: string | null = null;
  isUploadingVocal = false;
  vocalError = '';
  vocalDuration: number = 0;
  audioFormat = 'webm';                // format final détecté

  // === FORM ===
  isSubmitting = false;
  success = false;
  errorMsg = '';

  constructor(private publicData: PublicDataService, private http: HttpClient) {}

  ngOnInit() {
    // Charger la durée max depuis les paramètres admin
    this.http.get<{ success: boolean; data: any }>('/api/v1/settings').subscribe({
      next: (res) => {
        if (res.success && res.data?.vocal_max_seconds) {
          this.MAX_RECORDING_SECONDS = +res.data.vocal_max_seconds;
        }
        this.settingsLoaded = true;
      },
      error: () => {
        this.settingsLoaded = true; // Utiliser la valeur par défaut
      }
    });
  }

  // =====================
  //  VOCAL RECORDING
  // =====================

  get recordingTimeFormatted(): string {
    const m = Math.floor(this.recordingTime / 60).toString().padStart(2, '0');
    const s = (this.recordingTime % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Temps restant (ce que voit l'utilisateur)
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

  // Pourcentage du temps restant (bar se vide)
  get remainingProgress(): number {
    return (this.remainingTime / this.MAX_RECORDING_SECONDS) * 100;
  }

  // Couleur d'alerte selon le temps restant
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
    this.vocalError = '';
    try {
      // Contraintes audio PRO
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
        // RecordRTC : meilleure qualité cross-browser
        const { default: RTC } = await import('recordrtc');
        this.recorder = new RTC(this.stream, {
          type: 'audio',
          mimeType: 'audio/webm;codecs=opus' as any,  // @types/recordrtc incomplet
          audioBitsPerSecond: 128000,
          numberOfAudioChannels: 1,
          desiredSampRate: 48000,
          timeSlice: 1000,
        });
        this.recorder.startRecording();
        this.audioFormat = 'webm';
        this.recordingState = 'recording';
      } catch {
        // Fallback : MediaRecorder natif
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
          // ⚠️ PAS d'upload ici — l'upload se fait au moment du submit
        };
        mr.start(250);
        (this.recorder as any) = { _native: mr };
        this.recordingState = 'recording';
      }

      // Timer
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
    if (!this.recorder) { this.recordingState = 'done'; return; }
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
        // ⚠️ PAS d'upload ici — l'upload se fait au moment du submit
      });
    }
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
  }

  // Upload vers Cloudinary — appelé uniquement au moment du submit
  uploadVocalToCloudinary(): Promise<string | null> {
    if (!this.audioBlob) return Promise.resolve(null);
    this.isUploadingVocal = true;
    this.vocalError = '';

    const fd = new FormData();
    fd.append('audio', this.audioBlob, `vocal-${Date.now()}.${this.audioFormat}`);

    return new Promise((resolve) => {
      this.http.post<{ success: boolean; url: string }>(
        `${environment.apiUrl}/upload-audio`, fd
      ).subscribe({
        next: (res) => {
          this.isUploadingVocal = false;
          if (res.success) {
            this.cloudinaryVocalUrl = res.url;
            resolve(res.url);
          } else {
            this.vocalError = "Échec de l'envoi du message vocal. Réessayez.";
            resolve(null);
          }
        },
        error: () => {
          this.isUploadingVocal = false;
          this.vocalError = "Erreur réseau : impossible d'envoyer le message vocal. Vérifiez votre connexion.";
          resolve(null);
        }
      });
    });
  }

  // =====================
  //  FORM SUBMIT
  // =====================

  showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 5000);
  }

  async onSubmit() {
    // === Validations ===
    if (!this.formData.quartier || !this.formData.telephone_citoyen) {
      this.showError("Veuillez remplir les champs obligatoires (Quartier et Téléphone).");
      return;
    }
    if (!this.formData.description && !this.audioBlob) {
      this.showError("Veuillez décrire le problème par écrit ou en message vocal.");
      return;
    }
    if (this.recordingState === 'recording' || this.recordingState === 'paused') {
      this.showError("Veuillez terminer l'enregistrement avant d'envoyer.");
      return;
    }

    this.isSubmitting = true;
    this.errorMsg = '';

    // === Upload vocal AU MOMENT DU SUBMIT ===
    let vocalUrl: string | null = null;
    if (this.audioBlob && !this.cloudinaryVocalUrl) {
      vocalUrl = await this.uploadVocalToCloudinary();
      if (!vocalUrl) {
        // Erreur d'upload — arrêter la soumission
        this.isSubmitting = false;
        return;
      }
    } else {
      vocalUrl = this.cloudinaryVocalUrl;
    }

    // === Construction du payload ===
    const contactInfo = this.formData.nom_citoyen
      ? `${this.formData.nom_citoyen} - ${this.formData.telephone_citoyen}`
      : this.formData.telephone_citoyen;

    const payload: any = {
      description: this.formData.description || '(Message vocal joint)',
      quartier: this.formData.quartier,
      contact: contactInfo,
      urgence: this.formData.urgence.toUpperCase()
    };

    if (vocalUrl) payload.vocalUrl = vocalUrl;
    if (this.formData.localite) payload.localite = this.formData.localite;

    // === Envoi du signalement ===
    this.publicData.postBesoin(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = true;
      },
      error: () => {
        this.isSubmitting = false;
        this.showError("Une erreur est survenue lors de l'envoi de votre signalement. Veuillez réessayer.");
      }
    });
  }

  resetForm() {
    this.success = false;
    this.errorMsg = '';
    this.formData = { titre: '', description: '', quartier: '', urgence: 'Moyenne', localite: '', nom_citoyen: '', telephone_citoyen: '' };
    this.resetVocal();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.resetVocal();
  }
}
