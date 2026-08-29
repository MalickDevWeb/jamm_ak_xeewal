
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

type BesoinType = 'ALL' | 'VOCAL' | 'TEXT';

@Component({
  selector: 'app-admin-besoins',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="animate-fade-in-up">

    <!-- ═══════════════════════════ EN-TÊTE ═══════════════════════════ -->
    <div class="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Besoins Déclarés</h2>
        <p class="text-sm text-gray-500 mt-1">
          <span class="font-bold text-gray-700">{{ total }}</span> signalement(s) —
          <span class="text-purple-600 font-semibold">{{ vocalCount }} vocaux</span> ·
          <span class="text-blue-600 font-semibold">{{ textCount }} textes</span>
        </p>
      </div>
      <button (click)="loadBesoins()"
              class="flex items-center gap-2 px-4 py-2 bg-[#022c16] text-white text-sm font-bold rounded-xl hover:bg-[#022c16]/80 transition-all shadow-sm">
        <i [class]="isLoading ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-rotate'"></i>
        Actualiser
      </button>
    </div>

    <!-- ═══════════════════════════ FILTRES ═══════════════════════════ -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

        <!-- Type : Texte / Vocal / Tous -->
        <div>
          <label class="block text-[11px] font-black text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
          <div class="flex rounded-xl border border-gray-200 overflow-hidden">
            <button *ngFor="let t of typeFilters"
                    (click)="setTypeFilter(t.value)"
                    class="flex-1 py-2 text-xs font-bold transition-all"
                    [ngClass]="activeType === t.value
                      ? t.activeClass
                      : 'bg-white text-gray-500 hover:bg-gray-50'">
              <i [class]="t.icon + ' mr-1'"></i>{{ t.label }}
            </button>
          </div>
        </div>

        <!-- Statut -->
        <div>
          <label class="block text-[11px] font-black text-gray-500 uppercase tracking-wide mb-1.5">Statut</label>
          <div class="relative">
            <select [(ngModel)]="filters.statut" (change)="applyFilters()"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#022c16] appearance-none bg-white">
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="EN_COURS">En cours</option>
              <option value="RESOLU">Résolu</option>
            </select>
            <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
          </div>
        </div>

        <!-- Urgence -->
        <div>
          <label class="block text-[11px] font-black text-gray-500 uppercase tracking-wide mb-1.5">Urgence</label>
          <div class="relative">
            <select [(ngModel)]="filters.urgence" (change)="applyFilters()"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#022c16] appearance-none bg-white">
              <option value="">Toutes urgences</option>
              <option value="HAUTE">🔴 Haute</option>
              <option value="MOYENNE">🟡 Moyenne</option>
              <option value="BASSE">🟢 Basse</option>
            </select>
            <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
          </div>
        </div>

        <!-- Quartier -->
        <div>
          <label class="block text-[11px] font-black text-gray-500 uppercase tracking-wide mb-1.5">Quartier</label>
          <div class="relative">
            <select [(ngModel)]="filters.quartier" (change)="applyFilters()"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#022c16] appearance-none bg-white">
              <option value="">Tous les quartiers</option>
              <option *ngFor="let q of quartiers" [value]="q">{{ q }}</option>
            </select>
            <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
          </div>
        </div>

      </div>

      <!-- Ligne 2 : Recherche texte + Reset -->
      <div class="flex items-center gap-3 mt-3">
        <div class="relative flex-1">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input [(ngModel)]="searchQuery"
                 (ngModelChange)="onSearchChange()"
                 type="text"
                 placeholder="Rechercher dans les descriptions..."
                 class="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#022c16]">
        </div>
        <button (click)="resetFilters()"
                class="px-3 py-2 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all flex items-center gap-1.5">
          <i class="fa-solid fa-xmark"></i> Réinitialiser
        </button>
      </div>

      <!-- Tags de filtres actifs -->
      <div *ngIf="hasActiveFilters" class="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
        <span class="text-[11px] text-gray-400 font-medium self-center">Filtres actifs :</span>
        <span *ngIf="filters.statut"
              class="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
          {{ filters.statut.replace('_', ' ') }}
          <button (click)="filters.statut=''; applyFilters()"><i class="fa-solid fa-xmark"></i></button>
        </span>
        <span *ngIf="filters.urgence"
              class="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
          {{ filters.urgence }}
          <button (click)="filters.urgence=''; applyFilters()"><i class="fa-solid fa-xmark"></i></button>
        </span>
        <span *ngIf="filters.quartier"
              class="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
          {{ filters.quartier }}
          <button (click)="filters.quartier=''; applyFilters()"><i class="fa-solid fa-xmark"></i></button>
        </span>
        <span *ngIf="activeType !== 'ALL'"
              class="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
          {{ activeType === 'VOCAL' ? '🎙 Vocal' : '📝 Texte' }}
          <button (click)="setTypeFilter('ALL')"><i class="fa-solid fa-xmark"></i></button>
        </span>
        <span class="text-[11px] text-gray-500 font-bold self-center">→ {{ filteredBesoins.length }} résultat(s)</span>
      </div>
    </div>

    <!-- ═══════════════════════════ CHARGEMENT ═══════════════════════════ -->
    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-500 text-sm">Chargement des signalements...</p>
      </div>
    </div>

    <!-- ═══════════════════════════ VIDE ═══════════════════════════ -->
    <div *ngIf="!isLoading && filteredBesoins.length === 0"
         class="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
      <i class="fa-solid fa-bullhorn text-4xl text-gray-200 mb-4 block"></i>
      <p class="font-bold text-gray-400">Aucun signalement trouvé</p>
      <p class="text-xs text-gray-400 mt-1">Modifiez vos filtres ou attendez de nouveaux signalements.</p>
    </div>

    <!-- ═══════════════════════════ LISTE ═══════════════════════════ -->
    <div *ngIf="!isLoading" class="space-y-4">
      <div *ngFor="let b of filteredBesoins; trackBy: trackById"
           class="bg-white rounded-2xl shadow-sm border transition-all hover:shadow-md group"
           [ngClass]="b.vocalUrl ? 'border-purple-100' : 'border-gray-100'">

        <!-- Bande de couleur latérale urgence -->
        <div class="flex">
          <div class="w-1 rounded-l-2xl shrink-0"
               [ngClass]="getUrgenceBand(b.urgence)"></div>

          <div class="flex-1 p-5">

            <!-- ── Ligne 1 : badges + date ── -->
            <div class="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <div class="flex items-center gap-2 flex-wrap">
                <!-- Badge Type -->
                <span *ngIf="b.vocalUrl"
                      class="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-[11px] font-black">
                  <i class="fa-solid fa-microphone text-[10px]"></i> Message Vocal
                </span>
                <span *ngIf="!b.vocalUrl"
                      class="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-[11px] font-black">
                  <i class="fa-solid fa-align-left text-[10px]"></i> Texte
                </span>
                <!-- Urgence -->
                <span [class]="getUrgenceClass(b.urgence)"
                      class="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  <i class="fa-solid fa-circle-exclamation mr-1"></i>{{ b.urgence }}
                </span>
                <!-- Quartier -->
                <span class="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                  <i class="fa-solid fa-location-dot mr-1 text-gray-400"></i>{{ b.quartier }}
                </span>
              </div>
              <span class="text-xs text-gray-400 shrink-0">
                <i class="fa-regular fa-calendar mr-1"></i>{{ b.createdAt | date:'dd/MM/yyyy à HH:mm' }}
              </span>
            </div>

            <!-- ── Description texte ── -->
            <p *ngIf="b.description && b.description !== '(Message vocal joint)'"
               class="text-sm text-gray-700 mb-3 leading-relaxed font-medium">
              {{ b.description }}
            </p>
            <p *ngIf="b.description === '(Message vocal joint)'"
               class="text-xs text-gray-400 italic mb-3">
              Signalement uniquement par message vocal.
            </p>

            <!-- ── LECTEUR VOCAL ── -->
            <div *ngIf="b.vocalUrl"
                 class="mb-4 bg-purple-50 border border-purple-100 rounded-xl p-3">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs shrink-0">
                  <i class="fa-solid fa-microphone"></i>
                </div>
                <div>
                  <p class="text-xs font-black text-purple-800">Message Vocal du Citoyen</p>
                  <p class="text-[11px] text-purple-500">Cliquez Play pour écouter</p>
                </div>
                <a [href]="b.vocalUrl" target="_blank" download
                   class="ml-auto shrink-0 w-7 h-7 rounded-full bg-purple-200 hover:bg-purple-300 text-purple-700 flex items-center justify-center transition-all"
                   title="Télécharger">
                  <i class="fa-solid fa-download text-xs"></i>
                </a>
              </div>
              <audio [src]="b.vocalUrl" controls preload="none"
                     class="w-full h-9 rounded-lg"
                     style="accent-color: #7c3aed;"></audio>
            </div>

            <!-- ── Contact ── -->
            <div class="flex items-center gap-4 text-xs text-gray-400 mb-4">
              <span class="flex items-center gap-1">
                <i class="fa-solid fa-phone text-gray-300"></i>
                <span class="font-medium text-gray-600">{{ b.contact || 'Anonyme' }}</span>
              </span>
            </div>

            <!-- ── Actions ── -->
            <div class="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <span [class]="getStatutClass(b.statut)"
                    class="text-[11px] font-bold px-3 py-1.5 rounded-full">
                {{ b.statut.replace('_', ' ') }}
              </span>
              <div class="flex gap-2">
                <button *ngIf="b.statut === 'EN_ATTENTE'"
                        (click)="updateStatut(b, 'EN_COURS')"
                        class="px-3 py-1.5 text-xs font-bold text-[#022c16] bg-[#022c16]/10 hover:bg-[#022c16]/20 rounded-lg transition-colors flex items-center gap-1">
                  <i class="fa-solid fa-gears"></i> Traiter
                </button>
                <button *ngIf="b.statut === 'EN_COURS'"
                        (click)="updateStatut(b, 'RESOLU')"
                        class="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors flex items-center gap-1">
                  <i class="fa-solid fa-check"></i> Résoudre
                </button>
                <button *ngIf="b.statut !== 'EN_ATTENTE'"
                        (click)="updateStatut(b, 'EN_ATTENTE')"
                        class="px-3 py-1.5 text-xs font-bold text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors flex items-center gap-1">
                  <i class="fa-solid fa-rotate-left"></i> Réouvrir
                </button>
                <button (click)="deleteBesoin(b)"
                        class="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
  `
})
export class AdminbesoinsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Data
  besoins: any[] = [];
  filteredBesoins: any[] = [];
  total = 0;
  vocalCount = 0;
  textCount = 0;
  isLoading = true;

  // Filtres
  activeType: BesoinType = 'ALL';
  searchQuery = '';
  filters = { statut: '', urgence: '', quartier: '' };

  readonly quartiers = ['Nguinth', 'Grand Thiès', 'Keur Mame El Hadj', 'Médina Fall', 'Som'];

  readonly typeFilters = [
    { value: 'ALL' as BesoinType,   label: 'Tous',  icon: 'fa-solid fa-list',       activeClass: 'bg-gray-800 text-white' },
    { value: 'VOCAL' as BesoinType, label: 'Vocal', icon: 'fa-solid fa-microphone',  activeClass: 'bg-purple-600 text-white' },
    { value: 'TEXT' as BesoinType,  label: 'Texte', icon: 'fa-solid fa-align-left',  activeClass: 'bg-blue-600 text-white' },
  ];

  get hasActiveFilters(): boolean {
    return !!(this.filters.statut || this.filters.urgence || this.filters.quartier ||
              this.searchQuery || this.activeType !== 'ALL');
  }

  constructor(
    private adminData: AdminDataService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Debounce recherche texte : 400ms
    this.searchSubject.pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe(() => this.applyClientFilters());
    this.loadBesoins();
  }

  /**
   * STRATÉGIE PERFORMANCE :
   * - Filtres structurels (statut, urgence, quartier) → envoyés au serveur (Prisma WHERE)
   * - Filtre type vocal/texte + recherche texte → côté client (rapide, sans requête)
   * - trackBy sur l'id → Angular ne re-rend que les éléments modifiés
   */
  loadBesoins() {
    this.isLoading = true;
    this.cdr.markForCheck();

    // Construction des query params serveur
    const params: Record<string, string> = {};
    if (this.filters.statut)  params['statut']  = this.filters.statut;
    if (this.filters.urgence) params['urgence'] = this.filters.urgence;
    if (this.filters.quartier) params['quartier'] = this.filters.quartier;

    const query = new URLSearchParams(params).toString();
    const url = `${environment.apiUrl}/besoins${query ? '?' + query : ''}`;

    this.http.get<any>(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.besoins = res.data ?? [];
        this.total = res.total ?? 0;
        this.vocalCount = this.besoins.filter(b => !!b.vocalUrl).length;
        this.textCount  = this.besoins.filter(b => !b.vocalUrl).length;
        this.isLoading = false;
        this.applyClientFilters();
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilters() {
    // Les filtres structurels déclenchent une nouvelle requête serveur
    this.loadBesoins();
  }

  applyClientFilters() {
    let result = [...this.besoins];

    // Filtre type vocal/texte (client)
    if (this.activeType === 'VOCAL') result = result.filter(b => !!b.vocalUrl);
    if (this.activeType === 'TEXT')  result = result.filter(b => !b.vocalUrl);

    // Recherche texte dans description + contact (client)
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(b =>
        b.description?.toLowerCase().includes(q) ||
        b.contact?.toLowerCase().includes(q) ||
        b.quartier?.toLowerCase().includes(q)
      );
    }

    this.filteredBesoins = result;
    this.cdr.markForCheck();
  }

  setTypeFilter(type: BesoinType) {
    this.activeType = type;
    this.applyClientFilters();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchQuery);
  }

  resetFilters() {
    this.filters = { statut: '', urgence: '', quartier: '' };
    this.activeType = 'ALL';
    this.searchQuery = '';
    this.loadBesoins();
  }

  updateStatut(besoin: any, statut: string) {
    const prev = besoin.statut;
    besoin.statut = statut; // Optimistic update
    this.cdr.markForCheck();

    this.adminData.updateEntity('besoins', besoin.id, { statut }).subscribe({
      error: () => {
        besoin.statut = prev; // Rollback
        this.cdr.markForCheck();
      }
    });
  }

  deleteBesoin(besoin: any) {
    if (!confirm(`Supprimer définitivement ce signalement de ${besoin.quartier} ?`)) return;
    this.besoins = this.besoins.filter(b => b.id !== besoin.id);
    this.applyClientFilters();
    this.adminData.deleteEntity('besoins', besoin.id).subscribe({
      error: () => this.loadBesoins() // Reload si erreur
    });
  }

  trackById(_: number, b: any) { return b.id; }

  getUrgenceBand(u: string): string {
    const map: any = { 'HAUTE': 'bg-red-500', 'MOYENNE': 'bg-yellow-400', 'BASSE': 'bg-green-400' };
    return map[u] || 'bg-gray-300';
  }

  getUrgenceClass(u: string): string {
    const map: any = { 'HAUTE': 'bg-red-100 text-red-700', 'MOYENNE': 'bg-yellow-100 text-yellow-700', 'BASSE': 'bg-green-100 text-green-700' };
    return map[u] || 'bg-gray-100 text-gray-500';
  }

  getStatutClass(s: string): string {
    const map: any = { 'EN_ATTENTE': 'bg-yellow-100 text-yellow-700', 'EN_COURS': 'bg-blue-100 text-blue-700', 'RESOLU': 'bg-green-100 text-green-700' };
    return map[s] || 'bg-gray-100 text-gray-500';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
