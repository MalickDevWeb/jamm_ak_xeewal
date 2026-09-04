import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';
import { validateSenegalPhone, normalizeSenegalPhone, validatePassword, requireText } from '../../../../core/utils/validation.utils';

interface AgentTerrain {
  id: string;
  prenom: string;
  nom: string;
  telephone: string;
  points: number;
  actif: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-super-admin-terrain-agents',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, AlertPopupComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Alert Popup -->
      <app-alert-popup
        [message]="alertMessage"
        [type]="alertType"
        [visible]="showAlert"
        (close)="showAlert = false">
      </app-alert-popup>

      <!-- Confirm Dialog -->
      <app-confirm-dialog
        [title]="confirmTitle"
        [message]="confirmMessage"
        [visible]="showConfirmDialog"
        (confirm)="onConfirmDelete()"
        (cancel)="showConfirmDialog = false">
      </app-confirm-dialog>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <i class="fa-solid fa-street-view text-amber-500 text-lg"></i>
            </div>
            Hommes de Terrain
          </h1>
          <p class="text-sm text-gray-500 mt-1">Créez et gérez les agents qui inscrivent les citoyens sur le terrain.</p>
        </div>
        <button (click)="showCreateModal = true"
                class="flex items-center gap-2 px-5 py-2.5 bg-brand-yellow text-brand-dark font-bold text-sm rounded-xl hover:bg-yellow-500 transition-all shadow-sm">
          <i class="fa-solid fa-user-plus"></i>
          Créer un agent
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total agents</p>
          <p class="text-2xl font-black text-gray-900">{{ agents.length }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Actifs</p>
          <p class="text-2xl font-black text-green-600">{{ activeCount }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Inscriptions totales</p>
          <p class="text-2xl font-black text-amber-500">{{ totalPoints }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Moyenne / agent</p>
          <p class="text-2xl font-black text-blue-600">{{ agents.length > 0 ? (totalPoints / agents.length | number:'1.0-0') : 0 }}</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
          <p class="text-sm font-bold text-gray-700">Liste des agents ({{ agents.length }})</p>
        </div>

        <div *ngIf="agents.length === 0 && !isLoading" class="px-5 py-16 text-center">
          <div class="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-2xl flex items-center justify-center">
            <i class="fa-solid fa-street-view text-3xl text-gray-300"></i>
          </div>
          <p class="text-gray-500 font-medium text-sm">Aucun agent terrain créé.</p>
          <p class="text-gray-400 text-xs mt-1">Créez votre premier agent pour commencer les inscriptions terrain.</p>
        </div>

        <div *ngIf="isLoading" class="px-5 py-16 text-center">
          <i class="fa-solid fa-circle-notch fa-spin text-2xl text-gray-300 mb-3"></i>
          <p class="text-gray-400 text-sm">Chargement...</p>
        </div>

        <div *ngIf="!isLoading && agents.length > 0" class="divide-y divide-gray-50">
          <div *ngFor="let agent of agents; trackBy: trackByAgent" 
               class="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                 [ngClass]="agent.actif ? 'bg-gradient-to-br from-[#022c16] to-[#034a28]' : 'bg-gray-300'">
              {{ agent.prenom[0] }}{{ agent.nom[0] }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <p class="font-bold text-gray-900 text-sm truncate">{{ agent.prenom }} {{ agent.nom }}</p>
                <span *ngIf="!agent.actif" class="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Désactivé</span>
              </div>
              <p class="text-xs text-gray-400 truncate">{{ agent.telephone }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Créé le {{ agent.createdAt | date:'dd/MM/yyyy' }}</p>
            </div>

            <div class="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl shrink-0">
              <i class="fa-solid fa-trophy text-amber-500 text-xs"></i>
              <span class="text-amber-700 font-black text-sm">{{ agent.points }}</span>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button (click)="toggleAgent(agent)" 
                      [title]="agent.actif ? 'Désactiver' : 'Activer'"
                      class="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                      [ngClass]="agent.actif ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'">
                <i [class]="agent.actif ? 'fa-solid fa-toggle-on text-lg' : 'fa-solid fa-toggle-off text-lg'"></i>
              </button>
              <button (click)="deleteAgent(agent)" title="Supprimer"
                      class="w-9 h-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all">
                <i class="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== CREATE MODAL ===== -->
    <div *ngIf="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" (click)="showCreateModal = false">
      <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
      <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8" (click)="$event.stopPropagation()">
        <button (click)="closeModal()" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <i class="fa-solid fa-user-plus text-amber-500 text-xl"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Nouvel agent terrain</h3>
            <p class="text-xs text-gray-500">Créez un accès pour un agent de terrain.</p>
          </div>
        </div>

        <form (submit)="onCreateAgent($event)" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Prénom *</label>
              <input type="text" [(ngModel)]="newAgent.prenom" name="prenom" required
                     class="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all"
                     placeholder="Prénom" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Nom *</label>
              <input type="text" [(ngModel)]="newAgent.nom" name="nom" required
                     class="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all"
                     placeholder="Nom" />
            </div>
          </div>
          <div *ngIf="!createSuccess">
            <label class="block text-sm font-bold text-gray-700 mb-1">Téléphone *</label>
            <input type="tel" [(ngModel)]="newAgent.telephone" name="telephone" required
                   class="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all font-bold"
                   placeholder="77 123 45 67" />
          </div>
          <div *ngIf="!createSuccess">
            <label class="block text-sm font-bold text-gray-700 mb-1">Mot de passe *</label>
            <div class="relative">
              <input [type]="showNewPassword ? 'text' : 'password'" [(ngModel)]="newAgent.password" name="password" required minlength="6"
                     class="w-full border border-gray-200 rounded-xl p-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all"
                     placeholder="Minimum 6 caractères" />
              <button type="button" (click)="showNewPassword = !showNewPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <i [class]="showNewPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
              </button>
            </div>
          </div>

          <div *ngIf="createError" class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
            <i class="fa-solid fa-circle-exclamation text-red-500 text-sm"></i>
            <span class="text-sm text-red-600">{{ createError }}</span>
          </div>

          <div *ngIf="createSuccess" class="flex flex-col gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
            <div class="flex items-center gap-2 mb-2">
              <i class="fa-solid fa-circle-check text-green-500 text-lg"></i>
              <span class="text-sm text-green-800 font-bold">Agent créé avec succès !</span>
            </div>
            
            <a [href]="getWhatsappShareLink()" target="_blank"
               class="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:bg-[#1DA851] hover:shadow-md transition-all active:scale-95">
              <i class="fa-brands fa-whatsapp text-xl"></i>
              Envoyer les accès par WhatsApp
            </a>
            
            <button type="button" (click)="closeModal()" class="mt-2 text-sm text-gray-500 underline hover:text-gray-800 transition-colors">
              Fermer la fenêtre
            </button>
          </div>

          <button *ngIf="!createSuccess" type="submit" [disabled]="isCreating"
                  class="w-full py-3 bg-[#022c16] text-white font-bold rounded-xl hover:bg-[#034a28] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-md">
            <i *ngIf="isCreating" class="fa-solid fa-circle-notch fa-spin"></i>
            <span>{{ isCreating ? 'Création...' : 'Créer l\\'agent' }}</span>
          </button>
        </form>
      </div>
    </div>
  `
})
export class SuperAdminTerrainAgentsComponent implements OnInit {
  agents: AgentTerrain[] = [];
  isLoading = true;

  showCreateModal = false;
  newAgent = { prenom: '', nom: '', telephone: '', password: '' };
  isCreating = false;
  createError = '';
  createSuccess = false;
  showNewPassword = false;

  // Alert
  alertMessage = '';
  alertType: AlertType = 'success';
  showAlert = false;

  // Confirm Dialog
  showConfirmDialog = false;
  confirmTitle = '';
  confirmMessage = '';
  agentToDelete: AgentTerrain | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAgents();
  }

  get activeCount(): number {
    return this.agents.filter(a => a.actif).length;
  }

  get totalPoints(): number {
    return this.agents.reduce((sum, a) => sum + a.points, 0);
  }

  trackByAgent(index: number, agent: AgentTerrain): string {
    return agent.id;
  }

  private getHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem('sat_token')}` };
  }

  loadAgents() {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/agents-terrain`, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.agents = res.data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onCreateAgent(event: Event) {
    event.preventDefault();
    this.createError = '';
    this.createSuccess = false;

    // 1. Validation des champs texte obligatoires
    const prenomErr = requireText(this.newAgent.prenom, 'Le prénom');
    if (prenomErr) { this.createError = prenomErr; this.cdr.markForCheck(); return; }
    const nomErr = requireText(this.newAgent.nom, 'Le nom');
    if (nomErr) { this.createError = nomErr; this.cdr.markForCheck(); return; }

    // 2. Validation du téléphone (format sénégalais)
    const phoneCheck = validateSenegalPhone(this.newAgent.telephone);
    if (!phoneCheck.valid) {
      this.createError = phoneCheck.message || 'Numéro de téléphone invalide.';
      this.cdr.markForCheck();
      return;
    }

    // 3. Validation du mot de passe
    const pwdCheck = validatePassword(this.newAgent.password);
    if (pwdCheck) {
      this.createError = pwdCheck;
      this.cdr.markForCheck();
      return;
    }

    this.isCreating = true;

    // Normaliser le téléphone avant envoi
    const payload = {
      ...this.newAgent,
      telephone: normalizeSenegalPhone(this.newAgent.telephone) || this.newAgent.telephone
    };

    this.http.post<any>(`${environment.apiUrl}/agents-terrain`, payload, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        this.isCreating = false;
        if (res.success) {
          this.createSuccess = true;
          this.agents.unshift(res.data);
        } else {
          this.createError = res.message || 'Erreur lors de la création.';
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isCreating = false;
        this.createError = err.error?.message || 'Erreur lors de la création.';
        this.cdr.markForCheck();
      }
    });
  }

  closeModal() {
    this.showCreateModal = false;
    this.createSuccess = false;
    this.newAgent = { prenom: '', nom: '', telephone: '', password: '' };
    this.createError = '';
    this.cdr.markForCheck();
  }

  getWhatsappShareLink(): string {
    const loginUrl = window.location.origin + '/terrain/login';
    const normalizedPhone = normalizeSenegalPhone(this.newAgent.telephone) || this.newAgent.telephone;
    const message = `Bonjour ${this.newAgent.prenom},\n\nVoici vos accès pour l'application JÀMM AK XÉEWAL (Agent Terrain):\n\nLien: ${loginUrl}\nTéléphone: ${normalizedPhone}\nMot de passe: ${this.newAgent.password}\n\nBon courage !`;
    return `https://wa.me/${normalizedPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;
  }

  toggleAgent(agent: AgentTerrain) {
    this.http.put<any>(`${environment.apiUrl}/agents-terrain/${agent.id}`, { actif: !agent.actif }, { headers: this.getHeaders() }).subscribe({
      next: (res) => {
        if (res.success) {
          agent.actif = res.data.actif;
          this.cdr.markForCheck();
        }
      }
    });
  }

  deleteAgent(agent: AgentTerrain) {
    this.agentToDelete = agent;
    this.confirmTitle = 'Supprimer l\'agent';
    this.confirmMessage = `Êtes-vous sûr de vouloir supprimer ${agent.prenom} ${agent.nom} ? Cette action est irréversible.`;
    this.showConfirmDialog = true;
    this.cdr.markForCheck();
  }

  onConfirmDelete() {
    this.showConfirmDialog = false;
    if (!this.agentToDelete) return;
    this.http.delete<any>(`${environment.apiUrl}/agents-terrain/${this.agentToDelete.id}`, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.agents = this.agents.filter(a => a.id !== this.agentToDelete!.id);
        this.agentToDelete = null;
        this.triggerAlert('Agent supprimé avec succès', 'success');
      },
      error: () => {
        this.agentToDelete = null;
        this.triggerAlert('Erreur lors de la suppression', 'error');
      }
    });
  }

  triggerAlert(message: string, type: AlertType) {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    this.cdr.markForCheck();
    setTimeout(() => { this.showAlert = false; this.cdr.markForCheck(); }, 3000);
  }
}
