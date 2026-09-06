import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService, GroupItem, AdherentItem } from '../../../../core/services/group.service';
import { AdminDataService } from '../../../../core/services/admin-data.service';
import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';

@Component({
  selector: 'app-admin-groups',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AlertPopupComponent],
  template: `
    <div class="animate-fade-in-up max-w-[1200px] mx-auto pb-12">
      <!-- Alert Popup -->
      <app-alert-popup
        [message]="alertMessage"
        [type]="alertType"
        [visible]="showAlertPopup"
        (close)="showAlertPopup = false">
      </app-alert-popup>

      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center shrink-0">
            <i class="fa-solid fa-users-rectangle text-[#008d36] text-2xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Groupes & Segments</h2>
            <p class="text-[13px] text-gray-500 font-medium mt-0.5">
              Gérez les groupes (quartiers, cellules, commissions) pour cibler vos notifications.
            </p>
          </div>
        </div>
        <button
          (click)="openCreateModal()"
          class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#008d36] transition-all flex items-center gap-2">
          <i class="fa-solid fa-plus"></i> Créer un groupe
        </button>
      </div>

      <!-- Groups List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngIf="isLoading" class="col-span-full py-12 text-center text-gray-400">
          <i class="fa-solid fa-spinner animate-spin text-2xl text-[#008d36] mb-2 block"></i>
          Chargement des groupes...
        </div>

        <div *ngIf="!isLoading && groups.length === 0" class="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          <i class="fa-solid fa-folder-open text-3xl mb-2 block text-gray-300"></i>
          Aucun groupe créé.
        </div>

        <div *ngFor="let g of groups" class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[#e6f3eb] text-[#008d36]">
                  <i class="fa-solid fa-users text-xl"></i>
                </div>
                <div>
                  <h3 class="font-bold text-gray-900 text-base leading-tight">{{ g.name }}</h3>
                  <p class="text-xs text-gray-500 font-semibold">{{ g.type }}</p>
                </div>
              </div>
              <span class="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-md">
                {{ g._count?.GroupMember || 0 }} Membres
              </span>
            </div>
            <p class="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[32px]">{{ g.description || 'Aucune description' }}</p>
          </div>
          
          <div class="pt-4 border-t border-gray-100 flex justify-between">
            <button
              (click)="openAssignModal(g)"
              class="px-4 py-2 text-xs font-bold text-[#022c16] bg-[#e6f3eb] hover:bg-[#008d36] hover:text-white rounded-xl transition-all flex items-center gap-1.5">
              <i class="fa-solid fa-user-plus"></i>
              Gérer les membres
            </button>
          </div>
        </div>
      </div>

      <!-- Create Group Modal -->
      <div *ngIf="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div class="px-6 py-5 bg-[#022c16] text-white flex items-center justify-between">
            <h3 class="font-bold text-lg">Nouveau Groupe</h3>
            <button (click)="showCreateModal = false" class="text-white/70 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1.5">Nom du Groupe <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="groupForm.name" class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1.5">Type <span class="text-red-500">*</span></label>
              <select [(ngModel)]="groupForm.type" class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]">
                <option value="QUARTIER">Quartier</option>
                <option value="CELLULE">Cellule</option>
                <option value="COMMISSION">Commission</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1.5">Description</label>
              <textarea [(ngModel)]="groupForm.description" rows="3" class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d36]/20 focus:border-[#008d36]"></textarea>
            </div>
          </div>
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button (click)="showCreateModal = false" class="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Annuler</button>
            <button (click)="createGroup()" [disabled]="isSaving || !groupForm.name" class="px-5 py-2 text-sm font-bold text-white bg-[#022c16] hover:bg-[#008d36] rounded-xl flex items-center gap-2 disabled:opacity-50">
              <i *ngIf="isSaving" class="fa-solid fa-spinner animate-spin"></i> Créer
            </button>
          </div>
        </div>
      </div>

      <!-- Assign Members Modal -->
      <div *ngIf="showAssignModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div class="px-6 py-5 bg-[#022c16] text-white flex items-center justify-between">
            <div>
              <h3 class="font-bold text-lg">Affecter des membres</h3>
              <p class="text-xs text-white/70">Groupe: {{ selectedGroup?.name }}</p>
            </div>
            <button (click)="showAssignModal = false" class="text-white/70 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="p-6 flex-1 overflow-y-auto">
            <div class="mb-4 space-y-3">
              <div class="flex flex-wrap gap-2">
                <input type="text" [(ngModel)]="searchAdherent" (ngModelChange)="filterAdherents()" placeholder="Rechercher par nom, prénom ou téléphone..." class="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#008d36]" />
              </div>
              <div class="flex flex-wrap gap-2 bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                <select [(ngModel)]="selectedQuartierFilter" (ngModelChange)="filterAdherents()" class="flex-1 min-w-[120px] px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#008d36]">
                  <option value="">Tous quartiers</option>
                  <option *ngFor="let q of availableQuartiers" [value]="q">{{ q }}</option>
                </select>
                <select [(ngModel)]="selectedStatutFilter" (ngModelChange)="filterAdherents()" class="flex-1 min-w-[120px] px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#008d36]">
                  <option value="">Tous statuts</option>
                  <option *ngFor="let s of availableStatuts" [value]="s">{{ s }}</option>
                </select>
                <select [(ngModel)]="selectedProfessionFilter" (ngModelChange)="filterAdherents()" class="flex-1 min-w-[120px] px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#008d36]">
                  <option value="">Toutes professions</option>
                  <option *ngFor="let p of availableProfessions" [value]="p">{{ p }}</option>
                </select>
                <select [(ngModel)]="selectedCompetenceFilter" (ngModelChange)="filterAdherents()" class="flex-1 min-w-[120px] px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#008d36]">
                  <option value="">Toutes compétences</option>
                  <option *ngFor="let c of availableCompetences" [value]="c">{{ c }}</option>
                </select>
                <select [(ngModel)]="selectedDisponibiliteFilter" (ngModelChange)="filterAdherents()" class="flex-1 min-w-[120px] px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#008d36]">
                  <option value="">Toutes dispo.</option>
                  <option *ngFor="let d of availableDisponibilites" [value]="d">{{ d }}</option>
                </select>
              </div>
              <div class="flex items-center gap-2 px-1" *ngIf="filteredAdherents.length > 0">
                <input type="checkbox" id="selectAll" [checked]="isAllSelected" (change)="toggleAllFiltered($event)" class="w-4 h-4 text-[#008d36] rounded" />
                <label for="selectAll" class="text-sm text-gray-700 font-bold cursor-pointer">Tout sélectionner ({{filteredAdherents.length}} trouvés)</label>
              </div>
            </div>
            <div class="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
              <div *ngFor="let a of filteredAdherents" class="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer" (click)="toggleSelection(a.id)">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{{ a.prenom.charAt(0) }}{{ a.nom.charAt(0) }}</div>
                  <div>
                    <p class="text-sm font-bold text-gray-900">{{ a.prenom }} {{ a.nom }}</p>
                    <p class="text-xs text-gray-500">{{ a.telephone }} • {{ a.quartier }}</p>
                  </div>
                </div>
                <input type="checkbox" [checked]="selectedMemberIds.has(a.id)" class="w-4 h-4 text-[#008d36]" />
              </div>
            </div>
            <div *ngIf="filteredAdherents.length === 0" class="text-center py-4 text-gray-400 text-sm">
              Aucun adhérent trouvé.
            </div>
          </div>
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <span class="text-sm font-bold text-[#008d36]">{{ selectedMemberIds.size }} sélectionné(s)</span>
            <div class="flex gap-3">
              <button (click)="showAssignModal = false" class="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl">Fermer</button>
              <button (click)="assignMembers()" [disabled]="isSaving || selectedMemberIds.size === 0" class="px-5 py-2 text-sm font-bold text-white bg-[#022c16] hover:bg-[#008d36] rounded-xl flex items-center gap-2 disabled:opacity-50">
                <i *ngIf="isSaving" class="fa-solid fa-spinner animate-spin"></i> Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminGroupsComponent implements OnInit {
  groups: GroupItem[] = [];
  allAdherents: AdherentItem[] = [];
  filteredAdherents: AdherentItem[] = [];
  searchAdherent = '';
  
  isLoading = false;
  isSaving = false;
  
  showCreateModal = false;
  groupForm = { name: '', type: 'QUARTIER', description: '' };

  showAssignModal = false;
  selectedGroup: GroupItem | null = null;
  selectedMemberIds = new Set<string>();
  
  selectedQuartierFilter = '';
  selectedStatutFilter = '';
  selectedProfessionFilter = '';
  selectedCompetenceFilter = '';
  selectedDisponibiliteFilter = '';

  availableQuartiers: string[] = [];
  availableStatuts: string[] = [];
  availableProfessions: string[] = [];
  availableCompetences: string[] = [];
  availableDisponibilites: string[] = [];
  
  isAllSelected = false;

  showAlertPopup = false;
  alertMessage = '';
  alertType: AlertType = 'success';

  constructor(
    private groupService: GroupService,
    private adminData: AdminDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadGroups();
    this.loadAdherents();
  }

  loadGroups() {
    this.isLoading = true;
    this.groupService.getGroups().subscribe({
      next: (res) => {
        this.groups = res.data || [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.triggerAlert('Erreur de chargement des groupes', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  loadAdherents() {
    this.adminData.getAdherents().subscribe(res => {
      this.allAdherents = res.data || [];
      this.availableQuartiers = [...new Set(this.allAdherents.map(a => a.quartier).filter(Boolean) as string[])].sort();
      this.availableStatuts = [...new Set(this.allAdherents.map(a => a.statut).filter(Boolean) as string[])].sort();
      this.availableProfessions = [...new Set(this.allAdherents.map(a => a.profession).filter(Boolean) as string[])].sort();
      this.availableCompetences = [...new Set(this.allAdherents.map(a => a.competences).filter(Boolean) as string[])].sort();
      this.availableDisponibilites = [...new Set(this.allAdherents.map(a => a.disponibilite).filter(Boolean) as string[])].sort();
      this.filterAdherents();
      this.cdr.markForCheck();
    });
  }

  filterAdherents() {
    const q = this.searchAdherent.toLowerCase().trim();
    let filtered = this.allAdherents;
    
    if (this.selectedQuartierFilter) {
      filtered = filtered.filter(a => a.quartier === this.selectedQuartierFilter);
    }
    if (this.selectedStatutFilter) {
      filtered = filtered.filter(a => a.statut === this.selectedStatutFilter);
    }
    if (this.selectedProfessionFilter) {
      filtered = filtered.filter(a => a.profession === this.selectedProfessionFilter);
    }
    if (this.selectedCompetenceFilter) {
      filtered = filtered.filter(a => a.competences === this.selectedCompetenceFilter);
    }
    if (this.selectedDisponibiliteFilter) {
      filtered = filtered.filter(a => a.disponibilite === this.selectedDisponibiliteFilter);
    }
    
    if (q) {
      filtered = filtered.filter(a => 
        a.prenom.toLowerCase().includes(q) || 
        a.nom.toLowerCase().includes(q) || 
        a.telephone.includes(q)
      );
    }
    
    this.filteredAdherents = filtered;
    this.updateAllSelected();
    this.cdr.markForCheck();
  }

  updateAllSelected() {
    if (this.filteredAdherents.length === 0) {
      this.isAllSelected = false;
      return;
    }
    this.isAllSelected = this.filteredAdherents.every(a => this.selectedMemberIds.has(a.id));
  }

  toggleAllFiltered(event: any) {
    const checked = event.target.checked;
    if (checked) {
      this.filteredAdherents.forEach(a => this.selectedMemberIds.add(a.id));
    } else {
      this.filteredAdherents.forEach(a => this.selectedMemberIds.delete(a.id));
    }
    this.updateAllSelected();
    this.cdr.markForCheck();
  }

  openCreateModal() {
    this.groupForm = { name: '', type: 'QUARTIER', description: '' };
    this.showCreateModal = true;
  }

  createGroup() {
    this.isSaving = true;
    this.groupService.createGroup(this.groupForm).subscribe({
      next: () => {
        this.isSaving = false;
        this.showCreateModal = false;
        this.triggerAlert('Groupe créé avec succès', 'success');
        this.loadGroups();
      },
      error: () => {
        this.isSaving = false;
        this.triggerAlert('Erreur lors de la création', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  openAssignModal(group: GroupItem) {
    this.selectedGroup = group;
    this.selectedMemberIds.clear();
    this.searchAdherent = '';
    this.selectedQuartierFilter = '';
    this.selectedStatutFilter = '';
    this.selectedProfessionFilter = '';
    this.selectedCompetenceFilter = '';
    this.selectedDisponibiliteFilter = '';
    this.filterAdherents();
    this.showAssignModal = true;
  }

  toggleSelection(id: string) {
    if (this.selectedMemberIds.has(id)) {
      this.selectedMemberIds.delete(id);
    } else {
      this.selectedMemberIds.add(id);
    }
    this.updateAllSelected();
    this.cdr.markForCheck();
  }

  assignMembers() {
    if (!this.selectedGroup) return;
    this.isSaving = true;
    this.groupService.addMembersToGroup(this.selectedGroup.id, Array.from(this.selectedMemberIds)).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.showAssignModal = false;
        this.triggerAlert(res.message || 'Membres ajoutés', 'success');
        this.loadGroups();
      },
      error: () => {
        this.isSaving = false;
        this.triggerAlert('Erreur lors de l\'ajout', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  triggerAlert(message: string, type: AlertType) {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertPopup = true;
  }
}
