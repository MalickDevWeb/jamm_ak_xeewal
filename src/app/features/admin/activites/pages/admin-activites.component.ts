import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
  DestroyRef,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminDataService,
  Option,
} from '../../../../core/services/admin-data.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-activites',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div
      class="animate-fade-in-up min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-4xl font-black text-gray-900 flex items-center gap-3">
            <i class="fa-solid fa-images text-3xl text-[#022c16]"></i>
            Activités
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            {{ total() }} activité(s) enregistrée(s)
          </p>
        </div>
        <button
          (click)="openCreateModal()"
          class="px-6 py-3 bg-gradient-to-r from-[#022c16] to-[#034256] text-white rounded-2xl text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
        >
          <i class="fa-solid fa-plus text-lg"></i>
          <span>Nouvelle activité</span>
        </button>
      </div>

      <!-- Loading state -->
      <div *ngIf="isLoading()" class="flex items-center justify-center py-20">
        <div class="text-center">
          <i
            class="fa-solid fa-circle-notch fa-spin text-5xl text-[#022c16] mb-4"
          ></i>
          <p class="text-gray-500 text-lg">Chargement des activités...</p>
        </div>
      </div>

      <!-- Empty state -->
      <div
        *ngIf="!isLoading() && activites().length === 0"
        class="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200"
      >
        <i class="fa-solid fa-photo-film text-7xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-xl mb-2">Aucune activité enregistrée</p>
        <button
          (click)="openCreateModal()"
          class="text-[#022c16] font-bold hover:underline text-lg"
        >
          Créer la première activité →
        </button>
      </div>

      <!-- Activities Grid -->
      <div
        *ngIf="!isLoading() && activites().length > 0"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <div
          *ngFor="let a of activites(); trackBy: trackById"
          class="group bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
        >
          <!-- Media Section -->
          <div
            class="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
          >
            <!-- Main media display -->
            <img
              *ngIf="a.typeMedia === 'PHOTOS' && getFirstMedia(a)"
              [src]="getFirstMedia(a)"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />

            <div *ngIf="a.typeMedia === 'VIDEOS' && getFirstMedia(a)" class="relative w-full h-full">
              <img
                *ngIf="!a._videoPlaying"
                [src]="getFirstMedia(a) + '?thumbnail=true'"
                class="w-full h-full object-cover"
              />
              <button
                *ngIf="!a._videoPlaying"
                (click)="playVideo(a)"
                class="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all"
              >
                <div class="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                  <i class="fa-solid fa-play text-2xl text-[#022c16] ml-1"></i>
                </div>
              </button>
              <video
                *ngIf="a._videoPlaying"
                [src]="getFirstMedia(a)"
                class="w-full h-full object-cover"
                autoplay
                loop
                muted
                playsinline
              ></video>
            </div>

            <!-- Placeholder when no media -->
            <div
              *ngIf="!getFirstMedia(a)"
              class="w-full h-full flex flex-col items-center justify-center text-gray-400"
            >
              <i class="fa-solid fa-image text-6xl mb-2"></i>
              <span class="text-sm">Aucun média</span>
            </div>

            <!-- Media count badge -->
            <div
              *ngIf="a.mediaCount > 1"
              class="absolute top-3 right-3 bg-black/70 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
            >
              <i class="fa-solid fa-images text-xs"></i>
              {{ a.mediaCount }} médias
            </div>

            <!-- Type badge -->
            <div class="absolute top-3 left-3">
              <span
                *ngIf="a.typeMedia === 'VIDEOS'"
                class="bg-red-500/90 backdrop-blur text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5"
              >
                <i class="fa-solid fa-video text-xs"></i> Vidéo
              </span>
              <span
                *ngIf="a.typeMedia === 'PHOTOS'"
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
                (click)="openEditModal(a)"
                class="w-12 h-12 bg-white/90 backdrop-blur rounded-xl shadow-xl flex items-center justify-center text-brand-green hover:bg-brand-green/10 hover:scale-110 transition-all"
                title="Modifier"
              >
                <i class="fa-solid fa-pen text-lg"></i>
              </button>
              <button
                (click)="deleteActivite(a.id)"
                class="w-12 h-12 bg-white/90 backdrop-blur rounded-xl shadow-xl flex items-center justify-center text-red-600 hover:bg-red-100 hover:scale-110 transition-all"
                title="Supprimer"
              >
                <i class="fa-solid fa-trash text-lg"></i>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 flex-1 flex flex-col">
            <!-- Category & Date -->
            <div class="flex items-center gap-2 mb-3">
              <span
                class="bg-gradient-to-r from-brand-yellow/10 to-brand-yellowDark/10 text-brand-yellowDark text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider"
              >
                {{ a.categorie }}
              </span>
              <span class="text-xs text-gray-400">{{
                a.date | date: 'dd/MM/yyyy'
              }}</span>
            </div>

            <!-- Title -->
            <h3 class="text-xl font-black text-gray-900 mb-2 line-clamp-1">
              {{ a.titre }}
            </h3>

            <!-- Description -->
            <p
              *ngIf="a.description"
              class="text-sm text-gray-600 line-clamp-3 mb-4 flex-1"
            >
              {{ a.description }}
            </p>

            <!-- Status & Actions -->
            <div
              class="flex items-center justify-between pt-4 border-t border-gray-100"
            >
              <span
                class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold"
                [ngClass]="
                  a.statut === 'PUBLIE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                "
              >
                <i
                  class="fa-solid mr-1.5"
                  [ngClass]="
                    a.statut === 'PUBLIE' ? 'fa-check-circle' : 'fa-clock'
                  "
                ></i>
                {{ a.statut }}
              </span>
              <button
                (click)="openEditModal(a)"
                class="text-[#022c16] hover:text-[#034256] text-sm font-bold flex items-center gap-1.5 transition-colors"
              >
                <i class="fa-solid fa-pen text-xs"></i>
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal: Créer / Modifier -->
      <div
        *ngIf="showModal()"
        class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      >
        <div
          class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in-up my-4"
        >
          <!-- Modal Header -->
          <div
            class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-3xl"
          >
            <div class="flex items-center justify-between">
              <h3
                class="font-black text-2xl text-gray-900 flex items-center gap-3"
              >
                <i
                  class="fa-solid"
                  [class.fa-plus-circle]="isCreating()"
                  [class.fa-edit]="!isCreating()"
                  class="text-[#022c16]"
                ></i>
                {{ isCreating() ? 'Nouvelle activité' : "Modifier l'activité" }}
              </h3>
              <button
                (click)="closeModal()"
                class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-all"
              >
                <i class="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4">
            <!-- Title -->
            <div>
              <label
                class="block text-sm font-black text-gray-700 mb-2 flex items-center gap-2"
              >
                <i class="fa-solid fa-heading text-[#022c16]"></i>
                Titre <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="formData.titre"
                placeholder="Entrez le titre de l'activité..."
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-base text-gray-900 font-medium focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none"
              />
            </div>

            <!-- Description -->
            <div>
              <label
                class="block text-sm font-black text-gray-700 mb-2 flex items-center gap-2"
              >
                <i class="fa-solid fa-align-left text-[#022c16]"></i>
                Description
              </label>
              <textarea
                [(ngModel)]="formData.description"
                rows="4"
                placeholder="Décrivez l'activité en détail..."
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-base text-gray-700 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none resize-none"
              ></textarea>
            </div>

            <!-- Category & Date -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  class="block text-sm font-black text-gray-700 mb-2 flex items-center gap-2"
                >
                  <i class="fa-solid fa-tag text-[#022c16]"></i>
                  Catégorie
                </label>
                <select
                  [(ngModel)]="formData.categorie"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-base focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none bg-white"
                >
                  <option
                    *ngFor="let c of categories(); trackBy: trackByOption"
                    [value]="c.value"
                  >
                    {{ c.label }}
                  </option>
                </select>
              </div>
              <div>
                <label
                  class="block text-sm font-black text-gray-700 mb-2 flex items-center gap-2"
                >
                  <i class="fa-solid fa-calendar text-[#022c16]"></i>
                  Date
                </label>
                <input
                  type="date"
                  [(ngModel)]="formData.date"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-base focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none"
                />
              </div>
            </div>

            <!-- Media Upload -->
            <div>
              <label
                class="block text-sm font-black text-gray-700 mb-2 flex items-center gap-2"
              >
                <i class="fa-solid fa-photo-film text-[#022c16]"></i>
                Médias (Photos ou Vidéos)
              </label>

              <label
                class="flex flex-col items-center justify-center w-full h-24 border-3 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#022c16] transition-all"
              >
                <div
                  class="flex flex-col items-center justify-center py-4"
                >
                  <i
                    class="fa-solid fa-cloud-arrow-up text-3xl text-gray-400 mb-3"
                  ></i>
                  <p class="text-sm font-bold text-gray-600">
                    Cliquez pour ajouter des médias
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    JPG, PNG, MP4 — max 50MB chacun
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
                *ngIf="mediaFiles().length > 0"
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4"
              >
                <div
                  *ngFor="let media of mediaFiles(); let i = index"
                  class="relative group rounded-xl overflow-hidden border-2 border-gray-200 bg-black h-24"
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
                *ngIf="!isCreating() && existingMediaUrls().length > 0"
                class="mt-4"
              >
                <p
                  class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2"
                >
                  Médias existants
                </p>
                <div
                  class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                >
                  <div
                    *ngFor="let url of existingMediaUrls(); let i = index"
                    class="relative group rounded-xl overflow-hidden border-2 border-gray-200 bg-black h-24"
                  >
                    <img
                      *ngIf="!url.match('\\.(mp4|webm|mov|avi)($|\\?)')"
                      [src]="url"
                      class="w-full h-full object-cover"
                    />
                    <video
                      *ngIf="url.match('\\.(mp4|webm|mov|avi)($|\\?)') || url.includes('/video/upload')"
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

              <p
                *ngIf="mediaError()"
                class="text-red-500 text-sm font-bold mt-2 flex items-center gap-2"
              >
                <i class="fa-solid fa-circle-exclamation"></i> {{ mediaError() }}
              </p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div
            class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-3xl"
          >
            <button
              (click)="closeModal()"
              class="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              Annuler
            </button>
            <button
              (click)="submitForm()"
              [disabled]="isSubmitting() || !formData.titre"
              class="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#022c16] to-[#034256] rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-70"
            >
              <span *ngIf="!isSubmitting()">
                <i
                  class="fa-solid"
                  [class.fa-plus]="isCreating()"
                  [class.fa-save]="!isCreating()"
                ></i>
                {{ isCreating() ? 'Créer' : 'Enregistrer' }}
              </span>
              <span *ngIf="isSubmitting()">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                Enregistrement...
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Confirmation Dialog -->
      <app-confirm-dialog
        [visible]="showConfirmDialog()"
        [title]="confirmTitle()"
        message="Cette action est irréversible."
        (confirm)="confirmDelete()"
        (cancel)="showConfirmDialog.set(false)"
      >
      </app-confirm-dialog>
    </div>
  `,
  styles: [
    `
      .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .animate-fade-in-up {
        animation: fadeInUp 0.5s ease-out;
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class AdminactivitesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  activites = signal<any[]>([]);
  total = computed(() => this.activites().length);
  isLoading = signal(true);

  categories = signal<Option[]>([]);
  showModal = signal(false);
  showConfirmDialog = signal(false);
  itemToDelete = signal<string | null>(null);
  confirmTitle = signal('Confirmer la suppression');
  currentActiviteId = signal<string | null>(null);
  isCreating = signal(true);
  isUploadingFiles = signal(false);
  isSubmitting = signal(false);

  mediaFiles = signal<
    { blob: File | Blob; previewUrl: string; type: string; name: string }[]
  >([]);
  existingMediaUrls = signal<string[]>([]);
  mediaError = signal('');

  formData = {
    titre: '',
    description: '',
    categorie: '',
    date: '',
    typeMedia: 'PHOTOS' as 'PHOTOS' | 'VIDEOS',
  };

  constructor(private adminData: AdminDataService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadActivites();
  }

  private loadCategories() {
    this.adminData
      .getOptions('categorie_activite')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.categories.set(res.data);
          }
        },
      });
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  trackByOption(index: number, item: Option): string {
    return item.id;
  }

  loadActivites() {
    this.isLoading.set(true);
    this.adminData
      .getActivites()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.activites.set(res.data || []);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.mediaError.set('Erreur de chargement');
        },
      });
  }

  getFirstMedia(a: any): string | null {
    if (!a.mediaUrl) return null;
    return a.mediaUrl.split(',')[0].trim();
  }

  playVideo(a: any) {
    a._videoPlaying = true;
  }

  openCreateModal() {
    this.isCreating.set(true);
    this.formData = {
      titre: '',
      description: '',
      categorie: this.categories()[0]?.value || '',
      date: new Date().toISOString().split('T')[0],
      typeMedia: 'PHOTOS',
    };
    this.mediaFiles.set([]);
    this.existingMediaUrls.set([]);
    this.mediaError.set('');
    this.showModal.set(true);
  }

  openEditModal(a: any) {
    this.isCreating.set(false);
    this.currentActiviteId.set(a.id);
    this.formData = {
      titre: a.titre || '',
      description: a.description || '',
      categorie: a.categorie || this.categories()[0]?.value || '',
      date: a.date
        ? new Date(a.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      typeMedia: a.typeMedia || 'PHOTOS',
    };

    this.existingMediaUrls.set(
      a.mediaUrl ? a.mediaUrl.split(',').filter((u: string) => u.trim()) : []
    );
    this.mediaFiles.set([]);
    this.mediaError.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.mediaError.set('');
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
    this.mediaError.set('');
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const processPromises = Array.from(files).map(async (file: any) => {
      if (file.size > 50 * 1024 * 1024) {
        this.mediaError.set(`Le fichier ${file.name} est trop lourd (max 50MB).`);
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
          this.mediaFiles.update((list) => [
            ...list,
            { blob, previewUrl: e.target.result, type: mediaType, name: file.name },
          ]);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        this.mediaError.set(`Erreur lors du traitement de ${file.name}.`);
      }
    });

    await Promise.all(processPromises);
  }

  removeMedia(index: number) {
    this.mediaFiles.update((list) => list.filter((_, i) => i !== index));
  }

  removeExistingMedia(index: number) {
    this.existingMediaUrls.update((list) => list.filter((_, i) => i !== index));
  }

  async submitForm() {
    if (!this.formData.titre) {
      this.mediaError.set('Veuillez saisir un titre.');
      return;
    }

    this.isSubmitting.set(true);
    this.mediaError.set('');

    try {
      const currentExisting = [...this.existingMediaUrls()];
      const currentNew = [...this.mediaFiles()];
      let allMediaUrls: string[] = [...currentExisting];

      if (currentNew.length > 0) {
        this.isUploadingFiles.set(true);

        const uploadPromises = currentNew.map(async (media) => {
          const fd = new FormData();
          fd.append('file', media.blob);
          const res = await fetch(`${environment.apiUrl}/upload-public`, {
            method: 'POST',
            body: fd,
          });
          const result = await res.json();
          if (result.success) return result.url;
          else throw new Error(`Erreur upload ${media.name}`);
        });

        const newUrls = await Promise.all(uploadPromises);
        allMediaUrls = [...allMediaUrls, ...newUrls];
        this.isUploadingFiles.set(false);
      }

      const totalMedia = allMediaUrls.length;
      const data: any = {
        titre: this.formData.titre,
        description: this.formData.description,
        categorie: this.formData.categorie,
        date: this.formData.date
          ? new Date(this.formData.date).toISOString()
          : new Date().toISOString(),
        mediaCount: totalMedia,
        statut: 'PUBLIE',
      };

      if (totalMedia > 0) {
        data.mediaUrl = allMediaUrls.join(',');
        const hasVideo = allMediaUrls.some((url) =>
          url.match('\\.(mp4|webm|mov|avi)($|\\?)') || url.includes('/video/upload')
        );
        data.typeMedia = hasVideo ? 'VIDEOS' : 'PHOTOS';
      }

      if (this.isCreating()) {
        this.adminData.createEntity('activites', data).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (res: any) => {
            this.isSubmitting.set(false);
            this.showModal.set(false);
            this.mediaFiles.set([]);
            this.existingMediaUrls.set([]);
            this.activites.update((list) => [res.data, ...list]);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.mediaError.set('Erreur lors de la création.');
          },
        });
      } else {
        this.adminData
          .updateEntity('activites', this.currentActiviteId()!, data)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (res: any) => {
              this.isSubmitting.set(false);
              this.showModal.set(false);
              this.mediaFiles.set([]);
              this.existingMediaUrls.set([]);
              this.activites.update((list) =>
                list.map((item) => (item.id === res.data.id ? res.data : item)),
              );
            },
            error: () => {
              this.isSubmitting.set(false);
              this.mediaError.set('Erreur lors de la modification.');
            },
          });
      }
    } catch (err: any) {
      this.isSubmitting.set(false);
      this.isUploadingFiles.set(false);
      this.mediaError.set(err.message || 'Erreur réseau.');
    }
  }

  deleteActivite(id: string) {
    this.itemToDelete.set(id);
    this.confirmTitle.set('Supprimer cette activité ?');
    this.showConfirmDialog.set(true);
  }

  deleteItem = (id: string) => {
    const previous = this.activites();

    this.activites.update((list) => list.filter((a) => a.id !== id));

    this.adminData
      .deleteEntity('activites', id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {},
        error: () => {
          this.activites.set(previous);
          this.mediaError.set('Erreur lors de la suppression.');
        },
      });
  };

  confirmDelete() {
    const id = this.itemToDelete();
    if (id) {
      this.deleteItem(id);
      this.itemToDelete.set(null);
      this.showConfirmDialog.set(false);
    }
  }

}
