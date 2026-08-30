
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

type BesoinType = 'ALL' | 'VOCAL' | 'TEXT';

@Component({
  selector: 'app-admin-besoins',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
  <div class="animate-fade-in-up">

    <!-- ═══════════════════════════ EN-TÊTE ═══════════════════════════ -->
    <div class="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Besoins Déclarés</h2>
        <p class="text-sm text-gray-500 mt-1">
          <span class="font-black text-gray-900">{{ total }}</span> signalement(s) —
          <span class="text-[#022c16] font-bold bg-[#022c16]/10 px-2 py-0.5 rounded">{{ vocalCount }} vocaux</span> ·
          <span class="text-brand-green font-bold bg-brand-green/10 px-2 py-0.5 rounded">{{ textCount }} textes</span>
        </p>
      </div>
      <div class="flex gap-2">
        <button (click)="loadBesoins()"
                class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-all shadow-sm">
          <i [class]="isLoading ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-rotate'"></i>
          Actualiser
        </button>
        <button (click)="openModal()" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#022c16]/80 transition-all flex items-center gap-2">
          <i class="fa-solid fa-plus"></i> Nouveau besoin
        </button>
      </div>
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
              <option *ngFor="let s of statuts" [value]="s.value">{{ s.label }}</option>
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
              <option *ngFor="let u of urgences" [value]="u.value">{{ u.label }}</option>
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
              class="inline-flex items-center gap-1 bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full text-[11px] font-bold">
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
              class="inline-flex items-center gap-1 bg-[#022c16]/10 text-[#022c16] px-2 py-0.5 rounded-full text-[11px] font-bold">
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
           [ngClass]="b.vocalUrl ? 'border-[#022c16]/20' : 'border-gray-100'">

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
                      class="inline-flex items-center gap-1.5 bg-[#022c16]/10 text-[#022c16] px-2.5 py-1 rounded-full text-[11px] font-black">
                  <i class="fa-solid fa-microphone text-[10px]"></i> Message Vocal
                </span>
                <span *ngIf="!b.vocalUrl"
                      class="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green px-2.5 py-1 rounded-full text-[11px] font-black">
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

            <!-- ── LECTEUR VOCAL SÉCURISÉ & ÉLÉGANT ── -->
            <div *ngIf="b.vocalUrl"
                 class="mb-4 relative overflow-hidden bg-gradient-to-r from-[#022c16]/5 to-transparent border border-[#022c16]/10 rounded-2xl p-4">
              <!-- Effet visuel -->
              <div class="absolute right-0 top-0 w-24 h-24 bg-[#022c16]/5 rounded-bl-full pointer-events-none"></div>
              
              <div class="flex items-center justify-between mb-3 relative z-10">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-[#022c16] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#022c16]/20">
                    <i class="fa-solid fa-microphone"></i>
                  </div>
                  <div>
                    <h4 class="text-sm font-black text-gray-900">Message Vocal du Citoyen</h4>
                    <p class="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                      <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      Écoute sécurisée
                    </p>
                  </div>
                </div>
                <a [href]="b.vocalUrl" target="_blank" download
                   class="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#022c16]/30 text-gray-700 hover:text-[#022c16] text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm">
                  <i class="fa-solid fa-cloud-arrow-down"></i> Télécharger
                </a>
              </div>
              <audio [src]="b.vocalUrl" controls preload="none"
                     class="w-full h-10 rounded-xl bg-white shadow-sm border border-gray-100"
                     style="accent-color: #022c16;"></audio>
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

    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-black text-gray-900 text-lg">Nouveau Besoin</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Quartier</label>
            <input type="text" [(ngModel)]="formData.quartier" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Ex: Médina...">
          </div>
          <div class="mb-4 flex gap-4">
            <div class="flex-1">
              <label class="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
              <select [(ngModel)]="formData.categorie" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
                <option value="Infrastructure">Infrastructure</option>
                <option value="Environnement">Environnement</option>
                <option value="Santé">Santé</option>
                <option value="Sécurité">Sécurité</option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-bold text-gray-700 mb-1">Urgence</label>
              <select [(ngModel)]="formData.urgence" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
                <option value="BASSE">Basse</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="HAUTE">Haute</option>
              </select>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Contact (Optionnel)</label>
            <input type="text" [(ngModel)]="formData.contact" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Ex: 77 123 45 67">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea [(ngModel)]="formData.description" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Description du besoin..."></textarea>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Annuler</button>
            <button (click)="submitForm()" class="px-5 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#022c16]/90 rounded-xl transition-colors shadow-lg shadow-[#022c16]/30">Déclarer</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Dialog -->
    <app-confirm-dialog
      [visible]="showConfirmDialog"
      [title]="confirmTitle"
      message="Cette action est irréversible."
      (confirm)="confirmDelete()"
      (cancel)="showConfirmDialog = false">
    </app-confirm-dialog>
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

  showModal = false;
  showConfirmDialog = false;
  confirmTitle = '';
  itemToDelete: any = null;

  formData = {
    quartier: '',
    description: '',
    categorie: 'Infrastructure',
    urgence: 'MOYENNE',
    contact: ''
  };
  vocalCount = 0;
  textCount = 0;
  isLoading = true;

  // Filtres
  activeType: BesoinType = 'ALL';
  searchQuery = '';
  filters = { statut: '', urgence: '', quartier: '' };

  quartiers: any[] = [];
  statuts: any[] = [];
  urgences: any[] = [];

  readonly typeFilters = [
    { value: 'ALL' as BesoinType,   label: 'Tous',  icon: 'fa-solid fa-list',       activeClass: 'bg-gray-800 text-white shadow-md' },
    { value: 'VOCAL' as BesoinType, label: 'Vocal', icon: 'fa-solid fa-microphone',  activeClass: 'bg-[#022c16] text-white shadow-md shadow-[#022c16]/20' },
    { value: 'TEXT' as BesoinType,  label: 'Texte', icon: 'fa-solid fa-align-left',  activeClass: 'bg-brand-green text-white shadow-md shadow-brand-green/20' },
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
    this.loadOptions();
    this.loadBesoins();
  }

  /** Refresh data only (no options reload) - used after actions */
  refreshData() {
    this.loadBesoins();
  }

  private loadOptions() {
    this.adminData.getOptions('statut_besoin').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => { if (res.success) { this.statuts = res.data; this.cdr.markForCheck(); } }
    });
    this.adminData.getOptions('urgence').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => { if (res.success) { this.urgences = res.data; this.cdr.markForCheck(); } }
    });
    this.adminData.getOptions('quartier').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => { if (res.success) { this.quartiers = res.data; this.cdr.markForCheck(); } }
    });
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
    this.itemToDelete = besoin;
    this.confirmTitle = `Supprimer définitivement ce signalement de ${besoin.quartier || 'ce quartier'} ?`;
    this.showConfirmDialog = true;
  }

  confirmDelete() {
    if (!this.itemToDelete) return;
    const id = this.itemToDelete.id;
    this.showConfirmDialog = false;
    this.itemToDelete = null;

    this.besoins = this.besoins.filter(b => b.id !== id);
    this.applyClientFilters();
    this.adminData.deleteEntity('besoins', id).subscribe({
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
    const map: any = { 'EN_ATTENTE': 'bg-yellow-100 text-yellow-700', 'EN_COURS': 'bg-brand-green/10 text-brand-green', 'RESOLU': 'bg-green-100 text-green-700' };
    return map[s] || 'bg-gray-100 text-gray-500';
  }

  openModal() {
    this.formData = { quartier: '', description: '', categorie: 'Infrastructure', urgence: 'MOYENNE', contact: '' };
    this.showModal = true;
  }

  submitForm() {
    if (!this.formData.quartier || !this.formData.description) {
      alert('Veuillez remplir le quartier et la description');
      return;
    }
      this.isLoading = true;
    this.showModal = false;
    this.adminData.createEntity('besoins', {
      quartier: this.formData.quartier,
      description: this.formData.description,
      categorie: this.formData.categorie,
      urgence: this.formData.urgence,
      contact: this.formData.contact,
      statut: 'EN_ATTENTE',
      createdAt: new Date().toISOString()
    }).subscribe(() => {
      this.loadBesoins();
    });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
