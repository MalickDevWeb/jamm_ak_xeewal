import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminDataService,
  Option,
} from '../../../../core/services/admin-data.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AlertPopupComponent } from '../../../../shared/components/alert-popup/alert-popup.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-visites',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, AlertPopupComponent],
  template: `
    <div
      class="animate-fade-in-up min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-4xl font-black text-white flex items-center gap-3">
            <i class="fa-solid fa-map-location-dot text-3xl text-[#022c16]"></i>
            Visites
          </h2>
          <p class="text-sm text-gray-400 mt-1">
            {{ total }} visite(s) enregistrée(s)
          </p>
        </div>
        <button
          (click)="openCreateModal()"
          class="px-6 py-3 bg-gradient-to-r from-[#022c16] to-[#034256] text-white rounded-2xl text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
        >
          <i class="fa-solid fa-plus text-lg"></i>
          <span>Nouvelle visite</span>
        </button>
      </div>

      <!-- Loading state -->
      <div *ngIf="isLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <i class="fa-solid fa-circle-notch fa-spin text-5xl text-[#022c16] mb-4"></i>
          <p class="text-gray-400 text-lg">Chargement des visites...</p>
        </div>
      </div>

      <!-- Empty state -->
      <div
        *ngIf="!isLoading && visites.length === 0"
        class="text-center py-20 bg-white/5 border border-white/10 rounded-3xl border-2 border-dashed border-white/20"
      >
        <i class="fa-solid fa-map-location-dot text-7xl text-gray-300 mb-4"></i>
        <p class="text-gray-400 text-xl mb-2">Aucune visite enregistrée</p>
        <button
          (click)="openCreateModal()"
          class="text-[#022c16] font-bold hover:underline text-lg"
        >
          Créer la première visite →
        </button>
      </div>

      <!-- Visites Grid -->
      <div
        *ngIf="!isLoading && visites.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <div
          *ngFor="let v of visites; trackBy: trackById"
          class="group bg-white/5 border border-white/10 rounded-3xl shadow-lg border border-white/10 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
        >
          <!-- Media Section -->
          <div
            class="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
          >
            <img
              *ngIf="v.typeMedia === 'PHOTOS' && getFirstMedia(v)"
              [src]="getFirstMedia(v)"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />

            <div *ngIf="v.typeMedia === 'VIDEOS' && getFirstMedia(v)" class="relative w-full h-full">
              <img
                *ngIf="!v._videoPlaying"
                [src]="getFirstMedia(v) + '?thumbnail=true'"
                class="w-full h-full object-cover"
              />
              <button
                *ngIf="!v._videoPlaying"
                (click)="playVideo(v)"
                class="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all"
              >
                <div class="w-16 h-16 bg-white/5 border border-white/10/90 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                  <i class="fa-solid fa-play text-2xl text-[#022c16] ml-1"></i>
                </div>
              </button>
              <video
                *ngIf="v._videoPlaying"
                [src]="getFirstMedia(v)"
                class="w-full h-full object-cover"
                autoplay
                loop
                muted
                playsinline
              ></video>
            </div>

            <!-- Placeholder when no media -->
            <div
              *ngIf="!getFirstMedia(v)"
              class="w-full h-full flex flex-col items-center justify-center text-gray-400"
            >
              <i class="fa-solid fa-map-location-dot text-6xl mb-2"></i>
              <span class="text-sm">Aucun média</span>
            </div>

            <!-- Media count badge -->
            <div
              *ngIf="v.mediaCount > 1"
              class="absolute top-3 right-3 bg-black/70 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
            >
              <i class="fa-solid fa-images text-xs"></i>
              {{ v.mediaCount }} médias
            </div>

            <!-- Type badge -->
            <div class="absolute top-3 left-3">
              <span
                *ngIf="v.typeMedia === 'VIDEOS'"
                class="bg-red-500/90 backdrop-blur text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5"
              >
                <i class="fa-solid fa-video text-xs"></i> Vidéo
              </span>
              <span
                *ngIf="v.typeMedia === 'PHOTOS'"
                class="bg-green-500/90 backdrop-blur text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5"
              >
                <i class="fa-solid fa-image text-xs"></i> Photo
              </span>
            </div>

            <!-- Hover overlay with actions -->
            <div
              class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100"
            >
              <button
                (click)="openEditModal(v)"
                class="w-12 h-12 bg-white/5 border border-white/10/90 backdrop-blur rounded-xl shadow-xl flex items-center justify-center text-brand-green hover:bg-brand-green/10 hover:scale-110 transition-all"
                title="Modifier"
              >
                <i class="fa-solid fa-pen text-lg"></i>
              </button>
              <button
                (click)="deleteVisite(v.id)"
                class="w-12 h-12 bg-white/5 border border-white/10/90 backdrop-blur rounded-xl shadow-xl flex items-center justify-center text-red-600 hover:bg-red-500/10 hover:scale-110 transition-all"
                title="Supprimer"
              >
                <i class="fa-solid fa-trash text-lg"></i>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 flex-1 flex flex-col">
            <!-- Lieu & Date -->
            <div class="flex items-center gap-2 mb-3">
              <span
                *ngIf="v.lieu"
                class="bg-gradient-to-r from-brand-green/10 to-brand-greenLight/10 text-brand-dark text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5"
              >
                <i class="fa-solid fa-location-dot text-xs"></i>
                {{ v.lieu }}
              </span>
              <span class="text-xs text-gray-400">{{
                v.date | date: 'dd/MM/yyyy'
              }}</span>
            </div>

            <!-- Title -->
            <h3 class="text-xl font-black text-white mb-2 line-clamp-1">
              {{ v.titre }}
            </h3>

            <!-- Description -->
            <p
              class="text-gray-300 text-sm mb-4 line-clamp-2 flex-1"
            >
              {{ v.description || 'Aucune description' }}
            </p>

            <!-- Status badge -->
            <div class="flex items-center justify-between">
              <span
                class="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider"
                [ngClass]="{
                  'bg-brand-green/10 text-brand-green': v.statut === 'PUBLIE',
                  'bg-brand-yellow/10 text-brand-yellow': v.statut === 'BROUILLON'
                }"
              >
                {{ v.statut === 'PUBLIE' ? 'Publié' : 'Brouillon' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <div
        *ngIf="showModal"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeModal()"></div>
        <div class="relative bg-white/5 border border-white/10 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-8">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-black text-white">
                {{ isCreating ? 'Nouvelle visite' : 'Modifier la visite' }}
              </h3>
              <button
                (click)="closeModal()"
                class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white/20 transition-all"
              >
                <i class="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-black text-gray-200 mb-2 flex items-center gap-2">
                  <i class="fa-solid fa-heading text-[#022c16]"></i>
                  Titre *
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.titre"
                  class="w-full px-4 py-3 border-2 border-white/20 rounded-2xl text-base focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all outline-none"
                  placeholder="Titre de la visite"
                />
              </div>

              <div>
                <label class="block text-sm font-black text-gray-200 mb-2 flex items-center gap-2">
                  <i class="fa-solid fa-align-left text-[#022c16]"></i>
                  Description
                </label>
                <textarea
                  [(ngModel)]="formData.description"
                  rows="3"
                  class="w-full px-4 py-3 border-2 border-white/20 rounded-2xl text-base focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all outline-none resize-none"
                  placeholder="Description de la visite..."
                ></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-black text-gray-200 mb-2 flex items-center gap-2">
                    <i class="fa-solid fa-location-dot text-[#022c16]"></i>
                    Lieu
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="formData.lieu"
                    class="w-full px-4 py-3 border-2 border-white/20 rounded-2xl text-base focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all outline-none"
                    placeholder="Quartier visité"
                  />
                </div>
                <div>
                  <label class="block text-sm font-black text-gray-200 mb-2 flex items-center gap-2">
                    <i class="fa-solid fa-calendar text-[#022c16]"></i>
                    Date
                  </label>
                  <input
                    type="date"
                    [(ngModel)]="formData.date"
                    class="w-full px-4 py-3 border-2 border-white/20 rounded-2xl text-base focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all outline-none bg-white/5 border border-white/10"
                  />
                </div>
              </div>

              <!-- Media Upload -->
              <div>
                <label class="block text-sm font-black text-gray-200 mb-2 flex items-center gap-2">
                  <i class="fa-solid fa-photo-film text-[#022c16]"></i>
                  Médias (Photos ou Vidéos)
                </label>

                <label
                  class="flex flex-col items-center justify-center w-full h-32 border-3 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-[#022c16] transition-all"
                >
                  <div
                    class="flex flex-col items-center justify-center pt-5 pb-6"
                  >
                    <i
                      class="fa-solid fa-cloud-arrow-up text-3xl text-gray-400 mb-3"
                    ></i>
                    <p class="text-sm font-bold text-gray-300">
                      Cliquez pour ajouter des médias
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                      JPG, PNG, MP4 — max 15MB chacun
                    </p>
                  </div>
                  <input
                    type="file"
                    #mediaInput
                    (change)="onMediaSelected($event)"
                    accept="image/*,video/*"
                    multiple
                    class="hidden"
                  />
                </label>

                <!-- New Media Preview Grid -->
                <div
                  *ngIf="mediaFiles.length > 0"
                  class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4"
                >
                  <div
                    *ngFor="let media of mediaFiles; let i = index"
                    class="relative group rounded-xl overflow-hidden border-2 border-white/20 bg-black h-24"
                  >
                    <img
                      *ngIf="media.type === 'PHOTOS'"
                      [src]="media.previewUrl"
                      class="w-full h-full object-cover"
                    />
                    <video
                      *ngIf="media.type === 'VIDEOS'"
                      [src]="media.previewUrl"
                      class="w-full h-full object-cover"
                      muted
                    ></video>
                    <div
                      class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <button
                        (click)="removeMedia(i)"
                        class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white hover:bg-red-600"
                      >
                        <i class="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                    <div
                      class="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase"
                    >
                      {{ media.type === 'VIDEOS' ? 'VIDÉO' : 'PHOTO' }}
                    </div>
                  </div>
                </div>

                <!-- Existing media (edit mode) -->
                <div
                  *ngIf="!isCreating && existingMediaUrls.length > 0"
                  class="mt-4"
                >
                  <p class="text-xs font-bold text-gray-400 mb-2">Médias existants :</p>
                  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    <div
                      *ngFor="let url of existingMediaUrls; let i = index"
                      class="relative group rounded-xl overflow-hidden border-2 border-white/20 bg-black h-24"
                    >
                      <img
                        *ngIf="!url.match(/\.(mp4|webm|mov)/i)"
                        [src]="url"
                        class="w-full h-full object-cover"
                      />
                      <video
                        *ngIf="url.match(/\.(mp4|webm|mov)/i)"
                        [src]="url"
                        class="w-full h-full object-cover"
                        muted
                      ></video>
                      <div
                        class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <button
                          (click)="removeExistingMedia(i)"
                          class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white hover:bg-red-600"
                        >
                          <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div *ngIf="mediaError" class="text-red-500 text-sm font-medium">
                {{ mediaError }}
              </div>
            </div>

            <div class="flex gap-3 mt-8">
              <button
                (click)="closeModal()"
                class="flex-1 px-6 py-3 bg-white/10 text-gray-200 rounded-xl text-sm font-bold hover:bg-white/20 transition-all"
                [disabled]="isSubmitting"
              >
                Annuler
              </button>
              <button
                (click)="submitForm()"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-[#022c16] to-[#034256] text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                [disabled]="isSubmitting || isUploadingFiles"
              >
                <i
                  *ngIf="isSubmitting || isUploadingFiles"
                  class="fa-solid fa-circle-notch fa-spin"
                ></i>
                <span>{{ isCreating ? 'Créer' : 'Enregistrer' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirm Dialog -->
      <app-confirm-dialog
        [visible]="showConfirmDialog"
        [title]="confirmTitle"
        message="Cette action est irréversible."
        (confirm)="confirmDelete()"
        (cancel)="showConfirmDialog = false"
      ></app-confirm-dialog>

      <!-- Alert Popup -->
      <app-alert-popup
        [visible]="showAlert"
        [type]="alertType"
        [title]="alertTitle"
        [message]="alertMessage"
        (close)="showAlert = false"
      ></app-alert-popup>
    </div>
  `,
  styles: [`
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    :host {
      display: block;
    }
  `],
})
export class AdminVisitesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  visites: any[] = [];
  total = 0;
  isLoading = true;

  showModal = false;
  showConfirmDialog = false;
  showAlert = false;
  alertType: 'success' | 'error' | 'warning' | 'info' = 'success';
  alertTitle = '';
  alertMessage = '';
  itemToDelete: string | null = null;
  confirmTitle = 'Confirmer la suppression';
  currentVisiteId: string | null = null;
  isCreating = true;
  isUploadingFiles = false;
  isSubmitting = false;

  @ViewChild('mediaInput') mediaInput!: ElementRef;

  formData = {
    titre: '',
    description: '',
    lieu: '',
    date: '',
    typeMedia: 'PHOTOS',
  };

  mediaFiles: {
    blob: File | Blob;
    previewUrl: string;
    type: string;
    name: string;
  }[] = [];
  existingMediaUrls: string[] = [];
  mediaError = '';

  constructor(
    private adminData: AdminDataService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadVisites();
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  loadVisites() {
    this.isLoading = true;
    this.adminData
      .getVisites()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.visites = res.data || [];
          this.total = res.total || 0;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.mediaError = err?.message || 'Erreur de chargement';
          this.cdr.markForCheck();
        },
      });
  }

  refreshData() {
    this.loadVisites();
  }

  getFirstMedia(v: any): string | null {
    if (!v.mediaUrl) return null;
    return v.mediaUrl.split(',')[0].trim();
  }

  playVideo(v: any) {
    v._videoPlaying = true;
    this.cdr.markForCheck();
  }

  openCreateModal() {
    this.isCreating = true;
    this.formData = {
      titre: '',
      description: '',
      lieu: '',
      date: new Date().toISOString().split('T')[0],
      typeMedia: 'PHOTOS',
    };
    this.mediaFiles = [];
    this.existingMediaUrls = [];
    this.mediaError = '';
    this.showModal = true;
  }

  openEditModal(v: any) {
    this.isCreating = false;
    this.currentVisiteId = v.id;
    this.formData = {
      titre: v.titre || '',
      description: v.description || '',
      lieu: v.lieu || '',
      date: v.date
        ? new Date(v.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      typeMedia: v.typeMedia || 'PHOTOS',
    };

    this.existingMediaUrls = v.mediaUrl
      ? v.mediaUrl.split(',').filter((u: string) => u.trim())
      : [];
    this.mediaFiles = [];
    this.mediaError = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.mediaError = '';
  }

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
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File(
                  [blob],
                  file.name.replace(/\.[^/.]+$/, '') + '.jpg',
                  { type: 'image/jpeg' },
                );
                resolve(compressedFile);
              } else reject(new Error('Compression failed'));
            },
            'image/jpeg',
            0.7,
          );
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  async onMediaSelected(event: any) {
    this.mediaError = '';
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const processPromises = Array.from(files).map(async (file: any) => {
      if (file.size > 15 * 1024 * 1024) {
        this.mediaError = `Le fichier ${file.name} est trop lourd (max 15MB).`;
        this.cdr.markForCheck();
        return;
      }

      const mediaType = file.type.startsWith('video') ? 'VIDEOS' : 'PHOTOS';
      let blob: File | Blob = file;

      try {
        if (mediaType === 'PHOTOS') {
          blob = await this.compressImage(file);
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.mediaFiles.push({
            blob,
            previewUrl: e.target.result,
            type: mediaType,
            name: file.name,
          });
          this.cdr.markForCheck();
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        this.mediaError = `Erreur lors du traitement de ${file.name}.`;
        this.cdr.markForCheck();
      }
    });

    await Promise.all(processPromises);
  }

  removeMedia(index: number) {
    this.mediaFiles.splice(index, 1);
  }

  removeExistingMedia(index: number) {
    this.existingMediaUrls.splice(index, 1);
  }

  async submitForm() {
    if (!this.formData.titre) {
      this.mediaError = 'Veuillez saisir un titre.';
      return;
    }

    this.isSubmitting = true;
    this.isUploadingFiles = true;
    this.mediaError = '';
    this.cdr.markForCheck();

    try {
      // Build FormData with all fields + files
      const fd = new FormData();
      fd.append('titre', this.formData.titre);
      fd.append('description', this.formData.description || '');
      fd.append('lieu', this.formData.lieu || '');
      fd.append('date', this.formData.date || new Date().toISOString());
      fd.append('typeMedia', this.formData.typeMedia);
      fd.append('statut', 'PUBLIE');
      
      // Append all media files
      this.mediaFiles.forEach((media) => {
        fd.append('files', media.blob, media.name);
      });
      
      // Also append existing media URLs as a JSON string if in edit mode
      if (!this.isCreating && this.existingMediaUrls.length > 0) {
        fd.append('existingMediaUrls', JSON.stringify(this.existingMediaUrls));
      }

      // Use the combined endpoint
      const endpoint = this.isCreating 
        ? `${environment.apiUrl}/visites/with-media`
        : `${environment.apiUrl}/visites/${this.currentVisiteId}/with-media`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        body: fd,
      });
      
      const result = await res.json();
      
      if (result.success) {
        this.isSubmitting = false;
        this.isUploadingFiles = false;
        this.showModal = false;
        this.adminData.invalidate('visites');
        this.refreshData();
        this.showAlertPopup('success', 'Succès', 'Visite enregistrée avec succès');
      } else {
        throw new Error(result.message || 'Erreur lors de la sauvegarde');
      }
    } catch (err: any) {
      this.isSubmitting = false;
      this.isUploadingFiles = false;
      this.mediaError = err.message || 'Erreur réseau.';
      this.cdr.markForCheck();
    }
  }

  deleteVisite(id: string) {
    this.itemToDelete = id;
    this.confirmTitle = 'Supprimer cette visite ?';
    this.showConfirmDialog = true;
  }

  deleteItem = (id: string) => {
    this.adminData
      .deleteEntity('visites', id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.refreshData();
          this.showAlertPopup('success', 'Succès', 'Visite supprimée avec succès');
        },
        error: () => {
          this.mediaError = 'Erreur lors de la suppression.';
          this.cdr.markForCheck();
        },
      });
  };

  confirmDelete() {
    if (this.itemToDelete) {
      this.deleteItem(this.itemToDelete);
      this.itemToDelete = null;
      this.showConfirmDialog = false;
    }
  }

  showAlertPopup(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) {
    this.alertType = type;
    this.alertTitle = title;
    this.alertMessage = message;
    this.showAlert = true;
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
