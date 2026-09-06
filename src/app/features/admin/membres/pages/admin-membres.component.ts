import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import {
  ProfileAdminService,
  ProfileItem,
  AdminUserItem,
  PermissionModuleItem,
} from '../../../../core/services/profile-admin.service';
import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-membres',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AlertPopupComponent, ConfirmDialogComponent],
  template: `
    <div class="animate-fade-in-up max-w-[1600px] mx-auto pb-12">
      <!-- Alert Popup -->
      <app-alert-popup
        [message]="alertMessage"
        [type]="alertType"
        [visible]="showAlertPopup"
        (close)="showAlertPopup = false">
      </app-alert-popup>

      <!-- Confirm Dialog -->
      <app-confirm-dialog
        [title]="confirmTitle"
        [message]="confirmMessage"
        [visible]="showConfirmDialog"
        (confirm)="onConfirmAction()"
        (cancel)="showConfirmDialog = false">
      </app-confirm-dialog>

      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center shrink-0">
            <i class="fa-solid fa-user-shield text-[#008d36] text-2xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Équipe & Profils d'Accès</h2>
            <p class="text-[13px] text-gray-500 font-medium mt-0.5">
              Gérez les membres de l'organisation et configurez dynamiquement leurs droits d'accès par modules.
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button
            *ngIf="activeTab === 'users'"
            (click)="openCreateUserModal()"
            class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#008d36] transition-all flex items-center gap-2">
            <i class="fa-solid fa-user-plus"></i> Nouveau Membre
          </button>
          <button
            *ngIf="activeTab === 'profiles'"
            (click)="openCreateProfileModal()"
            class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#008d36] transition-all flex items-center gap-2">
            <i class="fa-solid fa-plus"></i> Nouveau Profil
          </button>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="flex items-center gap-2 mb-6 border-b border-gray-200">
        <button
          (click)="activeTab = 'users'"
          [class.border-[#022c16]]="activeTab === 'users'"
          [class.text-[#022c16]]="activeTab === 'users'"
          [class.font-bold]="activeTab === 'users'"
          class="px-6 py-3.5 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-900 transition-all flex items-center gap-2.5">
          <i class="fa-solid fa-users"></i>
          Membres de l'Équipe
          <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-semibold">{{ users.length }}</span>
        </button>
        <button
          (click)="activeTab = 'profiles'"
          [class.border-[#022c16]]="activeTab === 'profiles'"
          [class.text-[#022c16]]="activeTab === 'profiles'"
          [class.font-bold]="activeTab === 'profiles'"
          class="px-6 py-3.5 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-900 transition-all flex items-center gap-2.5">
          <i class="fa-solid fa-id-badge"></i>
          Profils & Droits modulaires
          <span class="px-2 py-0.5 text-xs rounded-full bg-[#e6f3eb] text-[#008d36] font-semibold">{{ profiles.length }}</span>
        </button>
      </div>

      <!-- ================================================================= -->
      <!-- TAB 1: MEMBRES DE L'ÉQUIPE                                        -->
      <!-- ================================================================= -->
      <div *ngIf="activeTab === 'users'" class="space-y-6">
        <!-- Search & Filter Bar -->
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="relative w-full md:w-96">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onFilterChange()"
              placeholder="Rechercher par nom, email ou téléphone..."
              class="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36] transition-all" />
          </div>

          <div class="flex items-center gap-3 w-full md:w-auto">
            <!-- Filter by Profile -->
            <select
              [(ngModel)]="selectedProfileFilter"
              (ngModelChange)="onFilterChange()"
              class="px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]">
              <option value="ALL">Tous les profils</option>
              <option *ngFor="let p of profiles" [value]="p.id">{{ p.name }}</option>
            </select>

            <!-- Filter by Status -->
            <select
              [(ngModel)]="selectedStatusFilter"
              (ngModelChange)="onFilterChange()"
              class="px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]">
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIVE">Actifs uniquement</option>
              <option value="INACTIVE">Inactifs uniquement</option>
            </select>
          </div>
        </div>

        <!-- Users Table Card -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50/80 border-b border-gray-100 text-[12px] uppercase font-bold text-gray-500 tracking-wider">
                  <th class="py-4 px-6">Membre</th>
                  <th class="py-4 px-6">Contact</th>
                  <th class="py-4 px-6">Profil assigné</th>
                  <th class="py-4 px-6">Statut</th>
                  <th class="py-4 px-6">Date & Heure d'ajout</th>
                  <th class="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-sm">
                <tr *ngIf="isLoading" class="text-center py-12">
                  <td colspan="6" class="py-12 text-gray-400">
                    <i class="fa-solid fa-spinner animate-spin text-2xl text-[#008d36] mb-2 block"></i>
                    Chargement des membres...
                  </td>
                </tr>

                <tr *ngIf="!isLoading && filteredUsers.length === 0" class="text-center py-12">
                  <td colspan="6" class="py-12 text-gray-400">
                    <i class="fa-solid fa-users-slash text-3xl mb-2 block text-gray-300"></i>
                    Aucun membre trouvé correspondant à vos critères
                  </td>
                </tr>

                <tr *ngFor="let u of filteredUsers" class="hover:bg-gray-50/70 transition-colors">
                  <!-- Name & Avatar -->
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-[#022c16] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                        {{ (u.name.charAt(0) || 'U').toUpperCase() }}
                      </div>
                      <div>
                        <p class="font-bold text-gray-900 leading-tight">{{ u.name }}</p>
                        <p class="text-xs text-gray-400 mt-0.5">{{ u.email }}</p>
                      </div>
                    </div>
                  </td>

                  <!-- Contact -->
                  <td class="py-4 px-6 text-gray-600 font-medium">
                    {{ u.telephone || '—' }}
                  </td>

                  <!-- Assigned Profile -->
                  <td class="py-4 px-6">
                    <span
                      *ngIf="u.profile"
                      class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                      [ngClass]="u.profile.isSystem ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-[#e6f3eb] text-[#008d36] border border-[#008d36]/20'">
                      <i [class]="u.profile.isSystem ? 'fa-solid fa-crown text-amber-600 text-[10px]' : 'fa-solid fa-shield text-[#008d36] text-[10px]'"></i>
                      {{ u.profile.name }}
                    </span>
                    <span *ngIf="!u.profile" class="text-xs text-gray-400 italic">
                      Aucun profil assigné
                    </span>
                  </td>

                  <!-- Status -->
                  <td class="py-4 px-6">
                    <button
                      (click)="toggleUserStatus(u)"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all"
                      [ngClass]="u.actif ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 text-red-700 hover:bg-red-100'">
                      <span class="w-2 h-2 rounded-full" [ngClass]="u.actif ? 'bg-emerald-500' : 'bg-red-500'"></span>
                      {{ u.actif ? 'Actif' : 'Inactif' }}
                    </button>
                  </td>

                  <!-- Date & Heure de création -->
                  <td class="py-4 px-6 whitespace-nowrap">
                    <div class="text-xs font-bold text-gray-900">
                      {{ u.createdAt | date:'dd/MM/yyyy' }}
                    </div>
                    <div class="text-[11px] font-mono text-gray-400 mt-0.5 flex items-center gap-1">
                      <i class="fa-regular fa-clock text-[10px] text-[#008d36]"></i>
                      <span>{{ u.createdAt | date:'HH:mm:ss' }}</span>
                    </div>
                  </td>

                  <!-- Actions -->
                  <td class="py-4 px-6 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        (click)="openEditUserModal(u)"
                        title="Modifier le membre"
                        class="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button
                        (click)="confirmDeleteUser(u)"
                        title="Supprimer"
                        class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- TAB 2: PROFILS & DROITS MODULAIRES                                -->
      <!-- ================================================================= -->
      <div *ngIf="activeTab === 'profiles'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            *ngFor="let p of profiles"
            class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group">
            
            <div>
              <!-- Top Row -->
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    [ngClass]="p.isSystem ? 'bg-amber-100 text-amber-700' : 'bg-[#e6f3eb] text-[#008d36]'">
                    <i [class]="p.isSystem ? 'fa-solid fa-crown text-xl' : 'fa-solid fa-user-shield text-xl'"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900 text-base leading-tight">{{ p.name }}</h3>
                    <p class="text-xs text-gray-400 mt-0.5">
                      {{ (p._count?.users || 0) }} membre{{ (p._count?.users || 0) > 1 ? 's' : '' }} rattaché{{ (p._count?.users || 0) > 1 ? 's' : '' }}
                    </p>
                  </div>
                </div>

                <span
                  *ngIf="p.isSystem"
                  class="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                  Système
                </span>
              </div>

              <!-- Description -->
              <p class="text-xs text-gray-500 mb-2 min-h-[32px] line-clamp-2">
                {{ p.description || 'Aucune description spécifique renseignée pour ce profil.' }}
              </p>

              <!-- Date & Heure de création du profil -->
              <div class="text-[11px] text-gray-400 font-mono mb-4 flex items-center gap-1.5">
                <i class="fa-regular fa-clock text-[10px] text-[#008d36]"></i>
                <span>Créé le {{ p.createdAt | date:'dd/MM/yyyy à HH:mm:ss' }}</span>
              </div>

              <!-- Modules summary badges -->
              <div class="mb-6">
                <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Modules autorisés ({{ isWildcard(p) ? 'Tous les modules' : p.permissions.length }}) :
                </p>

                <div *ngIf="isWildcard(p)" class="flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                  <i class="fa-solid fa-asterisk text-xs"></i>
                  Accès intégral à toute la plateforme
                </div>

                <div *ngIf="!isWildcard(p)" class="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
                  <span
                    *ngFor="let permId of p.permissions"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    <i [class]="getPermissionIcon(permId) + ' text-[10px] text-gray-500'"></i>
                    {{ getPermissionLabel(permId) }}
                  </span>
                  <span *ngIf="p.permissions.length === 0" class="text-xs text-gray-400 italic">
                    Aucun module autorisé
                  </span>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                (click)="openEditProfileModal(p)"
                class="px-4 py-2 text-xs font-bold text-[#022c16] bg-[#e6f3eb] hover:bg-[#008d36] hover:text-white rounded-xl transition-all flex items-center gap-1.5">
                <i class="fa-solid fa-sliders"></i>
                Configurer les droits
              </button>

              <button
                *ngIf="!p.isSystem"
                (click)="confirmDeleteProfile(p)"
                title="Supprimer le profil"
                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <i class="fa-solid fa-trash text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- MODAL: CRÉER / MODIFIER UN PROFIL                                 -->
      <!-- ================================================================= -->
      <div *ngIf="showProfileModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
          <!-- Modal Header -->
          <div class="px-6 py-5 bg-[#022c16] text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <i class="fa-solid fa-sliders text-white text-lg"></i>
              </div>
              <div>
                <h3 class="font-bold text-lg">
                  {{ profileModalTitle }}
                </h3>
                <p class="text-xs text-white/70">
                  Définissez le nom du profil et cochez les modules auxquels il aura accès
                </p>
              </div>
            </div>
            <button (click)="showProfileModal = false" class="text-white/70 hover:text-white text-xl">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            <!-- Profile Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Nom du Profil <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="profileForm.name"
                  [disabled]="isEditingProfile && !!selectedProfile?.isSystem"
                  placeholder="Ex: Trésorier, Homme de terrain..."
                  class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]" />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  [(ngModel)]="profileForm.description"
                  placeholder="Ex: Responsable des entrées/sorties financières"
                  class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]" />
              </div>
            </div>

            <!-- Permissions Selection Header -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                <h4 class="font-bold text-gray-900 text-sm">Modules & Droits Autorisés</h4>
                <p class="text-xs text-gray-500">Cochez les sections visibles dans le menu pour ce profil</p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="selectAllPermissions()"
                  class="px-3 py-1.5 text-xs font-semibold text-[#008d36] bg-[#e6f3eb] rounded-lg hover:bg-[#008d36] hover:text-white transition-all">
                  Tout cocher
                </button>
                <button
                  type="button"
                  (click)="unselectAllPermissions()"
                  class="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all">
                  Tout décocher
                </button>
              </div>
            </div>

            <!-- Permissions by Category -->
            <div class="space-y-6">
              <div *ngFor="let cat of permissionCategories" class="space-y-3">
                <h5 class="text-xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-[#008d36]"></span>
                  {{ cat }}
                </h5>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    *ngFor="let m of getModulesByCategory(cat)"
                    (click)="togglePermission(m.id)"
                    class="p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none"
                    [ngClass]="isPermissionSelected(m.id) ? 'bg-[#e6f3eb]/40 border-[#008d36] shadow-sm' : 'bg-gray-50/50 border-gray-200 hover:bg-gray-50'">
                    
                    <input
                      type="checkbox"
                      [checked]="isPermissionSelected(m.id)"
                      (click)="$event.stopPropagation(); togglePermission(m.id)"
                      class="mt-1 w-4 h-4 text-[#008d36] rounded border-gray-300 focus:ring-[#008d36]" />

                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <i [class]="m.icon + ' text-sm text-[#008d36]'"></i>
                        <span class="font-bold text-sm text-gray-800 truncate">{{ m.label }}</span>
                      </div>
                      <p class="text-xs text-gray-500 mt-0.5 leading-snug">{{ m.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              (click)="showProfileModal = false"
              class="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              Annuler
            </button>
            <button
              (click)="saveProfile()"
              [disabled]="isSaving"
              class="px-6 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#008d36] rounded-xl transition-all shadow-sm flex items-center gap-2">
              <i *ngIf="isSaving" class="fa-solid fa-spinner animate-spin"></i>
              {{ isEditingProfile ? 'Enregistrer les modifications' : 'Créer le Profil' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- MODAL: CRÉER / MODIFIER UN MEMBRE                                 -->
      <!-- ================================================================= -->
      <div *ngIf="showUserModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <!-- Modal Header -->
          <div class="px-6 py-5 bg-[#022c16] text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <i class="fa-solid fa-user-gear text-white text-lg"></i>
              </div>
              <div>
                <h3 class="font-bold text-lg">
                  {{ isEditingUser ? 'Modifier le Membre' : 'Ajouter un Nouveau Membre' }}
                </h3>
                <p class="text-xs text-white/70">
                  Renseignez ses informations et assignez-lui son profil d'accès
                </p>
              </div>
            </div>
            <button (click)="showUserModal = false" class="text-white/70 hover:text-white text-xl">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4">
            <!-- Nom complet -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Nom complet <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="userForm.name"
                placeholder="Ex: Amadou Diallo"
                class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]" />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Adresse Email (identifiant de connexion) <span class="text-red-500">*</span>
              </label>
              <input
                type="email"
                [(ngModel)]="userForm.email"
                placeholder="amadou@gmail.com"
                class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]" />
            </div>

            <!-- Téléphone -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Numéro de Téléphone
              </label>
              <input
                type="tel"
                [(ngModel)]="userForm.telephone"
                placeholder="+221 77 000 00 00"
                class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]" />
            </div>

            <!-- Mot de passe -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Mot de passe {{ isEditingUser ? '(laisser vide pour ne pas modifier)' : '' }}
                <span *ngIf="!isEditingUser" class="text-red-500">*</span>
              </label>
              <input
                type="password"
                [(ngModel)]="userForm.password"
                placeholder="Minimum 6 caractères"
                class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]" />
            </div>

            <!-- Profil d'accès -->
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Profil & Rôle assigné <span class="text-red-500">*</span>
              </label>
              <select
                [(ngModel)]="userForm.profileId"
                class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]">
                <option value="" disabled>Sélectionner un profil d'accès</option>
                <option *ngFor="let p of profiles" [value]="p.id">
                  {{ p.name }} {{ p.isSystem ? '(Accès Total)' : '' }}
                </option>
              </select>
              <p class="text-[11px] text-gray-400 mt-1">
                L'utilisateur ne pourra accéder et visualiser que les modules cochés dans ce profil.
              </p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              (click)="showUserModal = false"
              class="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              Annuler
            </button>
            <button
              (click)="saveUser()"
              [disabled]="isSaving"
              class="px-6 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#008d36] rounded-xl transition-all shadow-sm flex items-center gap-2">
              <i *ngIf="isSaving" class="fa-solid fa-spinner animate-spin"></i>
              {{ isEditingUser ? 'Enregistrer' : 'Créer le Membre' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `],
})
export class AdminMembresComponent implements OnInit, OnDestroy {
  activeTab: 'users' | 'profiles' = 'users';
  isLoading = false;
  isSaving = false;
  private destroy$ = new Subject<void>();

  // Data
  users: AdminUserItem[] = [];
  filteredUsers: AdminUserItem[] = [];
  profiles: ProfileItem[] = [];
  permissionsCatalog: PermissionModuleItem[] = [];
  permissionCategories: string[] = [];

  // Filters
  searchQuery = '';
  selectedProfileFilter = 'ALL';
  selectedStatusFilter = 'ALL';

  // Profile Modal State
  showProfileModal = false;
  isEditingProfile = false;
  selectedProfile: ProfileItem | null = null;

  get profileModalTitle(): string {
    return this.isEditingProfile ? "Modifier le Profil d'Accès" : "Nouveau Profil d'Accès";
  }

  profileForm = {
    name: '',
    description: '',
    permissions: [] as string[],
  };

  // User Modal State
  showUserModal = false;
  isEditingUser = false;
  selectedUser: AdminUserItem | null = null;
  userForm = {
    name: '',
    email: '',
    telephone: '',
    password: '',
    profileId: '',
  };

  // Dialog & Alert Popups
  showAlertPopup = false;
  alertMessage = '';
  alertType: AlertType = 'success';

  showConfirmDialog = false;
  confirmTitle = '';
  confirmMessage = '';
  pendingAction: (() => void) | null = null;

  constructor(
    private profileService: ProfileAdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllData() {
    this.isLoading = true;
    this.cdr.markForCheck();

    forkJoin({
      permissions: this.profileService.getPermissions(),
      profiles: this.profileService.getProfiles(),
      users: this.profileService.getUsers(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ permissions, profiles, users }) => {
          this.permissionsCatalog = permissions.data || [];
          this.permissionCategories = Array.from(
            new Set(this.permissionsCatalog.map(p => p.category))
          );
          this.profiles = profiles.data || [];
          this.users = users.data || [];
          this.applyFilters();
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: err => {
          this.isLoading = false;
          this.triggerAlert('Erreur lors du chargement des données', 'error');
          this.cdr.markForCheck();
        },
      });
  }

  // --- Filters ---
  onFilterChange() {
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.users];

    // Search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(
        u =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.telephone && u.telephone.includes(q))
      );
    }

    // Profile filter
    if (this.selectedProfileFilter !== 'ALL') {
      result = result.filter(u => u.profileId === this.selectedProfileFilter);
    }

    // Status filter
    if (this.selectedStatusFilter === 'ACTIVE') {
      result = result.filter(u => u.actif);
    } else if (this.selectedStatusFilter === 'INACTIVE') {
      result = result.filter(u => !u.actif);
    }

    this.filteredUsers = result;
    this.cdr.markForCheck();
  }

  // --- Profile Helpers ---
  isWildcard(profile: ProfileItem): boolean {
    return profile.permissions.includes('*');
  }

  getModulesByCategory(category: string): PermissionModuleItem[] {
    return this.permissionsCatalog.filter(m => m.category === category);
  }

  getPermissionLabel(permId: string): string {
    const item = this.permissionsCatalog.find(p => p.id === permId);
    return item?.label || permId;
  }

  getPermissionIcon(permId: string): string {
    const item = this.permissionsCatalog.find(p => p.id === permId);
    return item?.icon || 'fa-solid fa-check';
  }

  isPermissionSelected(permId: string): boolean {
    return (
      this.profileForm.permissions.includes('*') ||
      this.profileForm.permissions.includes(permId)
    );
  }

  togglePermission(permId: string) {
    if (this.profileForm.permissions.includes('*')) {
      // De-wildcard to all except this one
      this.profileForm.permissions = this.permissionsCatalog
        .map(p => p.id)
        .filter(id => id !== permId);
      return;
    }

    const idx = this.profileForm.permissions.indexOf(permId);
    if (idx >= 0) {
      this.profileForm.permissions.splice(idx, 1);
    } else {
      this.profileForm.permissions.push(permId);
    }
  }

  selectAllPermissions() {
    this.profileForm.permissions = this.permissionsCatalog.map(p => p.id);
  }

  unselectAllPermissions() {
    this.profileForm.permissions = [];
  }

  // --- Profile Modal & Actions ---
  openCreateProfileModal() {
    this.isEditingProfile = false;
    this.selectedProfile = null;
    this.profileForm = {
      name: '',
      description: '',
      permissions: ['dashboard'],
    };
    this.showProfileModal = true;
    this.cdr.markForCheck();
  }

  openEditProfileModal(profile: ProfileItem) {
    this.isEditingProfile = true;
    this.selectedProfile = profile;
    this.profileForm = {
      name: profile.name,
      description: profile.description || '',
      permissions: [...profile.permissions],
    };
    this.showProfileModal = true;
    this.cdr.markForCheck();
  }

  saveProfile() {
    if (!this.profileForm.name.trim()) {
      this.triggerAlert('Le nom du profil est requis', 'error');
      return;
    }

    this.isSaving = true;
    this.cdr.markForCheck();

    if (this.isEditingProfile && this.selectedProfile) {
      this.profileService
        .updateProfile(this.selectedProfile.id, this.profileForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.showProfileModal = false;
            this.triggerAlert('Profil mis à jour avec succès', 'success');
            this.loadAllData();
          },
          error: err => {
            this.isSaving = false;
            this.triggerAlert(err?.error?.message || 'Erreur lors de la mise à jour', 'error');
            this.cdr.markForCheck();
          },
        });
    } else {
      this.profileService
        .createProfile(this.profileForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.showProfileModal = false;
            this.triggerAlert('Profil créé avec succès', 'success');
            this.loadAllData();
          },
          error: err => {
            this.isSaving = false;
            this.triggerAlert(err?.error?.message || 'Erreur lors de la création', 'error');
            this.cdr.markForCheck();
          },
        });
    }
  }

  confirmDeleteProfile(profile: ProfileItem) {
    this.confirmTitle = 'Supprimer le profil ?';
    this.confirmMessage = `Êtes-vous sûr de vouloir supprimer le profil "${profile.name}" ? Cette action est irréversible.`;
    this.pendingAction = () => {
      this.profileService
        .deleteProfile(profile.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.triggerAlert('Profil supprimé avec succès', 'success');
            this.loadAllData();
          },
          error: err => {
            this.triggerAlert(err?.error?.message || 'Erreur lors de la suppression', 'error');
          },
        });
    };
    this.showConfirmDialog = true;
    this.cdr.markForCheck();
  }

  // --- User Modal & Actions ---
  openCreateUserModal() {
    this.isEditingUser = false;
    this.selectedUser = null;
    this.userForm = {
      name: '',
      email: '',
      telephone: '',
      password: '',
      profileId: this.profiles[0]?.id || '',
    };
    this.showUserModal = true;
    this.cdr.markForCheck();
  }

  openEditUserModal(user: AdminUserItem) {
    this.isEditingUser = true;
    this.selectedUser = user;
    this.userForm = {
      name: user.name,
      email: user.email,
      telephone: user.telephone || '',
      password: '',
      profileId: user.profileId || '',
    };
    this.showUserModal = true;
    this.cdr.markForCheck();
  }

  saveUser() {
    if (!this.userForm.name.trim() || !this.userForm.email.trim()) {
      this.triggerAlert('Le nom et l\'adresse email sont requis', 'error');
      return;
    }

    if (!this.isEditingUser && !this.userForm.password.trim()) {
      this.triggerAlert('Le mot de passe initial est requis', 'error');
      return;
    }

    this.isSaving = true;
    this.cdr.markForCheck();

    if (this.isEditingUser && this.selectedUser) {
      const payload: any = {
        name: this.userForm.name,
        email: this.userForm.email,
        telephone: this.userForm.telephone,
        profileId: this.userForm.profileId || undefined,
      };
      if (this.userForm.password.trim()) {
        payload.password = this.userForm.password.trim();
      }

      this.profileService
        .updateUser(this.selectedUser.id, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.showUserModal = false;
            this.triggerAlert('Membre mis à jour avec succès', 'success');
            this.loadAllData();
          },
          error: err => {
            this.isSaving = false;
            this.triggerAlert(err?.error?.message || 'Erreur lors de la mise à jour', 'error');
            this.cdr.markForCheck();
          },
        });
    } else {
      this.profileService
        .createUser({
          name: this.userForm.name,
          email: this.userForm.email,
          telephone: this.userForm.telephone,
          password: this.userForm.password,
          profileId: this.userForm.profileId || undefined,
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isSaving = false;
            this.showUserModal = false;
            this.triggerAlert('Membre créé avec succès', 'success');
            this.loadAllData();
          },
          error: err => {
            this.isSaving = false;
            this.triggerAlert(err?.error?.message || 'Erreur lors de la création', 'error');
            this.cdr.markForCheck();
          },
        });
    }
  }

  toggleUserStatus(user: AdminUserItem) {
    const newStatus = !user.actif;
    this.profileService
      .updateUser(user.id, { actif: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          user.actif = newStatus;
          this.triggerAlert(`Compte ${newStatus ? 'activé' : 'désactivé'}`, 'success');
          this.cdr.markForCheck();
        },
        error: err => {
          this.triggerAlert(err?.error?.message || 'Erreur de mise à jour', 'error');
        },
      });
  }

  confirmDeleteUser(user: AdminUserItem) {
    this.confirmTitle = 'Supprimer le membre ?';
    this.confirmMessage = `Êtes-vous sûr de vouloir supprimer le compte de ${user.name} (${user.email}) ?`;
    this.pendingAction = () => {
      this.profileService
        .deleteUser(user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.triggerAlert('Membre supprimé avec succès', 'success');
            this.loadAllData();
          },
          error: err => {
            this.triggerAlert(err?.error?.message || 'Erreur lors de la suppression', 'error');
          },
        });
    };
    this.showConfirmDialog = true;
    this.cdr.markForCheck();
  }

  onConfirmAction() {
    this.showConfirmDialog = false;
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
  }

  triggerAlert(message: string, type: AlertType = 'success') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertPopup = true;
    this.cdr.markForCheck();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }
}
