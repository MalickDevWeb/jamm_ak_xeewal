import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileAdminService, ProfileItem, PermissionModuleItem } from '../../../../core/services/profile-admin.service';

interface GroupedPermissions {
  category: string;
  permissions: PermissionModuleItem[];
}

@Component({
  selector: 'app-role-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Gestion des Profils & Permissions</h2>
          <p class="text-gray-500 text-sm mt-1">Créez des profils personnalisés et attribuez-leur des permissions spécifiques.</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2 bg-[#022c16] text-white rounded-lg text-sm font-medium hover:bg-[#011a0d] transition-colors shadow-sm flex items-center gap-2">
          <i class="fa-solid fa-plus"></i>
          Nouveau Profil
        </button>
      </div>

      <ng-container *ngIf="loading">
        <div class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022c16]"></div>
        </div>
      </ng-container>

      <ng-container *ngIf="!loading">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div *ngFor="let profile of profiles" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group transition-shadow hover:shadow-md relative">
            <div *ngIf="profile.isSystem" class="absolute top-0 left-0 w-full h-1 bg-[#022c16]"></div>
            
            <div class="p-6 flex-1">
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-xl bg-gray-50 text-[#022c16] flex items-center justify-center text-xl">
                  <i class="fa-solid" [ngClass]="profile.isSystem ? 'fa-shield-halved' : 'fa-user-gear'"></i>
                </div>
                <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md"
                      [ngClass]="profile.isSystem ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-[#022c16]'">
                  {{ profile.isSystem ? 'Système' : 'Personnalisé' }}
                </span>
              </div>
              
              <h3 class="text-lg font-bold text-gray-900 mb-1">{{ profile.name }}</h3>
              <p class="text-sm text-gray-500 line-clamp-2 mb-4">{{ profile.description || 'Aucune description' }}</p>
              
              <div class="flex flex-wrap gap-2 mb-4">
                <span class="text-xs font-medium bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md border border-gray-100">
                  <i class="fa-solid fa-key mr-1.5 opacity-50"></i>
                  {{ profile.permissions.length === 0 && !profile.isSystem ? 'Aucune permission' : profile.isSystem ? 'Toutes les permissions' : profile.permissions.length + ' permission(s)' }}
                </span>
                <span class="text-xs font-medium bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md border border-gray-100">
                  <i class="fa-solid fa-users mr-1.5 opacity-50"></i>
                  {{ profile._count?.users || 0 }} utilisateur(s)
                </span>
              </div>
            </div>
            
            <div class="p-4 border-t border-gray-50 bg-gray-50/50 flex gap-2">
              <button (click)="openModal(profile)" class="flex-1 py-2 bg-white text-gray-700 text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <i class="fa-solid fa-pen-to-square mr-1.5"></i> Modifier
              </button>
              <button *ngIf="!profile.isSystem && (profile._count?.users === 0 || !profile._count)" (click)="deleteProfile(profile.id)" class="px-4 py-2 bg-white text-red-600 text-sm font-bold rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
          
        </div>
      </ng-container>
    </div>

    <!-- Modal Profil -->
    <div *ngIf="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" (click)="closeModal()"></div>
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative flex flex-col animate-scale-in">
        
        <div class="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h3 class="text-xl font-bold text-gray-900">{{ editingProfile ? 'Modifier le profil' : 'Nouveau profil' }}</h3>
            <p *ngIf="editingProfile?.isSystem" class="text-sm text-amber-600 font-medium mt-1">
              <i class="fa-solid fa-triangle-exclamation mr-1"></i>
              Ceci est un profil système. Son nom et ses permissions ne sont pas modifiables.
            </p>
          </div>
          <button (click)="closeModal()" class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
          <form class="space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1.5">
                <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest">Nom du profil <span class="text-red-500">*</span></label>
                <input type="text" [(ngModel)]="formData.name" name="name" [disabled]="editingProfile?.isSystem === true"
                       class="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
                       placeholder="ex: Trésorier Adjoint">
              </div>
              
              <div class="space-y-1.5">
                <label class="text-[11px] font-black text-gray-500 uppercase tracking-widest">Description</label>
                <input type="text" [(ngModel)]="formData.description" name="description"
                       class="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] outline-none transition-all"
                       placeholder="Que peut faire ce profil ?">
              </div>
            </div>

            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h4 class="text-base font-bold text-gray-900">Permissions par module</h4>
                <button type="button" *ngIf="!editingProfile?.isSystem" (click)="toggleAllPermissions()" class="text-sm font-bold text-[#022c16] hover:underline">
                  Tout (dé)cocher
                </button>
              </div>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div *ngFor="let group of groupedPermissions" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      <i class="fa-solid fa-cube text-gray-500 text-sm"></i>
                    </div>
                    <span class="font-bold text-gray-800 text-sm">{{ group.category }}</span>
                  </div>
                  
                  <div class="p-2">
                    <label *ngFor="let perm of group.permissions" class="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group/item relative">
                      <div class="flex items-center h-5 mr-3">
                        <input type="checkbox" 
                               [checked]="hasPermission(perm.id) || editingProfile?.isSystem"
                               (change)="togglePermission(perm.id)"
                               [disabled]="editingProfile?.isSystem === true"
                               class="w-4 h-4 text-[#022c16] bg-gray-100 border-gray-300 rounded focus:ring-[#022c16] focus:ring-2 cursor-pointer disabled:opacity-50">
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-gray-900 group-hover/item:text-[#022c16] transition-colors">{{ perm.label }}</p>
                        <p class="text-xs text-gray-500 mt-0.5">{{ perm.description }}</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
          </form>
        </div>
        
        <div class="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
          <button type="button" (click)="closeModal()" class="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 font-bold rounded-xl text-sm transition-colors">
            Annuler
          </button>
          <button type="button" (click)="saveProfile()" [disabled]="saving || !formData.name"
                  class="px-6 py-2.5 text-white bg-[#022c16] hover:bg-[#011a0d] font-bold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
            <span *ngIf="saving" class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            {{ saving ? 'Enregistrement...' : (editingProfile ? 'Enregistrer les modifications' : 'Créer le profil') }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class RoleManagerComponent implements OnInit {
  profiles: ProfileItem[] = [];
  permissions: PermissionModuleItem[] = [];
  groupedPermissions: GroupedPermissions[] = [];
  
  loading = true;
  saving = false;
  
  isModalOpen = false;
  editingProfile: ProfileItem | null = null;
  
  formData = {
    name: '',
    description: '',
    permissions: [] as string[]
  };

  constructor(
    private profileService: ProfileAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    
    // Load profiles
    this.profileService.getProfiles().subscribe({
      next: (res) => {
        if (res.success) {
          this.profiles = res.data;
        }
        
        // Load permissions
        this.profileService.getPermissions().subscribe({
          next: (permRes) => {
            if (permRes.success) {
              this.permissions = permRes.data;
              this.groupPermissions();
            }
            this.loading = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.loading = false;
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  groupPermissions() {
    const groupsMap = new Map<string, PermissionModuleItem[]>();
    
    this.permissions.forEach(p => {
      const cat = p.category || 'Autres';
      if (!groupsMap.has(cat)) {
        groupsMap.set(cat, []);
      }
      groupsMap.get(cat)!.push(p);
    });
    
    this.groupedPermissions = Array.from(groupsMap.entries()).map(([category, perms]) => ({
      category,
      permissions: perms
    }));
  }

  openModal(profile?: ProfileItem) {
    this.editingProfile = profile || null;
    
    if (profile) {
      this.formData = {
        name: profile.name,
        description: profile.description || '',
        permissions: [...profile.permissions]
      };
    } else {
      this.formData = {
        name: '',
        description: '',
        permissions: []
      };
    }
    
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingProfile = null;
  }

  hasPermission(id: string): boolean {
    return this.formData.permissions.includes(id);
  }

  togglePermission(id: string) {
    if (this.editingProfile?.isSystem) return;
    
    const idx = this.formData.permissions.indexOf(id);
    if (idx > -1) {
      this.formData.permissions = this.formData.permissions.filter(p => p !== id);
    } else {
      this.formData.permissions = [...this.formData.permissions, id];
    }
  }

  toggleAllPermissions() {
    if (this.editingProfile?.isSystem) return;
    
    if (this.formData.permissions.length === this.permissions.length) {
      this.formData.permissions = [];
    } else {
      this.formData.permissions = this.permissions.map(p => p.id);
    }
  }

  saveProfile() {
    if (!this.formData.name) return;
    
    this.saving = true;
    
    const requestData = {
      name: this.formData.name,
      description: this.formData.description,
      permissions: this.formData.permissions
    };

    const request$ = this.editingProfile
      ? this.profileService.updateProfile(this.editingProfile.id, requestData)
      : this.profileService.createProfile(requestData);

    request$.subscribe({
      next: (res) => {
        if (res.success) {
          this.closeModal();
          this.loadData();
        }
        this.saving = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Save error', err);
        alert(err.error?.message || 'Erreur lors de la sauvegarde du profil');
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  deleteProfile(id: string) {
    if (confirm('Voulez-vous vraiment supprimer ce profil ? Cette action est irréversible.')) {
      this.profileService.deleteProfile(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.loadData();
          }
        },
        error: (err) => {
          alert(err.error?.message || 'Erreur lors de la suppression');
        }
      });
    }
  }
}
