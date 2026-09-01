import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { BulkActionsBarComponent } from '../../../../shared/components/bulk-actions-bar/bulk-actions-bar.component';
import { CloudinaryUploadService } from '../../../../core/services/cloudinary-upload.service';

@Component({
  selector: 'app-admin-activites',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, BulkActionsBarComponent],
  template: `
    <div class="animate-fade-in-up max-w-[1600px] mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-[#e6f3eb] flex items-center justify-center">
            <i class="fa-regular fa-calendar text-[#008d36] text-xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Activités</h2>
            <p class="text-sm font-medium text-gray-500">{{ total() }} activité(s) enregistrée(s)</p>
          </div>
        </div>
        <button (click)="openCreateModal()" class="bg-[#022c16] text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#008d36] transition-colors shadow-sm">
          <i class="fa-solid fa-plus"></i> Nouvelle activité
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Photos -->
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-[#e6f3eb] flex items-center justify-center shrink-0">
            <i class="fa-solid fa-image text-[#008d36] text-xl"></i>
          </div>
          <div>
            <p class="text-[13px] text-gray-500 font-medium">Photos</p>
            <h3 class="text-2xl font-black text-gray-900 leading-tight mt-0.5">{{ photosCount() }}</h3>
            <p class="text-[11px] font-bold text-[#008d36] mt-1">{{ photosPercent() | number:'1.1-1' }}% du total</p>
          </div>
        </div>
        <!-- Vidéos -->
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-[#e6f3eb] flex items-center justify-center shrink-0">
            <i class="fa-solid fa-video text-[#008d36] text-xl"></i>
          </div>
          <div>
            <p class="text-[13px] text-gray-500 font-medium">Vidéos</p>
            <h3 class="text-2xl font-black text-gray-900 leading-tight mt-0.5">{{ videosCount() }}</h3>
            <p class="text-[11px] font-bold text-[#008d36] mt-1">{{ videosPercent() | number:'1.1-1' }}% du total</p>
          </div>
        </div>
        <!-- Ce mois -->
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-[#e6f3eb] flex items-center justify-center shrink-0">
            <i class="fa-regular fa-calendar text-[#008d36] text-xl"></i>
          </div>
          <div>
            <p class="text-[13px] text-gray-500 font-medium">Ce mois</p>
            <h3 class="text-2xl font-black text-gray-900 leading-tight mt-0.5">{{ ceMoisCount() }}</h3>
            <p class="text-[11px] font-bold text-[#008d36] mt-1">{{ ceMoisPercent() | number:'1.1-1' }}% du total</p>
          </div>
        </div>
        <!-- Publiées -->
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-[#e6f3eb] flex items-center justify-center shrink-0">
            <i class="fa-solid fa-check-circle text-[#008d36] text-xl"></i>
          </div>
          <div>
            <p class="text-[13px] text-gray-500 font-medium">Publiées</p>
            <h3 class="text-2xl font-black text-gray-900 leading-tight mt-0.5">{{ publieesCount() }}</h3>
            <p class="text-[11px] font-bold text-[#008d36] mt-1">{{ publieesPercent() | number:'1.1-1' }}% du total</p>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="isLoading()" class="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div class="text-center">
          <i class="fa-solid fa-circle-notch fa-spin text-4xl text-[#008d36] mb-4"></i>
          <p class="text-gray-500 text-sm font-medium">Chargement des activités...</p>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!isLoading() && activites().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid fa-photo-film text-3xl text-gray-300"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-1">Aucune activité</h3>
        <p class="text-sm text-gray-500 mb-6">Commencez par ajouter votre première activité.</p>
        <button (click)="openCreateModal()" class="text-[#008d36] bg-[#e6f3eb] font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#d1e8d9] transition-colors">
          Créer une activité
        </button>
      </div>

      <!-- Select All Bar -->
      <div *ngIf="!isLoading() && activites().length > 0" class="mb-4 flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100">
        <input type="checkbox" [checked]="selectedIds.size === activites().length && activites().length > 0" (change)="toggleAllSelection()" class="w-4 h-4 cursor-pointer accent-[#008d36]">
        <span class="text-sm font-semibold text-gray-600">Sélectionner tout ({{ activites().length }})</span>
      </div>

      <!-- Activities Grid -->
      <div *ngIf="!isLoading() && activites().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div *ngFor="let a of activites().slice(0, 3)" class="relative bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300"
             [class.ring-2]="isSelected(a.id)" [class.ring-red-400]="isSelected(a.id)">
          <input type="checkbox" [checked]="isSelected(a.id)" (change)="toggleSelection(a.id)" class="absolute top-3 right-3 w-4 h-4 cursor-pointer accent-[#008d36] z-20">
          
          <!-- Image/Video Container -->
          <div class="h-48 relative bg-gray-100 w-full overflow-hidden cursor-pointer" (click)="openEditModal(a)">
            <img *ngIf="a.typeMedia === 'PHOTOS' && getFirstMedia(a)" [src]="getFirstMedia(a)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.style.display='none'" />
            <img *ngIf="a.typeMedia === 'VIDEOS' && getFirstMedia(a)" [src]="getVideoThumbnail(getFirstMedia(a))" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.style.display='none'" />
            
            <div *ngIf="!getFirstMedia(a)" class="w-full h-full flex items-center justify-center">
               <i class="fa-solid fa-image text-3xl text-gray-300"></i>
            </div>
            
            <!-- Badges overlay -->
            <div class="absolute top-3 left-3 flex items-center gap-2">
              <span *ngIf="a.typeMedia === 'PHOTOS'" class="bg-[#008d36] text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5"><i class="fa-solid fa-image"></i> PHOTO</span>
              <span *ngIf="a.typeMedia === 'VIDEOS'" class="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5"><i class="fa-solid fa-video"></i> VIDÉO</span>
            </div>
            <div class="absolute top-3 right-3" *ngIf="a.mediaCount > 1">
              <span class="bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-2. py-1 rounded flex items-center gap-1.5 px-2 py-1"><i class="fa-solid fa-images"></i> {{ a.mediaCount }} médias</span>
            </div>

            <!-- Play button for videos -->
            <div *ngIf="a.typeMedia === 'VIDEOS'" class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-14 h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                 <i class="fa-solid fa-play text-white text-xl ml-1"></i>
              </div>
            </div>
          </div>
          
          <!-- Card content -->
          <div class="p-5 flex-1 flex flex-col">
            <div class="flex items-center gap-3 mb-2.5">
              <span class="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{{ a.categorie }}</span>
              <span class="text-xs text-gray-400 font-medium">{{ a.date | date:'dd/MM/yyyy' }}</span>
            </div>
            <h3 class="text-[15px] font-bold text-gray-900 mb-4 line-clamp-2 leading-tight">{{ a.titre }}</h3>
            
            <div class="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
              <span *ngIf="a.statut === 'PUBLIE'" class="text-[10px] font-bold text-[#008d36] bg-[#e6f3eb] px-2 py-1 rounded flex items-center gap-1.5"><i class="fa-solid fa-check-circle"></i> PUBLIÉE</span>
              <button (click)="openEditModal(a)" class="text-gray-500 text-xs font-bold hover:text-[#022c16] flex items-center gap-1.5 transition-colors"><i class="fa-solid fa-pen"></i> Modifier</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div *ngIf="!isLoading() && activites().length > 0" class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col overflow-hidden">
        <div class="p-5 border-b border-gray-50 flex items-center justify-between">
          <h3 class="font-bold text-gray-900">Liste des activités</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                <th class="p-4 pl-4 w-10"><input type="checkbox" [checked]="selectedIds.size === activites().length && activites().length > 0" (change)="toggleAllSelection()" class="w-4 h-4 cursor-pointer accent-[#008d36]"></th>
                <th class="p-4 pl-2">TITRE</th>
                <th class="p-4">TYPE</th>
                <th class="p-4">CATÉGORIE</th>
                <th class="p-4">DATE</th>
                <th class="p-4">MÉDIAS</th>
                <th class="p-4">STATUT</th>
                <th class="p-4">CRÉÉ PAR</th>
                <th class="p-4 pr-6 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody class="text-sm divide-y divide-gray-50">
              <tr *ngFor="let a of activites()" class="hover:bg-gray-50/50 transition-colors group" [class.bg-red-50]="isSelected(a.id)">
                <td class="p-4 pl-4">
                  <input type="checkbox" [checked]="isSelected(a.id)" (change)="toggleSelection(a.id)" class="w-4 h-4 cursor-pointer accent-[#008d36]">
                </td>
                <td class="p-4 pl-2 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative cursor-pointer" (click)="openEditModal(a)">
                       <img *ngIf="a.typeMedia === 'PHOTOS' && getFirstMedia(a)" [src]="getFirstMedia(a)" class="w-full h-full object-cover" onerror="this.style.display='none'"/>
                       <img *ngIf="a.typeMedia === 'VIDEOS' && getFirstMedia(a)" [src]="getVideoThumbnail(getFirstMedia(a))" class="w-full h-full object-cover" onerror="this.style.display='none'"/>
                       <div *ngIf="a.typeMedia === 'VIDEOS'" class="absolute inset-0 flex items-center justify-center bg-black/10">
                          <i class="fa-solid fa-play text-white text-xs opacity-80 shadow-sm"></i>
                       </div>
                       <div *ngIf="!getFirstMedia(a)" class="w-full h-full flex items-center justify-center">
                          <i class="fa-solid fa-image text-gray-300"></i>
                       </div>
                    </div>
                    <span class="font-semibold text-gray-800 text-[13px] line-clamp-2 max-w-[200px] hover:text-[#008d36] cursor-pointer" (click)="openEditModal(a)">{{ a.titre }}</span>
                  </div>
                </td>
                <td class="p-4">
                   <span *ngIf="a.typeMedia === 'PHOTOS'" class="text-[10px] font-bold text-[#008d36] bg-[#e6f3eb] px-2.5 py-1 rounded">PHOTO</span>
                   <span *ngIf="a.typeMedia === 'VIDEOS'" class="text-[10px] font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded">VIDÉO</span>
                </td>
                <td class="p-4">
                   <span class="text-[10px] font-bold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full uppercase">{{ a.categorie }}</span>
                </td>
                <td class="p-4 text-gray-500 font-medium text-[13px]">{{ a.date | date:'dd/MM/yyyy' }}</td>
                <td class="p-4 text-gray-500 text-[13px] font-medium">{{ a.mediaCount > 0 ? a.mediaCount + ' médias' : '-' }}</td>
                <td class="p-4">
                   <span *ngIf="a.statut === 'PUBLIE'" class="text-[10px] font-bold text-[#008d36] bg-[#e6f3eb] px-2.5 py-1 rounded flex items-center gap-1.5 w-max"><i class="fa-solid fa-check-circle"></i> PUBLIÉE</span>
                </td>
                <td class="p-4 text-gray-500 text-[13px]">Admin</td>
                <td class="p-4 pr-6">
                   <div class="flex items-center justify-center gap-3">
                     <button class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"><i class="fa-solid fa-eye text-xs"></i></button>
                     <div class="relative group/menu">
                        <button class="text-gray-400 hover:text-gray-700 transition-colors p-1"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                        <div class="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:pointer-events-auto transition-opacity z-10">
                          <button (click)="openEditModal(a)" class="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#008d36] flex items-center gap-2"><i class="fa-solid fa-pen w-4"></i> Modifier</button>
                          <button (click)="deleteActivite(a.id)" class="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"><i class="fa-solid fa-trash w-4"></i> Supprimer</button>
                        </div>
                     </div>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination (Mock for UI) -->
        <div class="p-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
          <span class="text-xs font-medium text-gray-500">Affichage de 1 à {{ activites().length > 10 ? 10 : activites().length }} sur {{ total() }} résultats</span>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1">
              <button class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"><i class="fa-solid fa-chevron-left text-[10px]"></i></button>
              <button class="w-7 h-7 rounded-lg flex items-center justify-center bg-[#022c16] text-white text-xs font-bold">1</button>
              <button class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>
            </div>
            <div class="relative">
              <select class="appearance-none bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 pl-3 pr-8 py-1.5 focus:outline-none focus:border-[#022c16] shadow-sm cursor-pointer">
                <option>10 par page</option>
                <option>25 par page</option>
                <option>50 par page</option>
              </select>
              <i class="fa-solid fa-chevron-down text-[10px] text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal: Créer / Modifier -->
      <div *ngIf="showModal()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in-up my-4 overflow-hidden">
          <!-- Modal Header -->
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 class="font-black text-xl text-gray-900 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#e6f3eb] flex items-center justify-center">
                 <i class="fa-solid" [class.fa-plus]="isCreating()" [class.fa-pen]="!isCreating()" class="text-[#008d36]"></i>
              </div>
              {{ isCreating() ? 'Nouvelle activité' : "Modifier l'activité" }}
            </h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-5">
            <!-- Titre -->
            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Titre <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="formData.titre" placeholder="Entrez le titre de l'activité..." class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Description</label>
              <textarea [(ngModel)]="formData.description" rows="4" placeholder="Décrivez l'activité en détail..." class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none resize-none"></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div>
                 <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Catégorie</label>
                 <select [(ngModel)]="formData.categorie" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none appearance-none cursor-pointer">
                    <option *ngFor="let c of categories(); trackBy: trackByOption" [value]="c.value">{{ c.label }}</option>
                 </select>
               </div>
               <div>
                 <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Date</label>
                 <input type="date" [(ngModel)]="formData.date" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" />
               </div>
            </div>

            <!-- Media Upload -->
            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Médias (Photos ou Vidéos)</label>
              <label class="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-[#008d36] hover:border-solid transition-all group">
                <div class="flex flex-col items-center justify-center py-4">
                  <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover:text-[#008d36] transition-colors mb-2">
                    <i class="fa-solid fa-cloud-arrow-up text-lg"></i>
                  </div>
                  <p class="text-sm font-bold text-gray-600">Cliquez pour ajouter des médias</p>
                  <p class="text-xs text-gray-400 mt-1">JPG, PNG, MP4 — max 50MB chacun</p>
                </div>
                <input type="file" #mediaInput (change)="onMediaSelected($event)" accept="image/*,video/*" multiple class="hidden" />
              </label>

              <!-- New Media Preview Grid -->
              <div *ngIf="mediaFiles().length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                <div *ngFor="let media of mediaFiles(); let i = index" class="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100 h-24">
                  <img *ngIf="media.type === 'PHOTOS'" [src]="media.previewUrl" class="w-full h-full object-cover" />
                  <video *ngIf="media.type === 'VIDEOS'" [src]="media.previewUrl" class="w-full h-full object-cover" muted></video>
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button (click)="removeMedia(i)" class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white hover:bg-red-600 shadow-sm">
                      <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                  <div class="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
                    {{ media.type === 'VIDEOS' ? 'VIDÉO' : 'PHOTO' }}
                  </div>
                </div>
              </div>

              <!-- Existing media (edit mode) -->
              <div *ngIf="!isCreating() && existingMediaUrls().length > 0" class="mt-4">
                <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Médias existants</p>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <div *ngFor="let url of existingMediaUrls(); let i = index" class="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-100 h-24">
                    <img *ngIf="!url.match('\\\\.(mp4|webm|mov|avi)($|\\\\?)')" [src]="url" class="w-full h-full object-cover" />
                    <video *ngIf="url.match('\\\\.(mp4|webm|mov|avi)($|\\\\?)') || url.includes('/video/upload')" [src]="url" class="w-full h-full object-cover" muted></video>
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button (click)="removeExistingMedia(i)" class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white hover:bg-red-600 shadow-sm">
                        <i class="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Barre de progression upload -->
              <div *ngIf="isUploadingFiles()" class="mt-3 space-y-2">
                <div *ngFor="let p of uploadProgresses()" class="flex items-center gap-3">
                  <span class="text-[11px] text-gray-500 font-medium truncate flex-1 max-w-[180px]">{{ p.name }}</span>
                  <div class="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div class="bg-[#008d36] h-2 rounded-full transition-all duration-300" [style.width]="p.percent + '%'"></div>
                  </div>
                  <span class="text-[11px] font-bold text-[#008d36] w-8 text-right">{{ p.percent }}%</span>
                </div>
              </div>

              <p *ngIf="mediaError()" class="text-red-500 text-xs font-bold mt-2 flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-lg">
                <i class="fa-solid fa-circle-exclamation"></i> {{ mediaError() }}
              </p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
            <button (click)="closeModal()" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">
              Annuler
            </button>
            <button (click)="submitForm()" [disabled]="isSubmitting() || !formData.titre" class="px-6 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#008d36] rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="!isSubmitting()" class="flex items-center gap-2">
                <i class="fa-solid" [class.fa-plus]="isCreating()" [class.fa-save]="!isCreating()"></i>
                {{ isCreating() ? 'Créer' : 'Enregistrer' }}
              </span>
              <span *ngIf="isSubmitting()" class="flex items-center gap-2">
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
        (cancel)="showConfirmDialog.set(false)">
      </app-confirm-dialog>
    

    <!-- Bulk Actions Bar -->
    <app-bulk-actions-bar
      [selectedCount]="selectedIds.size"
      [loading]="loadingBulk"
      (deleteSelected)="bulkDeleteSelected()"
      (deleteAll)="bulkDeleteAll()"
      (clear)="clearSelection()">
    </app-bulk-actions-bar>

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
  private cdr = inject(ChangeDetectorRef);

  activites = signal<any[]>([]);
  total = computed(() => this.activites().length);
  isLoading = signal(true);

  // Stats computed properties
  photosCount = computed(() => this.activites().filter((a) => a.typeMedia === 'PHOTOS').length);
  photosPercent = computed(() => this.total() > 0 ? (this.photosCount() / this.total()) * 100 : 0);

  videosCount = computed(() => this.activites().filter((a) => a.typeMedia === 'VIDEOS').length);
  videosPercent = computed(() => this.total() > 0 ? (this.videosCount() / this.total()) * 100 : 0);

  ceMoisCount = computed(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return this.activites().filter((a) => {
      if (!a.date) return false;
      const d = new Date(a.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
  });
  ceMoisPercent = computed(() => this.total() > 0 ? (this.ceMoisCount() / this.total()) * 100 : 0);

  publieesCount = computed(() => this.activites().filter((a) => a.statut === 'PUBLIE').length);
  publieesPercent = computed(() => this.total() > 0 ? (this.publieesCount() / this.total()) * 100 : 0);

  categories = signal<Option[]>([]);
  showModal = signal(false);
  showConfirmDialog = signal(false);
  itemToDelete = signal<string | null>(null);
  confirmTitle = signal('Confirmer la suppression');
  confirmActionType = signal<string>('');
  confirmActionId = signal<any>(null);
  currentActiviteId = signal<string | null>(null);
  isCreating = signal(true);
  isUploadingFiles = signal(false);
  isSubmitting = signal(false);

  mediaFiles = signal<
    { blob: File | Blob; previewUrl: string; type: string; name: string }[]
  >([]);
  existingMediaUrls = signal<string[]>([]);
  mediaError = signal('');
  uploadProgresses = signal<{ name: string; percent: number }[]>([]);

  formData = {
    titre: '',
    description: '',
    categorie: '',
    date: '',
    typeMedia: 'PHOTOS' as 'PHOTOS' | 'VIDEOS',
  };

  
  // === BULK DELETE STATE ===
  selectedIds: Set<string> = new Set();
  loadingBulk = false;

  toggleSelection(id: string) {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
    this.cdr.markForCheck();
  }

  toggleAllSelection() {
    if (this.selectedIds.size === this.activites().length) this.selectedIds.clear();
    else this.activites().forEach((i: any) => this.selectedIds.add(i.id));
    this.cdr.markForCheck();
  }

  isSelected(id: string): boolean { return this.selectedIds.has(id); }

  clearSelection() {
    this.selectedIds.clear();
    this.cdr.markForCheck();
  }

  bulkDeleteSelected() {
    if (this.selectedIds.size === 0) return;
    this.openConfirm('Supprimer la selection ?', 'Vous allez supprimer ' + this.selectedIds.size + ' activite(s). Cette action est irreversible.', 'bulk_delete_selected');
  }

  bulkDeleteAll() {
    this.openConfirm('Supprimer TOUS les activite(s) ?', 'ATTENTION: Cette action supprimera TOUS les activite(s) de la base.', 'bulk_delete_all');
  }

constructor(private adminData: AdminDataService, private cloudinaryUpload: CloudinaryUploadService) {}

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

  getVideoThumbnail(url: string | null): string | null {
    if (!url) return null;
    // Cloudinary: replace video extension with .jpg to get a thumbnail
    return url.replace(/\.(mp4|webm|mov|avi)($|\?)/i, '.jpg$2');
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
        // Initialiser la progression pour chaque fichier
        this.uploadProgresses.set(currentNew.map(m => ({ name: m.name, percent: 0 })));

        // Upload séquentiel pour éviter de saturer la bande passante
        for (let i = 0; i < currentNew.length; i++) {
          const media = currentNew[i];
          try {
            const url = await this.cloudinaryUpload.uploadDirect(
              media.blob,
              media.name,
              (percent) => {
                this.uploadProgresses.update(list =>
                  list.map((p, idx) => idx === i ? { ...p, percent } : p)
                );
                this.cdr.markForCheck();
              }
            );
            allMediaUrls.push(url.url);
          } catch (err: any) {
            throw new Error(`Erreur upload de "${media.name}" : ${err.message}`);
          }
        }

        this.isUploadingFiles.set(false);
        this.uploadProgresses.set([]);
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
    const actionType = this.confirmActionType();
    if (this.itemToDelete()) {
      const id = this.itemToDelete();
      if (id) this.deleteItem(id);
      this.itemToDelete.set(null);
      this.showConfirmDialog.set(false);
    } else if (actionType === 'bulk_delete_selected') {
      this.showConfirmDialog.set(false);
      this.loadingBulk = true;
      const ids = Array.from(this.selectedIds);
      Promise.all(ids.map(id => this.adminData.deleteEntity('activites', id).toPromise()))
        .then(() => {
          this.activites.update((list) => list.filter((a) => !this.selectedIds.has(a.id)));
          this.selectedIds.clear();
          this.loadingBulk = false;
          this.cdr.markForCheck();
        })
        .catch(() => { this.loadingBulk = false; this.cdr.markForCheck(); });
    } else if (actionType === 'bulk_delete_all') {
      this.showConfirmDialog.set(false);
      this.loadingBulk = true;
      Promise.all(this.activites().map((a: any) => this.adminData.deleteEntity('activites', a.id).toPromise()))
        .then(() => {
          this.activites.set([]);
          this.selectedIds.clear();
          this.loadingBulk = false;
          this.cdr.markForCheck();
        })
        .catch(() => { this.loadingBulk = false; this.cdr.markForCheck(); });
    }
  }

  openConfirm(title: string, _message: string, actionType: string, actionId: any = null) {
    this.confirmTitle.set(title);
    this.confirmActionType.set(actionType);
    this.confirmActionId.set(actionId);
    this.showConfirmDialog.set(true);
  }


}
