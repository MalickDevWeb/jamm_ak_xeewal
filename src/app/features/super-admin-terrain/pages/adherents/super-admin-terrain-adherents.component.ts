import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { validateDateRange } from '../../../../core/utils/validation.utils';
import { QuartierSelectComponent } from '../../../../shared/components/quartier-select/quartier-select.component';

interface Adherent {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  quartier: string;
  centreVote?: string;
  bureauVote?: string;
  createdAt: string;
  agentTerrainId?: string;
}

interface AgentTerrain {
  id: string;
  prenom: string;
  nom: string;
}

@Component({
  selector: 'app-super-admin-terrain-adherents',
  standalone: true,
  imports: [CommonModule, FormsModule, QuartierSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <i class="fa-solid fa-users text-amber-500 text-lg"></i>
            </div>
            Adhérents Inscrits
          </h1>
          <p class="text-sm text-gray-500 mt-1">Consultez et filtrez les citoyens inscrits par les agents de terrain.</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 class="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <i class="fa-solid fa-filter text-brand-green"></i> Filtres de recherche
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <!-- Date Start -->
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date début</label>
            <input type="date" [(ngModel)]="filters.startDate" (change)="loadAdherents()"
                   class="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green">
          </div>
          
          <!-- Date End -->
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date fin</label>
            <input type="date" [(ngModel)]="filters.endDate" (change)="loadAdherents()"
                   class="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green">
          </div>

          <!-- Agent Terrain -->
          <div class="relative z-40">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Agent Terrain</label>
            <app-quartier-select 
              [quartiers]="agentOptions" 
              [(value)]="filters.agentTerrainId" 
              (valueChange)="loadAdherents()" 
              placeholder="Tous les agents" 
              icon="fa-solid fa-street-view">
            </app-quartier-select>
          </div>

          <!-- Quartier -->
          <div class="relative z-30">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Quartier</label>
            <app-quartier-select 
              [quartiers]="quartierOptions" 
              [(value)]="filters.quartier" 
              (valueChange)="loadAdherents()" 
              placeholder="Tous les quartiers" 
              icon="fa-solid fa-location-dot">
            </app-quartier-select>
          </div>

          <!-- Centre de Vote -->
          <div class="relative z-20">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Centre de Vote</label>
            <app-quartier-select 
              [quartiers]="centreOptions" 
              [(value)]="filters.centreVote" 
              (valueChange)="onFilterCentreChange($event)" 
              placeholder="Tous les centres" 
              icon="fa-solid fa-building-flag">
            </app-quartier-select>
          </div>
          
          <!-- Bureau de Vote -->
          <div class="relative z-10">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bureau de Vote</label>
            <app-quartier-select 
              [quartiers]="bureauOptions" 
              [(value)]="filters.bureauVote" 
              (valueChange)="loadAdherents()" 
              placeholder="Tous les bureaux" 
              icon="fa-solid fa-person-booth">
            </app-quartier-select>
          </div>
        </div>

        <div *ngIf="filterError" class="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-medium">
          <i class="fa-solid fa-triangle-exclamation text-sm"></i> {{ filterError }}
        </div>
        <div class="mt-4 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button (click)="resetFilters()" class="text-sm text-gray-500 font-medium hover:text-gray-900 transition-colors">
            Réinitialiser
          </button>
          <button (click)="loadAdherents()" class="bg-brand-green text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#034a28] transition-all flex items-center gap-2">
            <i class="fa-solid fa-magnifying-glass"></i> Filtrer
          </button>
        </div>
      </div>

      <!-- Results -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <p class="text-sm font-bold text-gray-700">Résultats ({{ adherents.length }})</p>
        </div>

        <div *ngIf="isLoading" class="px-5 py-16 text-center">
          <i class="fa-solid fa-circle-notch fa-spin text-2xl text-gray-300 mb-3"></i>
          <p class="text-gray-400 text-sm">Chargement des adhérents...</p>
        </div>

        <div *ngIf="!isLoading && adherents.length === 0" class="px-5 py-16 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center">
            <i class="fa-solid fa-users-slash text-3xl text-gray-300"></i>
          </div>
          <p class="text-gray-500 font-medium text-sm">Aucun adhérent trouvé.</p>
          <p class="text-gray-400 text-xs mt-1">Modifiez vos filtres de recherche.</p>
        </div>

        <div class="overflow-x-auto" *ngIf="!isLoading && adherents.length > 0">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 border-b border-gray-100">
                <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Membre</th>
                <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Téléphone</th>
                <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Localisation</th>
                <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vote</th>
                <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th class="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Agent</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let a of adherents; trackBy: trackById" class="hover:bg-gray-50/50 transition-colors">
                <td class="py-3 px-4">
                  <p class="font-bold text-gray-900 text-sm">{{ a.prenom }} {{ a.nom }}</p>
                </td>
                <td class="py-3 px-4">
                  <p class="text-sm font-medium text-gray-600">{{ a.telephone }}</p>
                </td>
                <td class="py-3 px-4">
                  <p class="text-sm text-gray-600 truncate max-w-[150px]">{{ a.quartier || '-' }}</p>
                </td>
                <td class="py-3 px-4">
                  <div class="text-sm text-gray-600">
                    <p class="truncate max-w-[150px]" [title]="a.centreVote || ''"><span class="font-bold">C:</span> {{ a.centreVote || '-' }}</p>
                    <p class="text-xs text-gray-400"><span class="font-bold">B:</span> {{ a.bureauVote || '-' }}</p>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <p class="text-sm text-gray-600">{{ a.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                </td>
                <td class="py-3 px-4">
                  <span *ngIf="a.agentTerrainId" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                    <i class="fa-solid fa-street-view"></i>
                    {{ getAgentName(a.agentTerrainId) }}
                  </span>
                  <span *ngIf="!a.agentTerrainId" class="text-gray-400 text-xs">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SuperAdminTerrainAdherentsComponent implements OnInit {
  centresVote: { id: string; nom: string; bureaux: number }[] = [];
  filterBureauOptions: string[] = [];
  adherents: Adherent[] = [];
  agents: AgentTerrain[] = [];
  quartierOptionsData: { label: string; value: string }[] = [];
  isLoading = true;

  filters = {
    startDate: '',
    endDate: '',
    agentTerrainId: '',
    quartier: '',
    centreVote: '',
    bureauVote: ''
  };
  filterError = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCentresVote();
    this.loadAgents();
    this.loadQuartiers();
    this.loadAdherents();
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  private getHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem('sat_token')}` };
  }

  loadCentresVote() {
    this.http.get<any>(`${environment.apiUrl}/centres-vote`)
      .pipe(catchError(() => of({ data: [] })))
      .subscribe(res => {
        this.centresVote = res.data || [];
        this.cdr.markForCheck();
      });
  }

  onFilterCentreChange(centreName: string) {
    this.filters.bureauVote = '';
    if (!centreName) {
      this.filterBureauOptions = [];
    } else {
      const centre = this.centresVote.find(c => c.nom === centreName);
      if (centre && centre.bureaux > 0) {
        this.filterBureauOptions = Array.from({ length: centre.bureaux }, (_, i) => `Bureau N°${i + 1}`);
      } else {
        this.filterBureauOptions = [];
      }
    }
    this.loadAdherents();
    this.cdr.markForCheck();
  }

  loadAgents() {
    this.http.get<any>(`${environment.apiUrl}/agents-terrain`, { headers: this.getHeaders() })
      .pipe(catchError(() => of({ data: [] })))
      .subscribe(res => {
        this.agents = res.data || [];
        this.cdr.markForCheck();
      });
  }

  loadQuartiers() {
    this.http.get<any>(`${environment.apiUrl}/options?type=quartier`, { headers: this.getHeaders() })
      .pipe(catchError(() => of({ data: [] })))
      .subscribe(res => {
        this.quartierOptionsData = (res.data || []).map((q: any) => ({ label: q.label, value: q.label }));
        this.cdr.markForCheck();
      });
  }

  get agentOptions() {
    return [{ label: 'Tous les agents', value: '' }, ...this.agents.map(a => ({ label: `${a.prenom} ${a.nom}`, value: a.id }))];
  }

  get quartierOptions() {
    return [{ label: 'Tous les quartiers', value: '' }, ...this.quartierOptionsData];
  }

  get centreOptions() {
    return [{ label: 'Tous les centres', value: '' }, ...this.centresVote.map(c => ({ label: c.nom, value: c.nom }))];
  }

  get bureauOptions() {
    return [{ label: 'Tous les bureaux', value: '' }, ...this.filterBureauOptions.map(b => ({ label: b, value: b }))];
  }

  getAgentName(id: string): string {
    const agent = this.agents.find(a => a.id === id);
    return agent ? `${agent.prenom} ${agent.nom}` : 'Agent inconnu';
  }

  resetFilters() {
    this.filters = {
      startDate: '',
      endDate: '',
      agentTerrainId: '',
      quartier: '',
      centreVote: '',
      bureauVote: ''
    };
    this.loadAdherents();
  }

  loadAdherents() {
    // Validation du range de dates avant appel API
    const dateErr = validateDateRange(this.filters.startDate, this.filters.endDate);
    if (dateErr) {
      this.filterError = dateErr;
      this.cdr.markForCheck();
      return;
    }
    this.filterError = '';

    this.isLoading = true;

    // Build query params
    const params = new URLSearchParams();
    if (this.filters.startDate) params.append('startDate', this.filters.startDate);
    if (this.filters.endDate) params.append('endDate', this.filters.endDate);
    if (this.filters.agentTerrainId) params.append('agentTerrainId', this.filters.agentTerrainId);
    if (this.filters.quartier) params.append('quartier', this.filters.quartier);
    if (this.filters.centreVote) params.append('centreVote', this.filters.centreVote);
    if (this.filters.bureauVote) params.append('bureauVote', this.filters.bureauVote);

    const query = params.toString();
    const url = `${environment.apiUrl}/adherents${query ? '?' + query : ''}`;

    this.http.get<any>(url, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          this.adherents = res.data || [];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }
}
