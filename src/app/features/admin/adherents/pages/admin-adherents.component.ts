import { BulkDeleteService } from '../../../../core/services/bulk-delete.service';
import { BulkActionsBarComponent } from '../../../../shared/components/bulk-actions-bar/bulk-actions-bar.component';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Subject, takeUntil } from 'rxjs';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';

@Component({
  selector: 'app-admin-adherents',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, AlertPopupComponent, BulkActionsBarComponent],
  template: `
<div class="animate-fade-in-up max-w-[1600px] mx-auto">
  <!-- Page Header -->
  <div class="flex items-center justify-between mb-8">
    <div>
      <h2 class="text-[28px] font-black text-gray-900 tracking-tight">Adhérents</h2>
      <p class="text-[15px] text-gray-500 mt-1"><span class="font-bold text-[#008d36]">{{ total }}</span> membres inscrits au mouvement.</p>
    </div>
    <div class="flex items-center gap-3 flex-wrap justify-end">
      <button (click)="downloadSelectedBadges()" [disabled]="selectedIds.size === 0 || isDownloading"
        class="px-4 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-amber-600 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
        <i class="fa-solid fa-id-badge"></i> Badges sélectionnés ({{ selectedIds.size }})
      </button>
      <button (click)="openCreateModal()" class="px-5 py-3 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-[0_4px_12px_rgba(2,44,22,0.15)] hover:bg-[#008d36] transition-all flex items-center gap-2 shrink-0">
        <i class="fa-solid fa-user-plus"></i> Ajouter un adhérent
      </button>
    </div>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
    <!-- Stat 1 -->
    <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex gap-4">
      <div class="w-12 h-12 rounded-full bg-[#e6f3eb] flex items-center justify-center shrink-0">
        <i class="fa-solid fa-users text-[#008d36] text-xl"></i>
      </div>
      <div>
        <p class="text-[12px] text-gray-500 font-medium">Total adhérents</p>
        <h3 class="text-xl font-black text-gray-900 leading-tight mt-0.5">{{ total }}</h3>
        <p class="text-[11px] font-bold text-[#008d36] mt-1 flex items-center gap-1">+ 18 <span class="font-medium text-gray-400">ce mois</span> <i class="fa-solid fa-arrow-trend-up"></i></p>
      </div>
    </div>
    <!-- Stat 2 -->
    <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex gap-4">
      <div class="w-12 h-12 rounded-full bg-[#e6f3eb] flex items-center justify-center shrink-0">
        <i class="fa-regular fa-circle-check text-[#008d36] text-xl"></i>
      </div>
      <div>
        <p class="text-[12px] text-gray-500 font-medium">Nouveaux ce mois</p>
        <h3 class="text-xl font-black text-gray-900 leading-tight mt-0.5">18</h3>
        <p class="text-[11px] font-bold text-[#008d36] mt-1 flex items-center gap-1">+ 18 <span class="font-medium text-gray-400">ce mois</span> <i class="fa-solid fa-arrow-trend-up"></i></p>
      </div>
    </div>
    <!-- Stat 3 -->
    <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex gap-4">
      <div class="w-12 h-12 rounded-full bg-[#e6f3eb] flex items-center justify-center shrink-0">
        <i class="fa-solid fa-location-dot text-[#008d36] text-xl"></i>
      </div>
      <div>
        <p class="text-[12px] text-gray-500 font-medium">Quartiers</p>
        <h3 class="text-xl font-black text-gray-900 leading-tight mt-0.5">6</h3>
        <p class="text-[11px] font-bold text-[#008d36] mt-1 hover:underline cursor-pointer">Voir la répartition ></p>
      </div>
    </div>
    <!-- Stat 4 -->
    <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex gap-4">
      <div class="w-12 h-12 rounded-full bg-[#e6f3eb] flex items-center justify-center shrink-0">
        <i class="fa-regular fa-calendar-check text-[#008d36] text-xl"></i>
      </div>
      <div>
        <p class="text-[12px] text-gray-500 font-medium">Adhésions ce mois</p>
        <h3 class="text-xl font-black text-gray-900 leading-tight mt-0.5">24</h3>
        <p class="text-[11px] font-bold text-[#008d36] mt-1 flex items-center gap-1">+ 5 <span class="font-medium text-gray-400">ce mois</span> <i class="fa-solid fa-arrow-trend-up"></i></p>
      </div>
    </div>
    <!-- Stat 5 -->
    <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex gap-4">
      <div class="w-12 h-12 rounded-full bg-[#e6f3eb] flex items-center justify-center shrink-0">
        <i class="fa-regular fa-id-badge text-[#008d36] text-xl"></i>
      </div>
      <div>
        <p class="text-[12px] text-gray-500 font-medium">Pièces validées</p>
        <h3 class="text-xl font-black text-gray-900 leading-tight mt-0.5">1 102</h3>
        <p class="text-[11px] font-bold text-[#008d36] mt-1 flex items-center gap-1">88% <span class="font-medium text-gray-400">validées</span> <i class="fa-solid fa-arrow-trend-up"></i></p>
      </div>
    </div>
  </div>

  <!-- Filters Row -->
  <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
    <div class="relative flex-1 min-w-[300px]">
      <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
      <input type="text" placeholder="Rechercher un adhérent, contact, quartier..." class="w-full bg-white border border-gray-200 text-[13px] font-medium text-gray-700 rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-[#008d36] focus:ring-1 focus:ring-[#008d36] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all">
    </div>
    
    <div class="flex items-center gap-3">
      <!-- Select Quartier -->
      <div class="bg-white border border-gray-200 rounded-xl px-4 py-2 flex flex-col justify-center min-w-[140px] h-[52px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:border-gray-300 transition-colors">
        <span class="text-[10px] font-bold text-gray-500 leading-tight">Quartier</span>
        <div class="flex items-center justify-between mt-0.5">
          <span class="text-[13px] font-semibold text-gray-800">Tous</span>
          <i class="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
        </div>
      </div>
      <!-- Select Statut -->
      <div class="bg-white border border-gray-200 rounded-xl px-4 py-2 flex flex-col justify-center min-w-[140px] h-[52px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:border-gray-300 transition-colors">
        <span class="text-[10px] font-bold text-gray-500 leading-tight">Statut</span>
        <div class="flex items-center justify-between mt-0.5">
          <span class="text-[13px] font-semibold text-gray-800">Tous</span>
          <i class="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
        </div>
      </div>
      <!-- Select Date -->
      <div class="bg-white border border-gray-200 rounded-xl px-4 py-2 flex flex-col justify-center min-w-[160px] h-[52px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:border-gray-300 transition-colors">
        <span class="text-[10px] font-bold text-gray-500 leading-tight">Date d'adhésion</span>
        <div class="flex items-center justify-between mt-0.5">
          <span class="text-[13px] font-semibold text-gray-800">Toutes les dates</span>
          <i class="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
        </div>
      </div>
      <!-- Filtres Button -->
      <button class="bg-[#e6f3eb] text-[#008d36] border border-[#d1e8d9] rounded-xl px-5 h-[52px] text-sm font-bold flex items-center gap-2 hover:bg-[#d1e8d9] transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <i class="fa-solid fa-filter"></i> Filtres
      </button>
    </div>
  </div>

  <div *ngIf="isLoading" class="flex items-center justify-center py-20">
    <div class="text-center">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#008d36] mb-3"></i>
      <p class="text-gray-500 text-sm font-medium">Chargement des adhérents...</p>
    </div>
  </div>

  <!-- Select All Bar -->
  <div *ngIf="!isLoading && adherents.length > 0" class="mb-4 flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100">
    <input type="checkbox" [checked]="selectedIds.size === adherents.length && adherents.length > 0" (change)="toggleAllSelection()" class="w-4 h-4 cursor-pointer accent-[#008d36]">
    <span class="text-sm font-semibold text-gray-600">Sélectionner tout ({{ adherents.length }})</span>
    <span *ngIf="selectedIds.size > 0" class="ml-2 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">{{ selectedIds.size }} sélectionné(s)</span>
  </div>

  <!-- Data Table -->
  <div *ngIf="!isLoading" class="bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-[#e2e8f0]/60 text-[10px] font-black text-gray-500 uppercase tracking-wider">
            <th class="p-4 pl-4 w-10"><input type="checkbox" [checked]="selectedIds.size === adherents.length && adherents.length > 0" (change)="toggleAllSelection()" class="w-4 h-4 cursor-pointer accent-[#008d36]"></th>
            <th class="p-4 py-3 pl-2">ADHÉRENT</th>
            <th class="p-4 py-3">CONTACT</th>
            <th class="p-4 py-3">QUARTIER</th>
            <th class="p-4 py-3">DATE D'ADHÉSION</th>
            <th class="p-4 py-3">STATUT</th>
            <th class="p-4 py-3">PIÈCE D'IDENTITÉ</th>
            <th class="p-4 py-3 text-center w-20 pr-6">ACTIONS</th>
          </tr>
        </thead>
        <tbody class="text-sm divide-y divide-gray-100/60">
          <tr *ngFor="let a of adherents" class="hover:bg-gray-50/70 transition-colors group" [class.bg-red-50]="isSelected(a.id)">
            <td class="p-4 pl-4">
              <input type="checkbox" [checked]="isSelected(a.id)" (change)="toggleSelection(a.id)" class="w-4 h-4 cursor-pointer accent-[#008d36]">
            </td>
            <td class="p-4 pl-6 py-5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-[#e6f3eb] text-[#008d36] font-bold flex items-center justify-center text-xs shrink-0">
                  {{ a.prenom.charAt(0) }}
                </div>
                <div>
                  <span class="font-semibold text-gray-800 block text-[13px]">{{ a.prenom }} {{ a.nom }}</span>
                  <span *ngIf="a.profession" class="text-[11px] text-gray-400 block mt-0.5">{{ a.profession }}</span>
                </div>
              </div>
            </td>
            <td class="p-4 text-gray-500 font-medium text-[13px]">{{ a.telephone }}</td>
            <td class="p-4 text-gray-600 font-medium text-[13px]">{{ a.quartier }}</td>
            <td class="p-4 text-gray-500 font-medium text-[13px]">{{ a.createdAt | date: 'dd/MM/yyyy' }}</td>
            <td class="p-4">
              <span [class]="getStatutClass(a.statut)" class="text-[10px] font-bold px-2.5 py-1 rounded-md">{{ a.statut }}</span>
            </td>
            <td class="p-4">
              <button *ngIf="a.carteRectoUrl || a.carteVersoUrl" (click)="viewIdCard(a)" class="text-[11px] font-bold text-[#008d36] bg-[#e6f3eb] hover:bg-[#d1e8d9] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 w-max">
                <i class="fa-solid fa-id-card"></i> Voir pièce
              </button>
              <span *ngIf="!a.carteRectoUrl && !a.carteVersoUrl" class="text-[11px] font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg w-max inline-block">Aucune</span>
            </td>
            <td class="p-4 text-center pr-6">
              <div class="flex items-center justify-end gap-1.5">
                <button *ngIf="a.statut !== 'ACTIF'" (click)="action('Activer', a.id)" class="px-3 py-1.5 bg-[#008d36] text-white text-[11px] font-bold rounded-lg hover:bg-[#022c16] transition-colors flex items-center gap-1.5 shadow-sm mr-1">
                  <i class="fa-solid fa-check"></i> Activer
                </button>
                <button (click)="downloadBadge(a)" [disabled]="isDownloading" title="Télécharger le badge PNG"
                  class="w-8 h-8 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-colors disabled:opacity-50" >
                  <i class="fa-solid fa-id-badge text-xs"></i>
                </button>
                <button (click)="openEditModal(a)" class="w-8 h-8 rounded-full bg-transparent text-gray-400 hover:text-[#008d36] hover:bg-[#e6f3eb] flex items-center justify-center transition-colors" title="Détails">
                  <i class="fa-regular fa-eye text-xs"></i>
                </button>
                <div class="relative group/dropdown">
                  <button class="w-8 h-8 rounded-full bg-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <i class="fa-solid fa-ellipsis text-xs"></i>
                  </button>
                  <div class="absolute right-0 top-full mt-1 bg-white border border-gray-100 shadow-lg rounded-xl py-2 w-32 hidden group-hover/dropdown:block z-10 text-left">
                    <button (click)="openEditModal(a)" class="w-full text-left px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#008d36]">Modifier</button>
                    <button (click)="action('Supprimer', a.id)" class="w-full text-left px-4 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50">Supprimer</button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Pagination -->
  <div *ngIf="!isLoading && adherents.length > 0" class="mt-6 flex flex-wrap items-center justify-between gap-4">
    <p class="text-[13px] text-gray-500 font-medium">Affichage de 1 à {{ adherents.length }} sur {{ total }} résultats</p>
    
    <div class="flex items-center justify-center flex-1">
      <div class="flex items-center gap-1">
        <button class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white hover:shadow-sm hover:border border-gray-200 transition-all bg-gray-50/50"><i class="fa-solid fa-chevron-left text-[10px]"></i></button>
        <button class="w-8 h-8 rounded-lg flex items-center justify-center bg-[#022c16] text-white text-xs font-bold shadow-sm">1</button>
        <button class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-xs hover:bg-white hover:shadow-sm hover:border border-gray-200 transition-all bg-transparent">2</button>
        <button class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-xs hover:bg-white hover:shadow-sm hover:border border-gray-200 transition-all bg-transparent">3</button>
        <span class="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">...</span>
        <button class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-xs hover:bg-white hover:shadow-sm hover:border border-gray-200 transition-all bg-transparent">125</button>
        <button class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white hover:shadow-sm hover:border border-gray-200 transition-all bg-gray-50/50"><i class="fa-solid fa-chevron-right text-[10px]"></i></button>
      </div>
    </div>
      
    <div class="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center justify-between gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer hover:border-gray-300 transition-colors">
      <span class="text-[13px] font-semibold text-gray-700">10 par page</span>
      <i class="fa-solid fa-chevron-down text-[10px] text-gray-400"></i>
    </div>
  </div>

  <!-- Create/Edit Modal -->
  <div *ngIf="showModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
      <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 class="font-black text-gray-900 text-lg">{{ isEditing ? 'Modifier l\\'adhérent' : 'Nouvel Adhérent' }}</h3>
        <button (click)="showModal = false" class="text-gray-400 hover:text-gray-700 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="p-6 space-y-4">
        <!-- Forms fields with white background, gray borders -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Prénom <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.prenom" class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#008d36] focus:ring-1 focus:ring-[#008d36] transition-all text-gray-800 placeholder-gray-400" placeholder="Prénom">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Nom <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.nom" class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#008d36] focus:ring-1 focus:ring-[#008d36] transition-all text-gray-800 placeholder-gray-400" placeholder="Nom">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Téléphone <span class="text-red-500">*</span></label>
            <input type="tel" [(ngModel)]="formData.telephone" class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#008d36] focus:ring-1 focus:ring-[#008d36] transition-all text-gray-800 placeholder-gray-400" placeholder="77 123 45 67">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Quartier <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.quartier" class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#008d36] focus:ring-1 focus:ring-[#008d36] transition-all text-gray-800 placeholder-gray-400" placeholder="Ex: Médina">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Profession</label>
            <input type="text" [(ngModel)]="formData.profession" class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#008d36] focus:ring-1 focus:ring-[#008d36] transition-all text-gray-800 placeholder-gray-400" placeholder="Ex: Enseignant">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Disponibilité</label>
            <select [(ngModel)]="formData.disponibilite" class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#008d36] focus:ring-1 focus:ring-[#008d36] transition-all text-gray-800">
              <option value="">Sélectionner</option>
              <option value="Temps plein">Temps plein</option>
              <option value="Temps partiel">Temps partiel</option>
              <option value="Week-end">Week-end</option>
              <option value="Soirées">Soirées</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1.5">Compétences / Motivation</label>
          <textarea [(ngModel)]="formData.competences" rows="2" class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#008d36] focus:ring-1 focus:ring-[#008d36] transition-all text-gray-800 placeholder-gray-400 resize-none" placeholder="Compétences ou motivation..."></textarea>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 mb-2">Pièce d'identité (optionnel)</label>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Recto</label>
              <input type="text" [(ngModel)]="formData.carteRectoUrl" class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#008d36] focus:ring-1 focus:ring-[#008d36] transition-all text-gray-800 placeholder-gray-400" placeholder="URL image recto">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Verso</label>
              <input type="text" [(ngModel)]="formData.carteVersoUrl" class="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#008d36] focus:ring-1 focus:ring-[#008d36] transition-all text-gray-800 placeholder-gray-400" placeholder="URL image verso">
            </div>
          </div>
        </div>
        <div class="mt-8 flex justify-end gap-3 pt-2">
          <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Annuler</button>
          <button (click)="submitForm()" class="px-5 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#008d36] rounded-xl transition-colors shadow-lg">
            {{ isEditing ? 'Enregistrer' : 'Ajouter un adhérent' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- IdCard View Modal -->
  <div *ngIf="showIdCardModal" class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4" (click)="closeIdCard()">
    <div class="bg-white rounded-3xl shadow-2xl max-w-5xl w-full p-6 animate-fade-in-up" (click)="$event.stopPropagation()">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-black text-xl text-gray-900 flex items-center gap-2">
          <i class="fa-solid fa-id-card text-[#008d36]"></i>
          Pièce d'identité — {{ selectedAdherent?.prenom }} {{ selectedAdherent?.nom }}
        </h3>
        <button (click)="closeIdCard()" class="text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="text-center">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recto</p>
          <div class="relative bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center" style="min-height: 220px;">
            <img *ngIf="selectedAdherent?.carteRectoUrl" [src]="selectedAdherent.carteRectoUrl" class="w-full h-auto object-contain" style="max-height: 400px;">
            <div *ngIf="!selectedAdherent?.carteRectoUrl" class="text-center text-gray-400 py-10">
              <i class="fa-solid fa-image text-3xl mb-2"></i>
              <p class="text-sm font-medium">Recto non disponible</p>
            </div>
          </div>
        </div>
        <div class="text-center">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Verso</p>
          <div class="relative bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center" style="min-height: 220px;">
            <img *ngIf="selectedAdherent?.carteVersoUrl" [src]="selectedAdherent.carteVersoUrl" class="w-full h-auto object-contain" style="max-height: 400px;">
            <div *ngIf="!selectedAdherent?.carteVersoUrl" class="text-center text-gray-400 py-10">
              <i class="fa-solid fa-image text-3xl mb-2"></i>
              <p class="text-sm font-medium">Verso non disponible</p>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-8 flex justify-between items-center border-t border-gray-100 pt-6">
        <div class="flex gap-3 flex-wrap">
          <button (click)="downloadIdCard('png')" [disabled]="isDownloading" class="px-5 py-2.5 text-sm font-bold text-white bg-[#008d36] hover:bg-[#022c16] rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-50">
            <i class="fa-solid fa-image" *ngIf="!isDownloading"></i>
            <i class="fa-solid fa-spinner fa-spin" *ngIf="isDownloading"></i>
            Pièce identité PNG
          </button>
          <button (click)="downloadIdCard('pdf')" [disabled]="isDownloading" class="px-5 py-2.5 text-sm font-bold text-[#008d36] bg-[#e6f3eb] hover:bg-[#d1e8d9] rounded-xl transition-all flex items-center gap-2 disabled:opacity-50">
            <i class="fa-solid fa-file-pdf" *ngIf="!isDownloading"></i>
            <i class="fa-solid fa-spinner fa-spin" *ngIf="isDownloading"></i>
            Pièce identité PDF
          </button>
          <button (click)="downloadBadge(selectedAdherent)" [disabled]="isDownloading" class="px-5 py-2.5 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-50">
            <i class="fa-solid fa-id-badge" *ngIf="!isDownloading"></i>
            <i class="fa-solid fa-spinner fa-spin" *ngIf="isDownloading"></i>
            Badge PNG
          </button>
          <div class="flex gap-2">
            <button *ngIf="selectedAdherent?.carteRectoUrl" (click)="downloadImageDirect(selectedAdherent.carteRectoUrl, 'recto_' + selectedAdherent.prenom + '_' + selectedAdherent.nom)" class="px-4 py-2.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all flex items-center gap-2">
              <i class="fa-solid fa-download"></i> Recto
            </button>
            <button *ngIf="selectedAdherent?.carteVersoUrl" (click)="downloadImageDirect(selectedAdherent.carteVersoUrl, 'verso_' + selectedAdherent.prenom + '_' + selectedAdherent.nom)" class="px-4 py-2.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all flex items-center gap-2">
              <i class="fa-solid fa-download"></i> Verso
            </button>
          </div>
        </div>
        <button (click)="closeIdCard()" class="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Fermer</button>
      </div>
    </div>
  </div>

  <!-- Offscreen template for export -->
  <div *ngIf="selectedAdherent" id="id-card-export" style="width: 800px; padding: 40px; position: absolute; left: -9999px; top: -9999px; background: white; z-index: -1;">
    <div style="border: 4px solid #008d36; border-radius: 20px; padding: 40px; background: #fafafa; font-family: sans-serif;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eaeaea; padding-bottom: 20px;">
        <h2 style="font-size: 32px; color: #022c16; margin: 0; font-weight: 900; text-transform: uppercase;">CARTE D'IDENTITÉ</h2>
        <p style="font-size: 18px; color: #666; margin-top: 10px; font-weight: bold;">JÀMM AK XÉEWAL - THIÈS NORD</p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; font-size: 20px; color: #333;">
        <div><strong style="color: #022c16;">Prénom :</strong> {{ selectedAdherent.prenom }}</div>
        <div><strong style="color: #022c16;">Nom :</strong> {{ selectedAdherent.nom }}</div>
        <div><strong style="color: #022c16;">Téléphone :</strong> {{ selectedAdherent.telephone }}</div>
        <div><strong style="color: #022c16;">Quartier :</strong> {{ selectedAdherent.quartier }}</div>
      </div>

      <div style="text-align: center; margin-bottom: 40px;" *ngIf="exportRectoB64">
        <div style="display: inline-block; padding: 10px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <h3 style="color: #888; text-transform: uppercase; margin: 0 0 15px 0; font-size: 14px; font-weight: bold;">Recto</h3>
          <img [src]="exportRectoB64" crossorigin="anonymous" style="max-width: 100%; max-height: 350px; border-radius: 8px;">
        </div>
      </div>

      <div style="text-align: center;" *ngIf="exportVersoB64">
        <div style="display: inline-block; padding: 10px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <h3 style="color: #888; text-transform: uppercase; margin: 0 0 15px 0; font-size: 14px; font-weight: bold;">Verso</h3>
          <img [src]="exportVersoB64" crossorigin="anonymous" style="max-width: 100%; max-height: 350px; border-radius: 8px;">
        </div>
      </div>
    </div>
  </div>

  <app-alert-popup [visible]="showAlert" [type]="alertType" [title]="alertTitle" [message]="alertMessage" (close)="showAlert = false"></app-alert-popup>
  <app-confirm-dialog [visible]="showConfirmDialog" [title]="confirmTitle" message="Cette action est irréversible." (confirm)="confirmDelete()" (cancel)="showConfirmDialog = false"></app-confirm-dialog>

  <!-- Offscreen template for citizen digital card -->
  <div id="citizen-card-export" *ngIf="badgeAdherent" class="w-[384px] absolute left-[-9999px] top-[-9999px] z-[-1]">
    <div class="relative rounded-[2rem] overflow-hidden shadow-2xl bg-gradient-to-br from-[#024c26] to-[#01a646]">
      <div class="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.08] text-[200px] leading-none pointer-events-none translate-x-1/4 text-brand-dark"><i class="fa-brands fa-pagelines"></i></div>
      
      <!-- Header -->
      <div class="p-4 flex justify-between items-start relative z-10">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-sm">
            <img src="assets/icons/icon-192x192.png" alt="Logo" class="w-full h-full object-contain p-0.5">
          </div>
          <div class="text-white"><p class="text-[11px] font-black uppercase m-0">JÀMM AK XÉEWAL</p></div>
        </div>
        <div class="font-bold px-2 py-1 rounded-full text-[9px] flex items-center gap-1 bg-brand-yellow text-brand-dark m-0">
          <i class="fa-solid fa-crown"></i> Membre Officiel
        </div>
      </div>

      <!-- Contenu Central : Identité & QR Code -->
      <div class="px-5 flex justify-between items-center relative z-10 pb-20 pt-2 w-full">
          <!-- Bloc Identité (Gauche) -->
          <div class="flex items-center gap-4 flex-1 min-w-0">
              <!-- Photo de l'adhérent -->
              <div class="w-16 h-16 rounded-full flex items-center justify-center shrink-0 relative overflow-hidden border-2 border-transparent shadow-md bg-brand-yellow">
                  <i class="fa-solid fa-user text-4xl mt-3 text-[#024c26]"></i>
              </div>

              <!-- Informations -->
              <div class="text-white truncate">
                  <p class="text-white/80 text-[10px] tracking-wide mb-0.5 font-medium m-0">Nom & Prénom</p>
                  <h3 class="text-[17px] font-black uppercase truncate tracking-tight m-0">{{ badgeAdherent?.prenom || 'XÉEWAL' }} {{ badgeAdherent?.nom || 'JÀMM AK' }}</h3>

                  <div class="flex items-center gap-1.5 mt-1 text-brand-yellow">
                      <i class="fa-solid fa-location-dot text-[14px] mt-0.5"></i>
                      <div>
                          <p class="text-white/80 text-[8px] tracking-wide leading-none font-medium m-0">Quartier</p>
                          <p class="text-white font-bold text-[11px] leading-none mt-1 m-0">{{ badgeAdherent?.quartier || 'Thiès-Nord' }}</p>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Bloc QR Code (Droite) -->
          <div class="flex flex-col items-center justify-center shrink-0 ml-2 relative group">
              <div class="bg-white p-2 rounded-xl shadow-lg relative overflow-hidden border-2 border-brand-yellow">
                  <img [src]="badgeAdherent?.id
                          ? 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=022c16&bgcolor=ffffff&margin=8&data=' + encodeURIComponent(baseUrl + '/membre/' + badgeAdherent.id)
                          : 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=022c16&data=membre'"
                       class="w-[72px] h-[72px] object-contain relative z-10" alt="QR Code d'identité" crossorigin="anonymous">
              </div>
              <p class="text-white/90 text-[7.5px] mt-1.5 font-medium tracking-wide flex items-center gap-1 m-0">
                  Carte Électronique <i class="fa-solid fa-wifi rotate-45 text-brand-yellow"></i>
              </p>
          </div>
      </div>

      <!-- Pied de la Carte : Vague Dorée ou Grise -->
      <div class="absolute bottom-0 left-0 w-full z-20 flex justify-between items-center px-2 py-3 rounded-t-[1.5rem] shadow-[0_-5px_20px_rgba(0,0,0,0.2)] bg-gradient-to-b from-brand-yellow via-yellow-400 to-yellow-500 text-brand-dark">
          <div class="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-t-[1.5rem] pointer-events-none"></div>

          <!-- Adhésion -->
          <div class="flex items-center gap-2 relative z-20 flex-1 justify-center border-r border-brand-dark/10">
              <i class="fa-regular fa-calendar-days text-[18px] text-brand-dark/80"></i>
              <div class="text-left">
                  <p class="text-[8px] font-semibold tracking-wide m-0">Adhésion</p>
                  <p class="font-black text-[10px] leading-tight mt-0.5 m-0">2024 – 2026</p>
              </div>
          </div>

          <!-- Statut -->
          <div class="flex items-center gap-2 relative z-20 flex-1 justify-center border-r border-brand-dark/10">
              <i class="fa-regular fa-user text-[18px] text-brand-dark/80"></i>
              <div class="text-left">
                  <p class="text-[8px] font-semibold tracking-wide m-0">Statut</p>
                  <p class="font-black text-[10px] leading-tight mt-0.5 m-0">Membre Actif</p>
              </div>
          </div>

          <!-- N° Membre -->
          <div class="flex items-center gap-2 relative z-20 flex-1 justify-center">
              <i class="fa-regular fa-star text-[18px] text-brand-dark/80"></i>
              <div class="text-left">
                  <p class="text-[8px] font-semibold tracking-wide m-0">N° Membre</p>
                  <p class="font-black text-[10px] leading-tight mt-0.5 m-0">JA-{{ badgeAdherent?.id ? badgeAdherent.id.toString().substring(0,4) : '4587' }}</p>
              </div>
          </div>
      </div>
    </div>
  </div>


    <!-- Bulk Actions Bar -->
    <app-bulk-actions-bar
      [selectedCount]="selectedIds.size"
      [loading]="loadingBulk"
      (deleteSelected)="bulkDeleteSelected()"
      (deleteAll)="bulkDeleteAll()"
      (clear)="clearSelection()">
    </app-bulk-actions-bar>

</div>
  `
})
export class AdminadherentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  adherents: any[] = [];
  total = 0;
  isLoading = true;
  isDownloading = false;
  badgeAdherent: any = null;
  baseUrl = typeof window !== 'undefined' ? window.location.origin : environment.publicUrl;

  encodeURIComponent(uri: string): string {
    return encodeURIComponent(uri);
  }

  showModal = false;
  isEditing = false;
  editingId: string | null = null;

  // === BULK DELETE STATE ===
  selectedIds: Set<string> = new Set();
  loadingBulk = false;

  toggleSelection(id: string) {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
    this.cdr.markForCheck();
  }

  toggleAllSelection() {
    if (this.selectedIds.size === this.adherents.length) this.selectedIds.clear();
    else this.adherents.forEach((i: any) => this.selectedIds.add(i.id));
    this.cdr.markForCheck();
  }

  isSelected(id: string): boolean { return this.selectedIds.has(id); }

  clearSelection() {
    this.selectedIds.clear();
    this.cdr.markForCheck();
  }

  bulkDeleteSelected() {
    if (this.selectedIds.size === 0) return;
    this.openConfirm('Supprimer la selection ?', 'Vous allez supprimer ' + this.selectedIds.size + ' adherent(s). Cette action est irreversible.', 'bulk_delete_selected');
  }

  bulkDeleteAll() {
    this.openConfirm('Supprimer TOUS les adherent(s) ?', 'ATTENTION: Cette action supprimera TOUS les adherent(s) de la base.', 'bulk_delete_all');
  }

  showConfirmDialog = false;
  showIdCardModal = false;
  showAlert = false;
  alertType: AlertType = 'info';
  alertTitle = 'Information';
  alertMessage = '';
  selectedAdherent: any = null;
  exportRectoB64 = '';
  exportVersoB64 = '';
  itemToDelete: string | null = null;
  confirmTitle = 'Confirmer la suppression';
  confirmMessage = '';
  confirmActionType = '';
  confirmActionId: any = null;

  formData = {
    prenom: '',
    nom: '',
    telephone: '',
    quartier: '',
    profession: '',
    competences: '',
    disponibilite: '',
    carteRectoUrl: '',
    carteVersoUrl: '',
    statut: 'NOUVEAU'
  };

  


  constructor(private adminData: AdminDataService,
    private bulkDelete: BulkDeleteService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.adminData.getAdherents().subscribe({
      next: (res: any) => { this.adherents = res.data; this.total = res.total; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  getStatutClass(statut: string): string {
    const map: any = { 
      'ACTIF': 'text-[#008d36] bg-[#e6f3eb]', 
      'NOUVEAU': 'text-orange-600 bg-orange-100', 
      'EN ATTENTE': 'text-blue-600 bg-blue-100',
      'SUSPENDU': 'text-gray-500 bg-gray-100' 
    };
    return map[statut] || 'text-gray-500 bg-gray-100';
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.formData = { prenom: '', nom: '', telephone: '', quartier: '', profession: '', competences: '', disponibilite: '', carteRectoUrl: '', carteVersoUrl: '', statut: 'NOUVEAU' };
    this.showModal = true;
  }

  openEditModal(adherent: any) {
    this.isEditing = true;
    this.editingId = adherent.id;
    this.formData = {
      prenom: adherent.prenom || '',
      nom: adherent.nom || '',
      telephone: adherent.telephone || '',
      quartier: adherent.quartier || '',
      profession: adherent.profession || '',
      competences: adherent.competences || '',
      disponibilite: adherent.disponibilite || '',
      carteRectoUrl: adherent.carteRectoUrl || '',
      carteVersoUrl: adherent.carteVersoUrl || '',
      statut: adherent.statut || 'NOUVEAU'
    };
    this.showModal = true;
  }

  async viewIdCard(adherent: any) {
    this.selectedAdherent = adherent;
    this.exportRectoB64 = '';
    this.exportVersoB64 = '';
    this.showIdCardModal = true;
    
    // Preload images as Base64 for the export template to ensure they render in html2canvas
    if (adherent.carteRectoUrl) {
      this.exportRectoB64 = await this.urlToBase64(adherent.carteRectoUrl);
    }
    if (adherent.carteVersoUrl) {
      this.exportVersoB64 = await this.urlToBase64(adherent.carteVersoUrl);
    }
    this.cdr.markForCheck();
  }

  async urlToBase64(url: string): Promise<string> {
    try {
      // Astuce CORS: Ajouter un paramètre de temps pour contourner le cache du navigateur
      // qui pourrait avoir stocké l'image sans les en-têtes CORS appropriés
      const cacheBuster = url.includes('?') ? '&' : '?';
      const fetchUrl = `${url}${cacheBuster}timestamp=${new Date().getTime()}`;

      const response = await fetch(fetchUrl, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`HTTP erreur! statut: ${response.status}`);
      }
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Image to Base64 failed for URL:", url, e);
      // En cas d'échec (par exemple CORS persistant), on renvoie l'URL avec un cache-buster
      // et on s'appuie sur l'attribut crossorigin="anonymous" de la balise <img>
      const cacheBuster = url.includes('?') ? '&' : '?';
      return `${url}${cacheBuster}t=${new Date().getTime()}`;
    }
  }

  closeIdCard() {
    this.showIdCardModal = false;
    this.selectedAdherent = null;
  }

  showAlertMethod(type: AlertType, title: string, message: string) {
    this.alertType = type;
    this.alertTitle = title;
    this.alertMessage = message;
    this.showAlert = true;
  }

  action(type: string, id?: string) {
    if (type === 'Ajouter un adhérent') {
      this.openCreateModal();
    } else if (type === 'Supprimer' && id) {
      this.itemToDelete = id;
      this.confirmTitle = 'Supprimer cet adhérent ?';
      this.showConfirmDialog = true;
    } else if ((type === 'Valider' || type === 'Activer') && id) {
      const adherent = this.adherents.find((a: any) => a.id === id);
      const prevStatut = adherent ? adherent.statut : 'NOUVEAU';
      
      if (adherent) {
        adherent.statut = 'ACTIF';
        this.cdr.markForCheck();
        this.showAlertMethod('success', 'Succès', 'Carte activée instantanément.');
      }
      
      this.adminData.updateEntity('adherents', id, { statut: 'ACTIF' }).subscribe({
        next: () => {
          // Success background save
        },
        error: () => {
          if (adherent) {
            adherent.statut = prevStatut;
            this.cdr.markForCheck();
            this.showAlertMethod('error', 'Erreur', 'Échec de synchronisation avec le serveur.');
          }
        }
      });
    } else if (type === 'Éditer' && id) {
      const adherent = this.adherents.find((a: any) => a.id === id);
      if (adherent) {
        this.openEditModal(adherent);
      }
    }
  }

  deleteItem = (id: string) => {
    const previousAdherents = [...this.adherents];
    this.adherents = this.adherents.filter(a => a.id !== id);
    this.cdr.markForCheck();

    this.adminData.deleteEntity('adherents', id).subscribe({
      next: () => {
        this.total = Math.max(0, this.total - 1);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.adherents = previousAdherents;
        this.cdr.markForCheck();
        this.showAlertMethod('error', 'Erreur', 'Impossible de supprimer cet adhérent. Le serveur est surchargé, veuillez réessayer.');
      }
    });
  };

  confirmDelete() {
    this.showConfirmDialog = false;

    if (this.confirmActionType === 'bulk_delete_selected') {
      const ids = Array.from(this.selectedIds);
      this.loadingBulk = true;
      this.cdr.markForCheck();
      this.bulkDelete.deleteSelected('adherents', ids).subscribe({
        next: (res) => {
          this.loadingBulk = false;
          this.clearSelection();
          this.refreshData();
          this.showAlertMethod('success', 'Succès', res.deleted + ' adhérent(s) supprimé(s).');
        },
        error: () => {
          this.loadingBulk = false;
          this.cdr.markForCheck();
          this.showAlertMethod('error', 'Erreur', 'Impossible de supprimer la sélection.');
        }
      });
    } else if (this.confirmActionType === 'bulk_delete_all') {
      this.loadingBulk = true;
      this.cdr.markForCheck();
      this.bulkDelete.deleteAll('adherents').subscribe({
        next: (res) => {
          this.loadingBulk = false;
          this.clearSelection();
          this.refreshData();
          this.showAlertMethod('success', 'Succès', 'Tous les adhérents ont été supprimés.');
        },
        error: () => {
          this.loadingBulk = false;
          this.cdr.markForCheck();
          this.showAlertMethod('error', 'Erreur', 'Impossible de supprimer tous les adhérents.');
        }
      });
    } else if (this.itemToDelete) {
      this.deleteItem(this.itemToDelete);
      this.itemToDelete = null;
    }

    this.confirmActionType = '';
    this.confirmActionId = null;
  }

  submitForm() {
    if (!this.formData.prenom || !this.formData.nom || !this.formData.telephone || !this.formData.quartier) {
      this.showAlertMethod('warning', 'Attention', 'Veuillez remplir les champs obligatoires');
      return;
    }

    const data = {
      prenom: this.formData.prenom,
      nom: this.formData.nom,
      telephone: this.formData.telephone,
      quartier: this.formData.quartier,
      profession: this.formData.profession || null,
      competences: this.formData.competences || null,
      disponibilite: this.formData.disponibilite || null,
      carteRectoUrl: this.formData.carteRectoUrl || null,
      carteVersoUrl: this.formData.carteVersoUrl || null,
      statut: this.formData.statut || 'NOUVEAU'
    };

    this.isLoading = true;
    this.showModal = false;

    if (this.isEditing && this.editingId) {
      this.adminData.updateEntity('adherents', this.editingId, data).subscribe({
        next: () => {
          this.refreshData();
          this.showAlertMethod('success', 'Succès', 'Adhérent modifié avec succès');
        },
        error: () => {
          this.showAlertMethod('error', 'Erreur', 'Erreur lors de la modification');
          this.cdr.markForCheck();
        }
      });
    } else {
      this.adminData.createEntity('adherents', data).subscribe({
        next: () => {
          this.refreshData();
          this.showAlertMethod('success', 'Succès', 'Adhérent ajouté avec succès');
        },
        error: () => {
          this.showAlertMethod('error', 'Erreur', "Erreur lors de l'ajout de l'adhérent");
          this.cdr.markForCheck();
        }
      });
    }
  }

  async downloadIdCard(format: 'png' | 'pdf') {
    const element = document.getElementById('id-card-export');
    if (!element) return;
    
    this.isDownloading = true;
    this.cdr.markForCheck();

    try {
      // Temporarily bring it on screen (fixed) to ensure html2canvas can capture it properly
      element.style.position = 'fixed';
      element.style.left = '0';
      element.style.top = '0';
      element.style.zIndex = '-9999';
      element.style.opacity = '1';

      // We add a tiny delay to ensure the browser has fully painted the DOM with base64 images
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(element, {
        scale: 4, // Increased scale for maximum clarity / sharpness
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      element.style.left = '-9999px';
      element.style.top = '-9999px';

      if (format === 'png') {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `carte_id_${this.selectedAdherent.prenom}_${this.selectedAdherent.nom}.png`;
        link.href = imgData;
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width / 2, canvas.height / 2]
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`carte_id_${this.selectedAdherent.prenom}_${this.selectedAdherent.nom}.pdf`);
      }
    } catch (err) {
      this.showAlertMethod('error', 'Erreur', 'Impossible de générer le fichier.');
    } finally {
      this.isDownloading = false;
      this.cdr.markForCheck();
    }
  }

  async downloadBadge(adherent: any) {
    if (!adherent) return;
    this.isDownloading = true;
    this.cdr.markForCheck();

    try {
      // === Dimensions ajustées au format exact d'une carte physique (ISO ID-1 : 85.6mm x 54mm) ===
      // Ratio : 85.6 / 54 = 1.585
      const SCALE = 3;
      const CW = 384 * SCALE;  // largeur totale carte
      const CH = 242 * SCALE;  // hauteur totale carte (384 / 1.585 ≈ 242)
      const R = 24 * SCALE;    // border-radius (plus adapté au format physique)

      const canvas = document.createElement('canvas');
      canvas.width = CW;
      canvas.height = CH;
      const ctx = canvas.getContext('2d')!;

      // ─── Helper: roundRect path ───────────────────────────────────────
      const rrPath = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
      };

      // ─── 1. FOND PRINCIPAL : dégradé vert (from-[#024c26] to-[#01a646]) ──
      ctx.save();
      rrPath(0, 0, CW, CH, R);
      ctx.clip();

      const bgGrad = ctx.createLinearGradient(0, 0, CW, CH);
      bgGrad.addColorStop(0, '#024c26');
      bgGrad.addColorStop(1, '#01a646');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CW, CH);

      // ─── 2. FILIGRANE FEUILLE (opacity 0.08, coin droit) ─────────────
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#022c16';
      ctx.font = `900 ${180 * SCALE}px serif`;
      ctx.textAlign = 'right';
      ctx.fillText('🍃', CW + 30 * SCALE, CH / 2 + 80 * SCALE);
      ctx.restore();

      // ─── 3. HEADER (p-4 = 16px) ──────────────────────────────────────
      const PAD = 16 * SCALE;
      const LOGO_SIZE = 40 * SCALE;  // w-10 h-10

      // Logo rond blanc
      ctx.beginPath();
      ctx.arc(PAD + LOGO_SIZE / 2, PAD + LOGO_SIZE / 2, LOGO_SIZE / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
      // Ombre logo
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowBlur = 6 * SCALE;
      ctx.fill();
      ctx.restore();

      // Logo image
      try {
        const logoImg = await this.loadImage(window.location.origin + '/assets/icons/icon-192x192.png');
        ctx.save();
        ctx.beginPath();
        const logoPad = 4 * SCALE;
        ctx.arc(PAD + LOGO_SIZE / 2, PAD + LOGO_SIZE / 2, LOGO_SIZE / 2 - logoPad, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoImg, PAD + logoPad, PAD + logoPad, LOGO_SIZE - logoPad * 2, LOGO_SIZE - logoPad * 2);
        ctx.restore();
      } catch { /* skip */ }

      // Texte "JÀMM AK XÉEWAL"
      ctx.fillStyle = 'white';
      ctx.font = `900 ${11 * SCALE}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('JÀMM AK XÉEWAL', PAD + LOGO_SIZE + 8 * SCALE, PAD + LOGO_SIZE / 2 + 4 * SCALE);

      // Badge "Membre Officiel" (coin droit header, bg-brand-yellow, rounded-full)
      const badgeText = '★ Membre Officiel';
      ctx.font = `700 ${9 * SCALE}px sans-serif`;
      const bW = ctx.measureText(badgeText).width + 16 * SCALE;
      const bH = 22 * SCALE;
      const bX = CW - PAD - bW;
      const bY = PAD + (LOGO_SIZE - bH) / 2;
      rrPath(bX, bY, bW, bH, bH / 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
      ctx.fillStyle = '#022c16';
      ctx.textAlign = 'left';
      ctx.fillText(badgeText, bX + 8 * SCALE, bY + bH / 2 + 3 * SCALE);

      // ─── 4. ZONE CENTRALE ────────────────────────────────────────────
      // px-5=20px, pt-2=8px, pb-20=80px (pour laisser place au footer)
      const CPADY = PAD + LOGO_SIZE + 8 * SCALE; // top de la zone centrale
      const CPADX = 20 * SCALE;
      const FOOTER_H = 56 * SCALE; // hauteur footer estimée (réduite pour le format ISO)
      const CENTER_H = CH - CPADY - FOOTER_H; // hauteur zone centrale

      // Photo avatar (w-14 h-14 rounded-full, bg-brand-yellow) - réduit de 10px pour plus d'espace
      // NOTE: only use adherent.photo, NOT carteRectoUrl (that is the ID card scan)
      const AVATAR_SIZE = 54 * SCALE;
      const AVATAR_CX = CPADX + AVATAR_SIZE / 2;
      const AVATAR_CY = CPADY + CENTER_H / 2;

      // Fond jaune de l'avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(AVATAR_CX, AVATAR_CY, AVATAR_SIZE / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
      ctx.restore();

      const photoSrc = adherent.photo || null;
      if (photoSrc) {
        try {
          const photoImg = await this.loadImage(photoSrc);
          ctx.save();
          ctx.beginPath();
          ctx.arc(AVATAR_CX, AVATAR_CY, AVATAR_SIZE / 2, 0, Math.PI * 2);
          ctx.clip();
          const iw = photoImg.width, ih = photoImg.height;
          const sc = Math.max(AVATAR_SIZE / iw, AVATAR_SIZE / ih);
          ctx.drawImage(photoImg,
            AVATAR_CX - iw * sc / 2, AVATAR_CY - ih * sc / 2,
            iw * sc, ih * sc);
          ctx.restore();
        } catch {
          // Fallback: initiales
          ctx.fillStyle = '#024c26';
          ctx.font = `900 ${26 * SCALE}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(
            (adherent.prenom?.charAt(0) || '?') + (adherent.nom?.charAt(0) || ''),
            AVATAR_CX, AVATAR_CY + 9 * SCALE
          );
        }
      } else {
        // Initiales sur fond jaune
        ctx.fillStyle = '#024c26';
        ctx.font = `900 ${26 * SCALE}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(
          (adherent.prenom?.charAt(0) || '?') + (adherent.nom?.charAt(0) || ''),
          AVATAR_CX, AVATAR_CY + 9 * SCALE
        );
      }

      // ─── Informations membre (à droite de la photo, centrée verticalement) ──
      const INFO_X = CPADX + AVATAR_SIZE + 16 * SCALE;
      const QR_BOX_PRE = 88 * SCALE;
      const INFO_MAX_W = CW - INFO_X - QR_BOX_PRE - CPADX - 12 * SCALE;

      // Centrage vertical : aligner le bloc texte sur AVATAR_CY
      // Calcul de la hauteur totale du bloc texte (3 lignes)
      const lineH1 = 12 * SCALE;  // label "Nom & Prénom"
      const lineH2 = 22 * SCALE;  // nom complet
      const lineH3 = 10 * SCALE;  // label quartier
      const lineH4 = 16 * SCALE;  // valeur quartier
      const blockH  = lineH1 + lineH2 + 6 * SCALE + lineH3 + lineH4;
      let IY = AVATAR_CY - blockH / 2;

      // Label "Nom & Prénom"
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = `500 ${10 * SCALE}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('Nom & Prenom', INFO_X, IY + lineH1);
      IY += lineH1 + 4 * SCALE;

      // Nom complet (17px font-black uppercase)
      const fullName = `${(adherent.prenom || '').toUpperCase()} ${(adherent.nom || '').toUpperCase()}`;
      ctx.fillStyle = 'white';
      ctx.font = `900 ${17 * SCALE}px sans-serif`;
      let nameToDisplay = fullName;
      while (ctx.measureText(nameToDisplay).width > INFO_MAX_W && nameToDisplay.length > 3) {
        nameToDisplay = nameToDisplay.slice(0, -1);
      }
      if (nameToDisplay !== fullName) nameToDisplay += '...';
      ctx.fillText(nameToDisplay, INFO_X, IY + lineH2);
      IY += lineH2 + 6 * SCALE;

      // Label "Quartier" (petit, jaune)
      ctx.fillStyle = '#F59E0B';
      ctx.font = `600 ${8 * SCALE}px sans-serif`;
      ctx.fillText('Quartier', INFO_X, IY + lineH3);
      IY += lineH3 + 4 * SCALE;

      // Valeur quartier (blanc, gras, sans emoji pour eviter les problemes de rendu)
      ctx.fillStyle = 'white';
      ctx.font = `700 ${11 * SCALE}px sans-serif`;
      ctx.fillText((adherent.quartier || 'Thies-Nord'), INFO_X, IY + lineH4);

      // ─── 5. QR CODE (coin droit) ─────────────────────────────────────
      const QR_BOX = 88 * SCALE;  // bg-white p-2 rounded-xl (72px + 8px padding*2 = 88)
      const QR_IMG = 72 * SCALE;
      const QR_PAD = 8 * SCALE;
      const QR_X = CW - CPADX - QR_BOX;
      const QR_Y = CPADY + (CENTER_H - QR_BOX) / 2;

      // Fond blanc arrondi + bordure jaune
      rrPath(QR_X, QR_Y, QR_BOX, QR_BOX, 12 * SCALE);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2 * SCALE;
      ctx.stroke();

      // Image QR
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=216x216&color=022c16&bgcolor=ffffff&margin=8&data=${encodeURIComponent(this.baseUrl + '/membre/' + adherent.id)}`;
      try {
        const qrImg = await this.loadImage(qrUrl);
        ctx.drawImage(qrImg, QR_X + QR_PAD, QR_Y + QR_PAD, QR_IMG, QR_IMG);
      } catch { /* QR indisponible */ }

      // Label "Carte Électronique" sous le QR
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = `500 ${7.5 * SCALE}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Carte Électronique ↗', QR_X + QR_BOX / 2, QR_Y + QR_BOX + 14 * SCALE);

      // ─── 6. FOOTER DORÉ (rounded-t-[1.5rem]) ─────────────────────────
      const FY = CH - FOOTER_H;
      const FR = 24 * SCALE; // 1.5rem

      ctx.beginPath();
      ctx.moveTo(0, FY + FR);
      ctx.arcTo(0, FY, FR, FY, FR);
      ctx.lineTo(CW - FR, FY);
      ctx.arcTo(CW, FY, CW, FY + FR, FR);
      ctx.lineTo(CW, CH);
      ctx.lineTo(0, CH);
      ctx.closePath();

      const footerGrad = ctx.createLinearGradient(0, FY, 0, CH);
      footerGrad.addColorStop(0, '#F59E0B');
      footerGrad.addColorStop(0.5, '#FBBF24');
      footerGrad.addColorStop(1, '#F59E0B');
      ctx.fillStyle = footerGrad;
      ctx.fill();

      // Reflet blanc en haut du footer
      ctx.save();
      const reflectGrad = ctx.createLinearGradient(0, FY, 0, FY + 20 * SCALE);
      reflectGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
      reflectGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.moveTo(0, FY + FR);
      ctx.arcTo(0, FY, FR, FY, FR);
      ctx.lineTo(CW - FR, FY);
      ctx.arcTo(CW, FY, CW, FY + FR, FR);
      ctx.lineTo(CW, FY + 20 * SCALE);
      ctx.lineTo(0, FY + 20 * SCALE);
      ctx.closePath();
      ctx.fillStyle = reflectGrad;
      ctx.fill();
      ctx.restore();

      // 3 sections footer
      const footerSections = [
        { icon: '📅', label: 'Adhésion', value: '2024 – 2026' },
        { icon: '👤', label: 'Statut',   value: 'Membre Actif' },
        { icon: '⭐', label: 'N° Membre', value: `JA-${(adherent.id || '----').substring(0, 4).toUpperCase()}` }
      ];
      const sW = CW / 3;
      const TC = '#022c16';

      footerSections.forEach((s, i) => {
        const cx = i * sW + sW / 2;
        const cy = FY + FOOTER_H / 2;

        // Séparateur
        if (i > 0) {
          ctx.fillStyle = 'rgba(2,44,22,0.12)';
          ctx.fillRect(i * sW, FY + 10 * SCALE, 1.5 * SCALE, FOOTER_H - 20 * SCALE);
        }

        // Label
        ctx.fillStyle = TC;
        ctx.font = `600 ${8 * SCALE}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(s.label, cx, cy - 8 * SCALE);

        // Valeur
        ctx.font = `900 ${10 * SCALE}px sans-serif`;
        ctx.fillText(s.value, cx, cy + 8 * SCALE);
      });

      ctx.restore(); // end clip

      // ─── Téléchargement ──────────────────────────────────────────────
      const link = document.createElement('a');
      link.download = `carte_membre_${adherent.prenom}_${adherent.nom}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

    } catch (err) {
      console.error('downloadBadge error:', err);
      this.showAlertMethod('error', 'Erreur', 'Impossible de générer la carte numérique.');
    } finally {
      this.isDownloading = false;
      this.badgeAdherent = null;
      this.cdr.markForCheck();
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }


  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  async downloadSelectedBadges() {
    if (this.selectedIds.size === 0) return;
    const selected = this.adherents.filter(a => this.selectedIds.has(a.id));
    this.showAlertMethod('info', 'Téléchargement', `Génération de ${selected.length} badge(s) en cours…`);
    for (const adherent of selected) {
      await this.downloadBadge(adherent);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    this.showAlertMethod('success', 'Succès', `${selected.length} badge(s) téléchargé(s).`);
  }

  async downloadImageDirect(url: string, filename: string) {
    try {
      const response = await fetch(url, { mode: 'cors' });
      const blob = await response.blob();
      const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${filename}.${ext}`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  openConfirm(title: string, message: string, actionType: string, actionId: any = null) {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmActionType = actionType;
    this.confirmActionId = actionId;
    this.showConfirmDialog = true;
  }


}
