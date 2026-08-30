
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
  <div class="animate-fade-in-up max-w-[1600px] mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center">
          <i class="fa-solid fa-clipboard-list text-[#008d36] text-2xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Besoins Déclarés</h2>
          <p class="text-[13px] text-gray-500 font-medium mt-0.5">Gérez et suivez toutes les demandes et besoins des quartiers, des urgences et des statuts.</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button (click)="loadBesoins()" class="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-[#022c16] text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
          <i [class]="isLoading ? 'fa-solid fa-circle-notch fa-spin text-[#008d36]' : 'fa-solid fa-rotate text-[#008d36]'"></i> Actualiser
        </button>
        <button (click)="openModal()" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#008d36] transition-colors flex items-center gap-2">
          <i class="fa-solid fa-plus"></i> Nouveau besoin
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="bg-white border border-gray-100 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Type -->
        <div>
          <label class="block text-[11px] font-black text-gray-500 uppercase tracking-wide mb-2">TYPE</label>
          <div class="relative">
             <select class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-semibold text-gray-700 focus:outline-none focus:border-[#022c16] appearance-none" (change)="setTypeFilter($any($event.target).value)">
               <option value="ALL" [selected]="activeType === 'ALL'">Tous</option>
               <option value="VOCAL" [selected]="activeType === 'VOCAL'">Vocal</option>
               <option value="TEXT" [selected]="activeType === 'TEXT'">Texte</option>
             </select>
             <i class="fa-solid fa-list absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
             <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
          </div>
        </div>
        
        <!-- Statut -->
        <div>
          <label class="block text-[11px] font-black text-gray-500 uppercase tracking-wide mb-2">STATUT</label>
          <div class="relative">
            <select [(ngModel)]="filters.statut" (change)="applyFilters()" class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-semibold text-gray-700 focus:outline-none focus:border-[#022c16] appearance-none">
              <option value="">Tous les statuts</option>
              <option *ngFor="let s of statuts" [value]="s.value">{{ s.label }}</option>
            </select>
            <i class="fa-solid fa-filter absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
          </div>
        </div>
        
        <!-- Urgence -->
        <div>
          <label class="block text-[11px] font-black text-gray-500 uppercase tracking-wide mb-2">URGENCE</label>
          <div class="relative">
            <select [(ngModel)]="filters.urgence" (change)="applyFilters()" class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-semibold text-gray-700 focus:outline-none focus:border-[#022c16] appearance-none">
              <option value="">Toutes urgences</option>
              <option *ngFor="let u of urgences" [value]="u.value">{{ u.label }}</option>
            </select>
            <i class="fa-solid fa-triangle-exclamation absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
          </div>
        </div>
        
        <!-- Quartier -->
        <div>
          <label class="block text-[11px] font-black text-gray-500 uppercase tracking-wide mb-2">QUARTIER</label>
          <div class="relative">
            <select [(ngModel)]="filters.quartier" (change)="applyFilters()" class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[13px] font-semibold text-gray-700 focus:outline-none focus:border-[#022c16] appearance-none">
              <option value="">Tous les quartiers</option>
              <option *ngFor="let q of quartiers" [value]="q">{{ q }}</option>
            </select>
            <i class="fa-solid fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none"></i>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 mt-4">
        <div class="relative flex-1">
          <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[#008d36] text-sm"></i>
          <input [(ngModel)]="searchQuery" (ngModelChange)="onSearchChange()" type="text" placeholder="Rechercher dans les descriptions..." class="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[13px] font-medium text-gray-900 focus:outline-none focus:border-[#008d36] focus:ring-1 focus:ring-[#008d36]">
        </div>
        <button (click)="resetFilters()" class="px-4 py-3 text-[13px] font-bold text-[#008d36] hover:bg-[#e6f3eb] rounded-xl transition-colors flex items-center gap-2">
          <i class="fa-solid fa-xmark"></i> Réinitialiser
        </button>
      </div>
    </div>

    <!-- Summary bar -->
    <div class="bg-[#e6f3eb] rounded-2xl p-4 mb-6 flex items-center justify-between border border-[#cce7d6]">
      <div class="flex items-center gap-3">
        <i class="fa-solid fa-bullhorn text-[#008d36] text-lg"></i>
        <span class="font-black text-gray-900">{{ filteredBesoins.length }} besoin(s) déclaré(s)</span>
      </div>
      <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#cce7d6]">
        <i class="fa-regular fa-calendar text-[#008d36] text-sm"></i>
        <span class="text-xs font-bold text-[#022c16]">Aujourd'hui</span>
        <i class="fa-solid fa-chevron-down text-gray-400 text-[10px] ml-1"></i>
      </div>
    </div>

    <!-- Chargement -->
    <div *ngIf="isLoading" class="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-[#008d36] mb-4"></i>
        <p class="text-gray-500 text-sm font-medium">Chargement des signalements...</p>
      </div>
    </div>

    <!-- Vide -->
    <div *ngIf="!isLoading && filteredBesoins.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-bullhorn text-3xl text-gray-300"></i>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">Aucun signalement trouvé</h3>
      <p class="text-sm text-gray-500 mb-6">Modifiez vos filtres ou attendez de nouveaux signalements.</p>
    </div>

    <!-- Grille de besoins -->
    <div *ngIf="!isLoading && filteredBesoins.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div *ngFor="let b of filteredBesoins; trackBy: trackById" 
           class="relative bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col p-5 group hover:shadow-lg transition-shadow border-y border-r border-y-gray-100 border-r-gray-100 border-l-[6px]"
           [ngClass]="getCardColors(b).border">
        
        <!-- Header Badges -->
        <div class="flex items-center justify-between gap-2 mb-4">
          <div class="flex items-center gap-2">
            <!-- Type Badge -->
            <span class="px-2 py-1 rounded-full text-[9px] font-black flex items-center gap-1 uppercase tracking-wide"
                  [ngClass]="[getCardColors(b).bg, getCardColors(b).text]">
              <i class="fa-solid" [ngClass]="b.vocalUrl ? 'fa-microphone' : 'fa-file-lines'"></i>
              {{ b.vocalUrl ? 'Message Vocal' : 'Texte' }}
            </span>
            <!-- Urgence Badge -->
            <span class="px-2 py-1 rounded-full text-[9px] font-black flex items-center gap-1 uppercase tracking-wide"
                  [ngClass]="getUrgenceBadgeClass(b.urgence)">
              <i class="fa-solid fa-circle-exclamation"></i> {{ b.urgence }}
            </span>
          </div>
          <!-- Quartier -->
          <span class="text-[11px] text-gray-500 font-bold flex items-center gap-1 truncate max-w-[100px]" [title]="b.quartier">
            <i class="fa-solid fa-location-dot text-[#008d36]"></i> {{ b.quartier }}
          </span>
        </div>

        <!-- Body -->
        <div class="flex items-start gap-4 mb-4">
          <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm"
               [ngClass]="[getCardColors(b).bg, getCardColors(b).text]">
            <i class="fa-solid text-xl" [ngClass]="b.vocalUrl ? 'fa-microphone' : 'fa-file-lines'"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-black text-[15px] text-gray-900 leading-tight mb-1 truncate">
              {{ b.titre ? b.titre : (b.vocalUrl ? 'Message Vocal du Citoyen' : 'Signalement citoyen') }}
            </h3>
            <p *ngIf="b.vocalUrl" class="text-[11px] text-red-500 font-bold flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> Écoute sécurisée
            </p>
          </div>
        </div>

        <div class="bg-gray-50/80 rounded-xl p-3.5 mb-4 flex-1 border border-gray-100/50">
          <p class="text-[13px] text-gray-600 font-medium leading-relaxed" [class.line-clamp-3]="!b.vocalUrl" [class.line-clamp-2]="b.vocalUrl">
            {{ b.description === '(Message vocal joint)' ? 'Le citoyen signale un problème et demande une intervention rapide des services techniques par message vocal.' : b.description }}
          </p>
        </div>

        <!-- Audio Player for Voice -->
        <div *ngIf="b.vocalUrl" class="mb-4">
          <audio [src]="b.vocalUrl" controls class="w-full h-8" style="accent-color: #008d36;"></audio>
          <div *ngIf="b.contact" class="flex items-center gap-2 mt-3 text-[11px] text-gray-500 font-bold">
            <i class="fa-solid fa-phone text-[#008d36]"></i> {{ b.contact }}
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <span class="text-[11px] text-gray-400 font-medium flex items-center gap-1.5">
            <i class="fa-regular fa-calendar"></i> {{ b.createdAt | date:'dd/MM/yyyy à HH:mm' }}
          </span>
          <div class="flex items-center gap-2">
            <button *ngIf="b.statut === 'EN_ATTENTE' || b.statut === 'EN_COURS'" (click)="updateStatut(b, 'RESOLU')" class="px-3.5 py-1.5 bg-[#e6f3eb] text-[#008d36] hover:bg-[#d1e8d9] rounded-lg text-[11px] font-black uppercase transition-colors flex items-center gap-1.5">
              <i class="fa-solid fa-gears"></i> Traiter
            </button>
            <button *ngIf="b.statut === 'RESOLU'" (click)="updateStatut(b, 'EN_ATTENTE')" class="px-3.5 py-1.5 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-lg text-[11px] font-black uppercase transition-colors flex items-center gap-1.5">
              <i class="fa-solid fa-rotate-left"></i> Réouvrir
            </button>
            <button (click)="deleteBesoin(b)" class="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
              <i class="fa-solid fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in-up my-4 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-black text-xl text-gray-900 flex items-center gap-3">
             <div class="w-10 h-10 rounded-xl bg-[#e6f3eb] flex items-center justify-center">
               <i class="fa-solid fa-plus text-[#008d36]"></i>
             </div>
             Nouveau Besoin
          </h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <div class="p-6 space-y-5">
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Quartier <span class="text-red-500">*</span></label>
            <input type="text" [(ngModel)]="formData.quartier" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" placeholder="Ex: Médina...">
          </div>
          <div class="flex flex-col sm:flex-row gap-5">
            <div class="flex-1">
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Catégorie</label>
              <select [(ngModel)]="formData.categorie" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none appearance-none">
                <option value="Infrastructure">Infrastructure</option>
                <option value="Environnement">Environnement</option>
                <option value="Santé">Santé</option>
                <option value="Sécurité">Sécurité</option>
              </select>
            </div>
            <div class="flex-1">
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Urgence</label>
              <select [(ngModel)]="formData.urgence" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none appearance-none">
                <option value="BASSE">Basse</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="HAUTE">Haute</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Contact (Optionnel)</label>
            <input type="text" [(ngModel)]="formData.contact" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" placeholder="Ex: 77 123 45 67">
          </div>
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Description <span class="text-red-500">*</span></label>
            <textarea [(ngModel)]="formData.description" rows="3" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none resize-none" placeholder="Description du besoin..."></textarea>
          </div>
          <div class="pt-2 flex justify-end gap-3">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">Annuler</button>
            <button (click)="submitForm()" class="px-6 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#008d36] rounded-xl transition-colors shadow-sm flex items-center gap-2">
              <i class="fa-solid fa-plus"></i> Déclarer
            </button>
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

  getCardColors(b: any) {
    if (b.vocalUrl) return { border: 'border-l-[#008d36]', bg: 'bg-[#e6f3eb]', text: 'text-[#008d36]' };
    if (b.urgence === 'HAUTE') return { border: 'border-l-red-500', bg: 'bg-red-50', text: 'text-red-500' };
    if (b.categorie === 'Environnement' || b.categorie === 'Santé') return { border: 'border-l-blue-500', bg: 'bg-blue-50', text: 'text-blue-500' };
    return { border: 'border-l-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-600' };
  }

  getUrgenceBadgeClass(u: string): string {
    const map: any = { 
      'HAUTE': 'bg-red-500 text-white', 
      'MOYENNE': 'bg-orange-100 text-orange-600', 
      'BASSE': 'bg-[#008d36] text-white' 
    };
    return map[u] || 'bg-gray-100 text-gray-500';
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
