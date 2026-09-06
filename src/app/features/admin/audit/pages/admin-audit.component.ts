import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import {
  AuditAdminService,
  AuditLogItem,
  AuditStats,
  AuditSeverity,
  AuditCategory,
  AuditFilterParams
} from '../../../../core/services/audit-admin.service';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="animate-fade-in-up max-w-[1600px] mx-auto pb-16">
      <!-- Top Banner / Header -->
      <div class="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div class="flex items-center gap-4 min-w-0">
          <div class="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md shadow-slate-900/10">
            <i class="fa-solid fa-shield-halved text-2xl text-emerald-400"></i>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-black text-gray-900 tracking-tight">Journal d'Audit & Traçabilité</h1>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Immuable
              </span>
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                <i class="fa-solid fa-user-shield text-[10px]"></i>
                Gestionnaires & Profils Uniquement
              </span>
            </div>
            <p class="text-[13px] text-gray-500 font-medium mt-0.5">
              Historique inaltérable de toutes les opérations sensibles avec identification complète des gestionnaires responsables (Prénom, Nom, Profil, Téléphone, Email).
            </p>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <button
            (click)="refreshLogs()"
            [disabled]="isLoading"
            class="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all disabled:opacity-50">
            <i class="fa-solid fa-rotate text-xs" [class.fa-spin]="isLoading"></i>
            Actualiser
          </button>

          <button
            (click)="exportCsv()"
            [disabled]="isLoading || logs.length === 0"
            class="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50">
            <i class="fa-solid fa-file-csv text-sm"></i>
            Exporter CSV
          </button>
        </div>
      </div>

      <!-- KPI Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <!-- Critical KPI -->
        <div 
          (click)="setSeverityFilter('CRITICAL')"
          class="cursor-pointer group bg-white p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
          [ngClass]="selectedSeverity === 'CRITICAL' ? 'border-red-500 ring-2 ring-red-500/20 shadow-md' : 'border-gray-100 hover:border-red-200 hover:shadow-sm'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
              <i class="fa-solid fa-triangle-exclamation"></i>
              Actions Critiques
            </span>
            <span class="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xs font-black group-hover:scale-110 transition-transform">
              🔴
            </span>
          </div>
          <div class="text-3xl font-black text-gray-900 tracking-tight">
            {{ stats.criticalCount | number }}
          </div>
          <p class="text-xs text-gray-500 mt-1 font-medium">Purges, décaissements & droits</p>
        </div>

        <!-- High KPI -->
        <div 
          (click)="setSeverityFilter('HIGH')"
          class="cursor-pointer group bg-white p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
          [ngClass]="selectedSeverity === 'HIGH' ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md' : 'border-gray-100 hover:border-amber-200 hover:shadow-sm'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
              <i class="fa-solid fa-shield-virus"></i>
              Actions Élevées
            </span>
            <span class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-black group-hover:scale-110 transition-transform">
              🟠
            </span>
          </div>
          <div class="text-3xl font-black text-gray-900 tracking-tight">
            {{ stats.highCount | number }}
          </div>
          <p class="text-xs text-gray-500 mt-1 font-medium">Validations manuelles & profils</p>
        </div>

        <!-- Finance KPI -->
        <div 
          (click)="setCategoryFilter('FINANCE')"
          class="cursor-pointer group bg-white p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
          [ngClass]="selectedCategory === 'FINANCE' ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-gray-100 hover:border-emerald-200 hover:shadow-sm'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <i class="fa-solid fa-vault"></i>
              Opérations Financières
            </span>
            <span class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black group-hover:scale-110 transition-transform">
              💰
            </span>
          </div>
          <div class="text-3xl font-black text-gray-900 tracking-tight">
            {{ stats.financeCount | number }}
          </div>
          <p class="text-xs text-gray-500 mt-1 font-medium">Décaissements, cotisations & soldes</p>
        </div>

        <!-- Total KPI -->
        <div 
          (click)="resetFilters()"
          class="cursor-pointer group bg-white p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
          [ngClass]="selectedCategory === 'ALL' && selectedSeverity === 'ALL' ? 'border-slate-800 ring-2 ring-slate-800/20 shadow-md' : 'border-gray-100 hover:border-slate-300 hover:shadow-sm'">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <i class="fa-solid fa-list-check"></i>
              Volume Global
            </span>
            <span class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-black group-hover:scale-110 transition-transform">
              📋
            </span>
          </div>
          <div class="text-3xl font-black text-gray-900 tracking-tight">
            {{ stats.total | number }}
          </div>
          <p class="text-xs text-gray-500 mt-1 font-medium">Toutes les actions tracées</p>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-8 space-y-5">
        <!-- Row 1: Category Tabs -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2">Catégorie :</span>
            <button
              *ngFor="let cat of categoryTabs"
              (click)="setCategoryFilter(cat.id)"
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              [ngClass]="selectedCategory === cat.id ? 'bg-slate-900 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
              <i [class]="cat.icon"></i>
              {{ cat.label }}
            </button>
          </div>

          <!-- Active filters reset -->
          <button
            *ngIf="hasActiveFilters"
            (click)="resetFilters()"
            class="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline">
            <i class="fa-solid fa-filter-circle-xmark"></i>
            Réinitialiser filtres
          </button>
        </div>

        <!-- Row 2: Severity Pills, Search & Dates -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <!-- Search input -->
          <div class="md:col-span-4 relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <i class="fa-solid fa-magnifying-glass text-xs"></i>
            </div>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Rechercher prénom, nom, profil, action, ID..."
              class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
          </div>

          <!-- Severity Filter -->
          <div class="md:col-span-3">
            <select
              [(ngModel)]="selectedSeverity"
              (change)="onFilterChange()"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
              <option value="ALL">Niveau de gravité (Tous)</option>
              <option value="CRITICAL">🔴 CRITIQUE (Danger élevé / irréversible)</option>
              <option value="HIGH">🟠 ÉLEVÉ (Validation / refus / rôle)</option>
              <option value="MEDIUM">🟡 MOYEN (Mise à jour standard)</option>
              <option value="INFO">⚪ INFO (Consultation / création simple)</option>
            </select>
          </div>

          <!-- Date Start -->
          <div class="md:col-span-2">
            <input
              type="date"
              [(ngModel)]="startDate"
              (change)="onFilterChange()"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <!-- Date End -->
          <div class="md:col-span-2">
            <input
              type="date"
              [(ngModel)]="endDate"
              (change)="onFilterChange()"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <!-- Limit Selector -->
          <div class="md:col-span-1">
            <select
              [(ngModel)]="limit"
              (change)="onFilterChange()"
              class="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:bg-white focus:outline-none">
              <option [value]="25">25 / p.</option>
              <option [value]="50">50 / p.</option>
              <option [value]="100">100 / p.</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Audit Logs Table Section -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <!-- Table Header Status -->
        <div class="p-4 sm:px-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div class="text-xs font-bold text-gray-500 flex items-center gap-2">
            <span>Affichage de <span class="text-gray-900 font-extrabold">{{ logs.length }}</span> sur <span class="text-gray-900 font-extrabold">{{ totalLogs }}</span> actions</span>
            <span class="text-gray-300">•</span>
            <span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200/50">
              <i class="fa-solid fa-lock text-[10px] mr-1"></i> Registre sécurisé des gestionnaires
            </span>
          </div>
          <div class="text-xs font-semibold text-gray-400">
            Page {{ currentPage }} sur {{ totalPages || 1 }}
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading" class="p-16 text-center">
          <div class="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-sm font-bold text-gray-700">Interrogation du registre d'audit...</p>
          <p class="text-xs text-gray-400 mt-1">Extraction sécurisée des événements et profils</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && logs.length === 0" class="p-16 text-center">
          <div class="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
            <i class="fa-solid fa-clipboard-check"></i>
          </div>
          <h3 class="text-base font-bold text-gray-800">Aucun enregistrement d'audit trouvé</h3>
          <p class="text-xs text-gray-500 max-w-md mx-auto mt-1">
            Aucun événement ne correspond à vos critères de recherche actuels. Modifiez vos filtres ou réinitialisez la sélection.
          </p>
          <button
            (click)="resetFilters()"
            class="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all">
            Voir tous les événements
          </button>
        </div>

        <!-- Table View -->
        <div *ngIf="!isLoading && logs.length > 0" class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th class="py-3.5 px-4 font-extrabold">Horodatage</th>
                <th class="py-3.5 px-4 font-extrabold">Auteur & Profil (Qui a fait l'action)</th>
                <th class="py-3.5 px-4 font-extrabold">Gravité & Catégorie</th>
                <th class="py-3.5 px-4 font-extrabold">Action Exécutée</th>
                <th class="py-3.5 px-4 font-extrabold">Cible & Contexte</th>
                <th class="py-3.5 px-4 font-extrabold">IP / Réseau</th>
                <th class="py-3.5 px-4 font-extrabold text-right">Détails</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-xs">
              <tr 
                *ngFor="let log of logs; trackBy: trackByLogId" 
                class="hover:bg-gray-50/80 transition-colors group">
                <!-- Timestamp -->
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <div class="font-extrabold text-gray-900 font-mono text-[12px]">
                    {{ log.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}
                  </div>
                  <div class="text-[10px] text-gray-400 font-medium mt-0.5">
                    {{ getRelativeTime(log.createdAt) }}
                  </div>
                </td>

                <!-- Actor Details (Prénom, Nom, Profil, Téléphone, Email) -->
                <td class="py-3.5 px-4">
                  <div class="flex items-start gap-3">
                    <div 
                      class="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 text-white shadow-xs mt-0.5"
                      [ngClass]="getActorAvatarColor(log.actorName || log.actorEmail || log.actorId)">
                      {{ getActorInitials(log.actorName || log.actorEmail || log.actorId) }}
                    </div>
                    <div class="min-w-0">
                      <!-- Prénom & Nom complets -->
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="font-bold text-gray-900">
                          {{ log.actorPrenom || (splitActorName(log.actorName).prenom) }}
                        </span>
                        <span class="font-black text-gray-950 uppercase tracking-wide">
                          {{ log.actorNom || (splitActorName(log.actorName).nom) }}
                        </span>
                      </div>

                      <!-- Profil & Rôle (Trésorier, etc.) -->
                      <div class="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          <i class="fa-solid fa-user-gear text-[9px]"></i>
                          {{ log.actorProfile || 'Super Administrateur' }}
                        </span>

                        <span class="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50" title="Compte avec profil d'administration habilité (non adhérent simple)">
                          <i class="fa-solid fa-shield-check text-[8px]"></i>
                          Gestionnaire
                        </span>
                      </div>

                      <!-- Contact Info (Phone & Email) -->
                      <div class="flex items-center gap-3 text-[10px] text-gray-500 mt-1 flex-wrap font-mono">
                        <span *ngIf="log.actorPhone" class="flex items-center gap-1 text-gray-600 font-semibold">
                          <i class="fa-solid fa-phone text-[9px] text-gray-400"></i>
                          {{ log.actorPhone }}
                        </span>
                        <span *ngIf="log.actorEmail" class="flex items-center gap-1 text-gray-500 truncate max-w-[160px]" [title]="log.actorEmail">
                          <i class="fa-solid fa-envelope text-[9px] text-gray-400"></i>
                          {{ log.actorEmail }}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Severity & Category -->
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <div class="flex flex-col gap-1 items-start">
                    <!-- Severity Badge -->
                    <span 
                      class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider border"
                      [ngClass]="getSeverityBadgeClass(log.severity)">
                      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getSeverityDotClass(log.severity)"></span>
                      {{ log.severity }}
                    </span>

                    <!-- Category Badge -->
                    <span class="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500">
                      <i [class]="getCategoryIcon(log.category)"></i>
                      {{ getCategoryLabel(log.category) }}
                    </span>
                  </div>
                </td>

                <!-- Action -->
                <td class="py-3.5 px-4">
                  <div class="font-black text-gray-900">
                    {{ formatActionName(log.action) }}
                  </div>
                  <div class="text-[10px] font-mono text-gray-400 mt-0.5">
                    {{ log.action }}
                  </div>
                </td>

                <!-- Target & Context (Amounts etc) -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-1.5 font-bold text-gray-800">
                    <span class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-mono uppercase">
                      {{ log.entityType }}
                    </span>
                    <span *ngIf="log.entityId" class="text-[11px] font-mono text-gray-500 truncate max-w-[120px]" [title]="log.entityId">
                      #{{ formatEntityId(log.entityId) }}
                    </span>
                  </div>

                  <!-- Financial amount if present -->
                  <div *ngIf="log.metadata?.['amount']" class="text-[11px] font-black text-emerald-700 mt-0.5 flex items-center gap-1">
                    <i class="fa-solid fa-coins text-[10px]"></i>
                    {{ log.metadata?.['amount'] | number }} FCFA
                  </div>
                  <!-- Reason if present -->
                  <div *ngIf="log.metadata?.['reason']" class="text-[10px] text-gray-500 italic truncate max-w-[200px] mt-0.5">
                    "{{ log.metadata?.['reason'] }}"
                  </div>
                </td>

                <!-- IP Address -->
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <div class="font-mono text-xs text-gray-600">
                    {{ log.ipAddress || 'Interne / API' }}
                  </div>
                </td>

                <!-- Actions -->
                <td class="py-3.5 px-4 text-right whitespace-nowrap">
                  <button
                    (click)="openInspectionModal(log)"
                    class="px-3 py-1.5 bg-gray-100 hover:bg-slate-900 hover:text-white text-gray-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ml-auto">
                    <i class="fa-solid fa-magnifying-glass-chart"></i>
                    Inspecter
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div *ngIf="totalPages > 1" class="p-4 sm:px-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-gray-50/40">
          <button
            (click)="goToPage(currentPage - 1)"
            [disabled]="currentPage === 1"
            class="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <i class="fa-solid fa-chevron-left mr-1"></i>
            Précédent
          </button>

          <div class="flex items-center gap-1.5">
            <button
              *ngFor="let p of visiblePages"
              (click)="goToPage(p)"
              class="w-8 h-8 rounded-xl text-xs font-extrabold transition-all"
              [ngClass]="p === currentPage ? 'bg-slate-900 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'">
              {{ p }}
            </button>
          </div>

          <button
            (click)="goToPage(currentPage + 1)"
            [disabled]="currentPage === totalPages"
            class="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            Suivant
            <i class="fa-solid fa-chevron-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Inspection Modal / Detail Drawer -->
    <div 
      *ngIf="selectedLog" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in"
      (click)="closeInspectionModal()">
      <div 
        class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-gray-100 animate-scale-up"
        (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg">
              <i class="fa-solid fa-fingerprint text-emerald-400"></i>
            </div>
            <div>
              <h3 class="text-lg font-black text-gray-900 tracking-tight">Détails de l'Événement d'Audit</h3>
              <p class="text-xs text-gray-500 font-mono">ID: {{ selectedLog.id }}</p>
            </div>
          </div>
          <button 
            (click)="closeInspectionModal()"
            class="w-8 h-8 rounded-full hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors">
            <i class="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        <!-- Modal Content Scrollable -->
        <div class="p-6 overflow-y-auto space-y-6 text-xs">
          <!-- Severity & Action Highlight -->
          <div class="flex items-center justify-between p-4 rounded-2xl border"
            [ngClass]="getSeverityBoxClass(selectedLog.severity)">
            <div>
              <div class="text-[11px] font-bold uppercase tracking-wider text-gray-500">Action Exécutée</div>
              <div class="text-base font-black text-gray-900 mt-0.5">{{ formatActionName(selectedLog.action) }}</div>
              <div class="text-[11px] font-mono text-gray-500 mt-0.5">{{ selectedLog.action }}</div>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase border"
                [ngClass]="getSeverityBadgeClass(selectedLog.severity)">
                {{ selectedLog.severity }}
              </span>
              <div class="text-[11px] font-bold text-gray-500 mt-1">
                Catégorie: {{ selectedLog.category }}
              </div>
            </div>
          </div>

          <!-- COMPLETE ACTOR IDENTITY PROFILE (Fiche du Gestionnaire) -->
          <div class="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-indigo-100">
            <div class="flex items-center justify-between mb-4 border-b border-indigo-100/60 pb-3">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-id-card text-indigo-600 text-base"></i>
                <span class="font-black text-gray-900 text-sm tracking-tight">
                  Identité Complète du Gestionnaire Responsable
                </span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <i class="fa-solid fa-check mr-1"></i> Non Adhérent Simple
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Prénom & Nom -->
              <div>
                <div class="text-[10px] uppercase font-bold text-gray-400">Prénom & Nom</div>
                <div class="text-sm font-black text-gray-900 mt-0.5 flex items-center gap-1.5">
                  <span>{{ selectedLog.actorPrenom || splitActorName(selectedLog.actorName).prenom }}</span>
                  <span class="uppercase text-indigo-950">{{ selectedLog.actorNom || splitActorName(selectedLog.actorName).nom }}</span>
                </div>
              </div>

              <!-- Profil Attribué -->
              <div>
                <div class="text-[10px] uppercase font-bold text-gray-400">Profil / Fonction Attribuée</div>
                <div class="text-xs font-black text-indigo-700 mt-0.5 flex items-center gap-1">
                  <i class="fa-solid fa-user-tag text-[10px]"></i>
                  {{ selectedLog.actorProfile || 'Super Administrateur' }}
                </div>
              </div>

              <!-- Email -->
              <div>
                <div class="text-[10px] uppercase font-bold text-gray-400">Email de Connexion</div>
                <div class="text-xs font-mono text-gray-800 mt-0.5 flex items-center gap-1">
                  <i class="fa-solid fa-envelope text-[10px] text-gray-400"></i>
                  {{ selectedLog.actorEmail || 'admin@gmail.com' }}
                </div>
              </div>

              <!-- Téléphone -->
              <div>
                <div class="text-[10px] uppercase font-bold text-gray-400">Numéro de Téléphone</div>
                <div class="text-xs font-mono font-bold text-gray-900 mt-0.5 flex items-center gap-1">
                  <i class="fa-solid fa-phone text-[10px] text-gray-400"></i>
                  {{ selectedLog.actorPhone || 'Non renseigné' }}
                </div>
              </div>

              <!-- Rôle Système -->
              <div>
                <div class="text-[10px] uppercase font-bold text-gray-400">Rôle Système</div>
                <div class="text-xs font-mono font-extrabold text-gray-700 mt-0.5">
                  {{ selectedLog.actorRole || 'ADMIN' }}
                </div>
              </div>

              <!-- ID Acteur -->
              <div>
                <div class="text-[10px] uppercase font-bold text-gray-400">Identifiant Unique (UUID)</div>
                <div class="text-[11px] font-mono text-gray-500 mt-0.5 truncate" [title]="selectedLog.actorId">
                  {{ selectedLog.actorId }}
                </div>
              </div>
            </div>
          </div>

          <!-- Key Metas Grid -->
          <div class="grid grid-cols-2 gap-4">
            <div class="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <div class="text-[10px] uppercase font-bold text-gray-400">Date et Heure (Horodatage Précis)</div>
              <div class="font-extrabold text-gray-900 font-mono text-xs mt-1">
                {{ selectedLog.createdAt | date:'dd/MM/yyyy à HH:mm:ss.SSS' }}
              </div>
              <div class="text-[10px] text-gray-500 mt-0.5">
                UTC: {{ selectedLog.createdAt }}
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <div class="text-[10px] uppercase font-bold text-gray-400">Adresse IP & Réseau</div>
              <div class="font-extrabold text-gray-900 font-mono text-xs mt-1">
                {{ selectedLog.ipAddress || 'Non capturée (Appel direct/CLI)' }}
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-gray-50 border border-gray-100 col-span-2">
              <div class="text-[10px] uppercase font-bold text-gray-400">Entité Ciblée par l'Action</div>
              <div class="font-bold text-gray-900 mt-1 flex items-center gap-2">
                <span class="px-2 py-0.5 bg-gray-200 text-gray-800 rounded text-xs font-mono">
                  {{ selectedLog.entityType }}
                </span>
                <span class="text-gray-600 font-mono text-xs">
                  ID: {{ selectedLog.entityId || 'N/A' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Metadata JSON Inspector -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                <i class="fa-solid fa-code mr-1.5 text-gray-400"></i>
                Métadonnées & Justifications Enregistrées
              </span>
              <button
                *ngIf="selectedLog.metadata"
                (click)="copyMetadataJson()"
                class="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                <i class="fa-regular fa-copy"></i>
                Copier JSON
              </button>
            </div>

            <pre 
              *ngIf="selectedLog.metadata" 
              class="p-4 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
{{ selectedLog.metadata | json }}
            </pre>

            <div 
              *ngIf="!selectedLog.metadata" 
              class="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400 italic text-center">
              Aucune métadonnée supplémentaire enregistrée pour cet événement.
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end">
          <button
            (click)="closeInspectionModal()"
            class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all">
            Fermer l'inspection
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminAuditComponent implements OnInit, OnDestroy {
  logs: AuditLogItem[] = [];
  stats: AuditStats = {
    total: 0,
    criticalCount: 0,
    highCount: 0,
    financeCount: 0
  };

  isLoading = false;
  totalLogs = 0;
  totalPages = 1;
  currentPage = 1;
  limit = 25;

  selectedCategory = 'ALL';
  selectedSeverity = 'ALL';
  searchTerm = '';
  startDate = '';
  endDate = '';

  selectedLog: AuditLogItem | null = null;

  categoryTabs = [
    { id: 'ALL', label: 'Tous', icon: 'fa-solid fa-layer-group' },
    { id: 'FINANCE', label: 'Finances', icon: 'fa-solid fa-vault' },
    { id: 'SECURITY', label: 'Sécurité & Droits', icon: 'fa-solid fa-shield-halved' },
    { id: 'MEMBERS', label: 'Membres', icon: 'fa-solid fa-users' },
    { id: 'SYSTEM', label: 'Système & Purges', icon: 'fa-solid fa-server' },
  ];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private auditService: AuditAdminService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 1;
      this.fetchLogs();
    });

    // Check query params (e.g. ?category=FINANCE or ?severity=CRITICAL)
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['category']) this.selectedCategory = params['category'];
      if (params['severity']) this.selectedSeverity = params['severity'];
      if (params['search']) this.searchTerm = params['search'];
      this.fetchLogs();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasActiveFilters(): boolean {
    return this.selectedCategory !== 'ALL' ||
           this.selectedSeverity !== 'ALL' ||
           !!this.searchTerm ||
           !!this.startDate ||
           !!this.endDate;
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  fetchLogs(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const filters: AuditFilterParams = {
      page: this.currentPage,
      limit: this.limit,
      category: this.selectedCategory,
      severity: this.selectedSeverity,
      search: this.searchTerm.trim() || undefined,
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined
    };

    this.auditService.getAuditLogs(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.isLoading = false;
          if (res && res.success) {
            this.logs = res.data || [];
            this.totalLogs = res.total;
            this.totalPages = res.totalPages;
            this.currentPage = res.page;
            if (res.stats) {
              this.stats = res.stats;
            }
          }
          this.cdr.markForCheck();
        },
        error: err => {
          this.isLoading = false;
          console.error('Erreur chargement logs audit:', err);
          this.cdr.markForCheck();
        }
      });
  }

  refreshLogs(): void {
    this.fetchLogs();
  }

  setCategoryFilter(categoryId: string): void {
    if (this.selectedCategory === categoryId) return;
    this.selectedCategory = categoryId;
    this.currentPage = 1;
    this.fetchLogs();
  }

  setSeverityFilter(severity: string): void {
    if (this.selectedSeverity === severity) {
      this.selectedSeverity = 'ALL';
    } else {
      this.selectedSeverity = severity;
    }
    this.currentPage = 1;
    this.fetchLogs();
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.fetchLogs();
  }

  resetFilters(): void {
    this.selectedCategory = 'ALL';
    this.selectedSeverity = 'ALL';
    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 1;
    this.fetchLogs();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.fetchLogs();
  }

  openInspectionModal(log: AuditLogItem): void {
    this.selectedLog = log;
    this.cdr.markForCheck();
  }

  closeInspectionModal(): void {
    this.selectedLog = null;
    this.cdr.markForCheck();
  }

  copyMetadataJson(): void {
    if (!this.selectedLog?.metadata) return;
    navigator.clipboard.writeText(JSON.stringify(this.selectedLog.metadata, null, 2));
  }

  exportCsv(): void {
    this.auditService.exportToCsv(this.logs, `audit-export-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  trackByLogId(index: number, item: AuditLogItem): string {
    return item.id;
  }

  splitActorName(name?: string | null): { prenom: string; nom: string } {
    if (!name || !name.trim()) return { prenom: 'Super', nom: 'Administrateur' };
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return { prenom: parts[0], nom: '' };
    const nom = parts.pop()!;
    const prenom = parts.join(' ');
    return { prenom, nom };
  }

  // --- Formatting Helpers ---

  formatActionName(action: string): string {
    const map: Record<string, string> = {
      'EXPENSE_SUBMITTED': 'Dépense Soumise',
      'EXPENSE_APPROVED': 'Dépense Approuvée',
      'EXPENSE_PAID': 'Dépense Payée / Décaissée',
      'EXPENSE_REJECTED': 'Dépense Rejetée',
      'PAYMENT_CONFIRMED': 'Paiement / Cotisation Confirmé(e)',
      'PAYMENT_REJECTED': 'Paiement Rejeté',
      'PROVIDER_SECRET_KEY_ROTATED': 'Rotation Clé Secrète Passerelle',
      'PROFILE_PERMISSIONS_CHANGED': 'Droits / Permissions Profil Modifiés',
      'PROFILE_CREATED': 'Nouveau Profil Créé',
      'PROFILE_UPDATED': 'Profil Administrateur Modifié',
      'PROFILE_DELETED': 'Profil Administrateur Supprimé',
      'USER_UPDATED': 'Compte Admin Mis à Jour',
      'USER_DELETED': 'Compte Admin Supprimé',
      'BULK_DELETE_MEMBERS': 'Suppression Massive d\'Adhérents',
      'DELETE_ALL_MEMBERS': 'Purge Complète des Adhérents',
      'BULK_DELETE_ADMIN_USERS': 'Suppression Massive Administrateurs',
      'BULK_DELETE_CONTRIBUTIONS': 'Suppression Massive de Cotisations',
      'DELETE_ALL_CONTRIBUTIONS': 'Purge Totale des Cotisations',
    };
    return map[action] || action.replace(/_/g, ' ');
  }

  formatEntityId(id: string): string {
    if (!id) return '';
    if (id.length > 8) return id.substring(0, 8) + '...';
    return id;
  }

  getSeverityBadgeClass(severity: AuditSeverity): string {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'INFO':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  getSeverityDotClass(severity: AuditSeverity): string {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 animate-ping';
      case 'HIGH': return 'bg-amber-500';
      case 'MEDIUM': return 'bg-blue-500';
      case 'INFO': default: return 'bg-gray-400';
    }
  }

  getSeverityBoxClass(severity: AuditSeverity): string {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-50/50 border-red-200';
      case 'HIGH': return 'bg-amber-50/50 border-amber-200';
      case 'MEDIUM': return 'bg-blue-50/50 border-blue-200';
      case 'INFO': default: return 'bg-gray-50 border-gray-200';
    }
  }

  getCategoryLabel(category: AuditCategory): string {
    switch (category) {
      case 'FINANCE': return 'Finances & Trésorerie';
      case 'SECURITY': return 'Sécurité & Permissions';
      case 'MEMBERS': return 'Membres & Adhérents';
      case 'SYSTEM': return 'Système & Maintenance';
      default: return category;
    }
  }

  getCategoryIcon(category: AuditCategory): string {
    switch (category) {
      case 'FINANCE': return 'fa-solid fa-vault text-emerald-600';
      case 'SECURITY': return 'fa-solid fa-shield-halved text-indigo-600';
      case 'MEMBERS': return 'fa-solid fa-users text-blue-600';
      case 'SYSTEM': return 'fa-solid fa-server text-gray-600';
      default: return 'fa-solid fa-cube text-gray-500';
    }
  }

  getActorAvatarColor(identifier: string): string {
    if (!identifier) return 'bg-gray-500';
    const colors = [
      'bg-slate-800',
      'bg-emerald-700',
      'bg-indigo-700',
      'bg-rose-700',
      'bg-blue-700',
      'bg-amber-700',
      'bg-teal-700'
    ];
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getActorInitials(nameOrEmail: string): string {
    if (!nameOrEmail) return '?';
    const parts = nameOrEmail.trim().split(/[\s@._-]+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameOrEmail.substring(0, 2).toUpperCase();
  }

  getRelativeTime(dateString: string): string {
    if (!dateString) return '';
    const now = new Date().getTime();
    const diff = now - new Date(dateString).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days < 30) return `Il y a ${days} j`;
    return 'Historique';
  }
}
