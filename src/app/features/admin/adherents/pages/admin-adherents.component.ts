import { BulkDeleteService } from '../../../../core/services/bulk-delete.service';
import { BulkActionsBarComponent } from '../../../../shared/components/bulk-actions-bar/bulk-actions-bar.component';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
    <button (click)="openCreateModal()" class="px-5 py-3 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-[0_4px_12px_rgba(2,44,22,0.15)] hover:bg-[#008d36] transition-all flex items-center gap-2 shrink-0">
      <i class="fa-solid fa-user-plus"></i> Ajouter un adhérent
    </button>
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
        <div class="flex gap-3">
          <button (click)="downloadIdCard('png')" [disabled]="isDownloading" class="px-5 py-2.5 text-sm font-bold text-white bg-[#008d36] hover:bg-[#022c16] rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-50">
            <i class="fa-solid fa-image" *ngIf="!isDownloading"></i>
            <i class="fa-solid fa-spinner fa-spin" *ngIf="isDownloading"></i>
            Télécharger PNG
          </button>
          <button (click)="downloadIdCard('pdf')" [disabled]="isDownloading" class="px-5 py-2.5 text-sm font-bold text-[#008d36] bg-[#e6f3eb] hover:bg-[#d1e8d9] rounded-xl transition-all flex items-center gap-2 disabled:opacity-50">
            <i class="fa-solid fa-file-pdf" *ngIf="!isDownloading"></i>
            <i class="fa-solid fa-spinner fa-spin" *ngIf="isDownloading"></i>
            Télécharger PDF
          </button>
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
    if (this.itemToDelete) {
      this.deleteItem(this.itemToDelete);
      this.itemToDelete = null;
      this.showConfirmDialog = false;
    }
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
