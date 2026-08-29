import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Option } from '../../../../core/services/admin-data.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-activites',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="animate-fade-in-up">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Activités</h2>
        <p class="text-sm text-gray-500 mt-1">{{ total }} activités enregistrées.</p>
      </div>
      <button (click)="action('Créer une activité')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#022c16]/80 transition-all flex items-center gap-2">
        <i class="fa-solid fa-plus"></i> Créer une activité
      </button>
    </div>

    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-500 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="space-y-6">
      <div *ngFor="let a of activites; trackBy: trackById" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="bg-blue-100 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{{ a.categorie }}</span>
              <span class="text-xs text-gray-400">{{ a.date | date:'dd/MM/yyyy' }}</span>
              <span *ngIf="a.typeMedia === 'VIDEOS'" class="text-xs font-bold text-red-500"><i class="fa-solid fa-video"></i> Vidéo</span>
              <span *ngIf="a.typeMedia === 'PHOTOS'" class="text-xs font-bold text-green-500"><i class="fa-solid fa-image"></i> Photo</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900">{{ a.titre }}</h3>
            <p *ngIf="a.description" class="text-sm text-gray-600 mt-2 line-clamp-2">{{ a.description }}</p>
          </div>
          <div class="flex gap-2">
            <button (click)="action('Supprimer', a.id)" class="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up my-8">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-black text-gray-900 text-lg">Nouvelle activité</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div class="p-6 max-h-[75vh] overflow-y-auto">
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Titre <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.titre" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Description <span class="text-gray-400 font-normal">(Optionnel)</span></label>
            <textarea [(ngModel)]="formData.description" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none resize-none"></textarea>
          </div>

          <!-- Section Media Upload -->
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Média (Photos ou Vidéos)</label>
            
            <input type="file" id="mediaUpload" class="hidden" accept="image/*,video/*" multiple (change)="onMediaSelected($event)">
            
            <div (click)="triggerUpload()" class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 hover:border-[#022c16] transition-colors mb-3">
              <i class="fa-solid fa-cloud-arrow-up text-3xl text-gray-400 mb-2"></i>
              <p class="text-sm font-bold text-gray-600">Cliquez pour ajouter des médias</p>
              <p class="text-xs text-gray-400 mt-1">Vous pouvez sélectionner plusieurs fichiers (max 15MB chacun)</p>
            </div>

            <!-- Previews Grid -->
            <div *ngIf="mediaFiles.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div *ngFor="let media of mediaFiles; let i = index" class="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-black h-24 group">
                <img *ngIf="media.type === 'PHOTOS'" [src]="media.previewUrl" class="w-full h-full object-cover">
                <video *ngIf="media.type === 'VIDEOS'" [src]="media.previewUrl" class="w-full h-full object-cover" muted></video>
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <button (click)="removeMedia(i)" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-md">
                  <i class="fa-solid fa-xmark text-[10px]"></i>
                </button>
                <div class="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">{{ media.type === 'VIDEOS' ? 'VIDÉO' : 'PHOTO' }}</div>
              </div>
            </div>
            
            <p *ngIf="mediaError" class="text-red-500 text-xs font-bold mt-2"><i class="fa-solid fa-circle-exclamation"></i> {{ mediaError }}</p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
            <select [(ngModel)]="formData.categorie" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
              <option *ngFor="let c of categories; trackBy: trackByOption" [value]="c.value">{{ c.label }}</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Date</label>
            <input type="date" [(ngModel)]="formData.date" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button (click)="showModal = false" [disabled]="isSubmitting" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50">Annuler</button>
            <button (click)="submitForm()" [disabled]="isSubmitting" class="px-5 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#022c16]/90 rounded-xl transition-colors shadow-lg shadow-[#022c16]/30 flex items-center gap-2 disabled:opacity-70">
              <span *ngIf="!isSubmitting">Publier l'activité</span>
              <span *ngIf="isSubmitting && !isUploadingFiles"><i class="fa-solid fa-circle-notch fa-spin"></i> Publication...</span>
              <span *ngIf="isUploadingFiles"><i class="fa-solid fa-cloud-arrow-up animate-bounce"></i> Upload média...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AdminactivitesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  activites: any[] = [];
  total = 0;
  isLoading = true;

  // Options dynamiques depuis la base de données
  categories: Option[] = [];

  showModal = false;
  isUploadingFiles = false;
  isSubmitting = false;

  formData = {
    titre: '',
    description: '',
    categorie: '',
    date: ''
  };

  mediaFiles: { blob: File | Blob, previewUrl: string, type: string, name: string }[] = [];
  mediaError: string = '';

  constructor(
    private adminData: AdminDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOptions();
    this.loadActivites();
  }

  private loadOptions() {
    this.adminData.getOptions('categorie_activite').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.categories = res.data;
          if (this.categories.length > 0 && !this.formData.categorie) {
            this.formData.categorie = this.categories[0].value;
          }
          this.cdr.markForCheck();
        }
      }
    });
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  trackByOption(index: number, item: Option): string {
    return item.id;
  }

  loadActivites() {
    this.isLoading = true;
    this.adminData.getActivites().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        this.activites = res.data;
        this.total = res.total;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  action(type: string, id?: string) {
    if (type === 'Créer une activité') {
      this.formData = { titre: '', description: '', categorie: this.categories[0]?.value || '', date: '' };
      this.mediaFiles = [];
      this.mediaError = '';
      this.showModal = true;
    } else if (type === 'Supprimer' && id) {
      if (confirm('Supprimer cette activité ?')) {
        this.adminData.deleteEntity('activites', id).pipe(
          takeUntil(this.destroy$)
        ).subscribe(() => this.loadActivites());
      }
    }
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

  async onMediaSelected(event: any) {
    this.mediaError = '';
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 15 * 1024 * 1024) {
        this.mediaError = `Le fichier ${file.name} est trop lourd (max 15MB).`;
        continue;
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
            name: file.name
          });
          this.cdr.markForCheck();
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        this.mediaError = `Erreur lors du traitement de ${file.name}.`;
        this.cdr.markForCheck();
      }
    }
  }

  triggerUpload() {
    document.getElementById('mediaUpload')?.click();
  }

  removeMedia(index: number) {
    this.mediaFiles.splice(index, 1);
  }

  async submitForm() {
    if (!this.formData.titre) {
      alert('Veuillez saisir un titre');
      return;
    }
    this.isSubmitting = true;
    this.mediaError = '';

    try {
      let finalMediaUrls: string[] = [];

      if (this.mediaFiles.length > 0) {
        this.isUploadingFiles = true;
        this.cdr.markForCheck();
        
        // Upload all files in parallel
        const uploadPromises = this.mediaFiles.map(async (media) => {
          const fd = new FormData();
          fd.append('file', media.blob);
          const res = await fetch(`${environment.apiUrl}/upload-public`, {
            method: 'POST',
            body: fd
          });
          const uploadResult = await res.json();
          if (uploadResult.success) {
            return uploadResult.url;
          } else {
            throw new Error(`Erreur lors de l'upload de ${media.name}.`);
          }
        });

        finalMediaUrls = await Promise.all(uploadPromises);
        this.isUploadingFiles = false;
      }

      // Determine main media type (if mixed, default to PHOTOS, or keep whatever is first)
      const typeMedia = this.mediaFiles.length > 0 ? this.mediaFiles[0].type : 'PHOTOS';

      this.adminData.createEntity('activites', { 
        titre: this.formData.titre,
        description: this.formData.description,
        categorie: this.formData.categorie,
        date: this.formData.date ? new Date(this.formData.date).toISOString() : new Date().toISOString(),
        typeMedia: typeMedia,
        mediaUrl: finalMediaUrls.length > 0 ? finalMediaUrls.join(',') : undefined,
        mediaCount: finalMediaUrls.length
      }).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.showModal = false;
          this.loadActivites();
        },
        error: () => {
          this.isSubmitting = false;
          alert("Erreur lors de la création de l'activité.");
          this.cdr.markForCheck();
        }
      });
    } catch (err: any) {
      this.isSubmitting = false;
      this.isUploadingFiles = false;
      this.mediaError = err.message || "Erreur réseau.";
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
