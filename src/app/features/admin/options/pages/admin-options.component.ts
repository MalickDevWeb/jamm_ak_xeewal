import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Option } from '../../../../core/services/admin-data.service';
import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

interface CentreVote {
  id: string;
  nom: string;
  bureaux: number;
  zone: string;
}

@Component({
  selector: 'app-admin-options',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertPopupComponent, ConfirmDialogComponent],
  template: `
  <div class="animate-fade-in-up max-w-7xl mx-auto">
    <!-- Alerts & Confirm -->
    <app-alert-popup 
      [message]="alertMessage" 
      [type]="alertType" 
      [visible]="showAlertPopup" 
      (close)="showAlertPopup = false">
    </app-alert-popup>
    <app-confirm-dialog
      [title]="confirmTitle"
      [message]="confirmMessage"
      [visible]="showConfirmDialog"
      (confirm)="onConfirmAction()"
      (cancel)="showConfirmDialog = false">
    </app-confirm-dialog>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center shrink-0">
          <i class="fa-solid fa-list-ul text-[#008d36] text-2xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Quartiers & Catégories</h2>
          <p class="text-[13px] text-gray-500 font-medium mt-0.5">Gérez dynamiquement les quartiers, catégories d'activités, etc.</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Liste des Types (Sidebar gauche) -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 h-fit sticky top-24">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Types de listes</h3>
        <div class="space-y-2">
          <button *ngFor="let type of listTypes" (click)="selectType(type.id)"
                  class="w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3"
                  [ngClass]="selectedType === type.id ? 'bg-[#022c16] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'">
            <i [class]="type.icon + (selectedType === type.id ? ' text-[#008d36]' : ' text-gray-400')"></i>
            {{ type.label }}
          </button>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Ajouter un élément -->
        <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 relative overflow-hidden border-l-[6px] border-l-[#008d36]">
          <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-plus text-[#008d36]"></i> Ajouter : {{ currentTypeLabel }}
          </h3>
          <form (ngSubmit)="addOption()" class="flex flex-col sm:flex-row gap-4 items-end">
            <!-- Normal Option Label -->
            <div class="flex-1 w-full" *ngIf="selectedType !== 'centres_vote'">
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Libellé</label>
              <input type="text" [(ngModel)]="newOption.label" name="label" required
                     placeholder="Nom de l'élément..."
                     class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none">
            </div>

            <!-- Centre de Vote Fields -->
            <ng-container *ngIf="selectedType === 'centres_vote'">
              <div class="flex-1 w-full">
                <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Nom du Centre</label>
                <input type="text" [(ngModel)]="newCentreVote.nom" name="cv_nom" required
                       placeholder="Ex: ECOLE MEDINA FALL..."
                       class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none">
              </div>
              <div class="w-full sm:w-32">
                <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Nbr Bureaux</label>
                <input type="number" min="1" [(ngModel)]="newCentreVote.bureaux" name="cv_bureaux" required
                       class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none">
              </div>
            </ng-container>

            <button type="submit" [disabled]="isSaving || (selectedType === 'centres_vote' ? (!newCentreVote.nom || newCentreVote.bureaux < 1) : !newOption.label)"
                    class="w-full sm:w-auto px-6 py-3 bg-[#022c16] text-white font-black rounded-xl hover:bg-[#008d36] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <i [class]="isSaving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-plus'"></i> Ajouter
            </button>
          </form>
        </div>

        <!-- Liste des éléments -->
        <div class="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 class="font-bold text-gray-900">Éléments existants ({{ displayItems.length }})</h3>
            <button (click)="loadOptions()" class="text-gray-400 hover:text-[#008d36] transition-colors" title="Actualiser">
              <i class="fa-solid fa-rotate-right" [class.fa-spin]="isLoading"></i>
            </button>
          </div>
          
          <div *ngIf="isLoading" class="p-10 flex justify-center">
            <i class="fa-solid fa-circle-notch fa-spin text-3xl text-gray-300"></i>
          </div>

          <div *ngIf="!isLoading && displayItems.length === 0" class="p-10 text-center text-gray-500">
            <i class="fa-regular fa-folder-open text-4xl mb-3 text-gray-300"></i>
            <p class="text-sm font-medium">Aucun élément dans cette liste.</p>
          </div>

          <ul *ngIf="!isLoading && displayItems.length > 0" class="divide-y divide-gray-100">
            <li *ngFor="let opt of displayItems" class="p-4 flex flex-col sm:flex-row items-center justify-between hover:bg-gray-50 transition-colors gap-4">
              
              <div class="flex-1 flex items-center gap-3 w-full" *ngIf="editingId !== opt.id">
                <div *ngIf="selectedType !== 'centres_vote'" class="w-2 h-2 rounded-full" [ngClass]="opt.actif ? 'bg-[#008d36]' : 'bg-red-500'"></div>
                <div *ngIf="selectedType === 'centres_vote'" class="w-2 h-2 rounded-full bg-[#008d36]"></div>
                
                <span class="font-bold text-gray-700">{{ selectedType === 'centres_vote' ? opt.nom : opt.label }}</span>
                
                <span *ngIf="selectedType !== 'centres_vote'" class="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">{{ opt.value }}</span>
                <span *ngIf="selectedType === 'centres_vote'" class="text-[11px] text-[#008d36] font-bold bg-[#e6f3eb] px-2 py-0.5 rounded-full">{{ opt.bureaux }} bureau(x)</span>
              </div>
              
              <div class="flex-1 flex gap-2 w-full" *ngIf="editingId === opt.id">
                <input type="text" [(ngModel)]="editLabel" 
                       class="flex-1 px-3 py-2 bg-white border border-[#008d36] rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#008d36]/20">
                <input *ngIf="selectedType === 'centres_vote'" type="number" min="1" [(ngModel)]="editBureaux" 
                       class="w-24 px-3 py-2 bg-white border border-[#008d36] rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#008d36]/20">
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <ng-container *ngIf="editingId !== opt.id">
                  <button *ngIf="selectedType !== 'centres_vote'" (click)="toggleActif(opt)" 
                          [title]="opt.actif ? 'Désactiver' : 'Activer'"
                          class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          [ngClass]="opt.actif ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50' : 'text-gray-400 hover:text-[#008d36] hover:bg-[#e6f3eb]'">
                    <i [class]="opt.actif ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                  </button>
                  <button (click)="startEdit(opt)" title="Modifier"
                          class="w-8 h-8 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button (click)="askDelete(opt)" title="Supprimer"
                          class="w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </ng-container>

                <ng-container *ngIf="editingId === opt.id">
                  <button (click)="saveEdit(opt)" title="Enregistrer"
                          class="px-3 py-1.5 bg-[#008d36] text-white text-xs font-bold rounded-lg hover:bg-[#022c16] transition-colors">
                    OK
                  </button>
                  <button (click)="editingId = null" title="Annuler"
                          class="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-300 transition-colors">
                    Annuler
                  </button>
                </ng-container>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AdminOptionsComponent implements OnInit {
  listTypes = [
    { id: 'quartier', label: 'Quartiers', icon: 'fa-solid fa-location-dot' },
    { id: 'categorie_besoin', label: 'Catégories de Besoins', icon: 'fa-solid fa-hand-holding-heart' },
    { id: 'categorie_idee', label: 'Pôles pour Idées', icon: 'fa-solid fa-lightbulb' },
    { id: 'centres_vote', label: 'Centres de Vote', icon: 'fa-solid fa-building-flag' }
  ];

  selectedType: string = 'quartier';
  
  options: Option[] = [];
  centresVote: CentreVote[] = [];
  isLoading = false;
  isSaving = false;

  newOption = { label: '' };
  newCentreVote = { nom: '', bureaux: 1 };
  
  editingId: string | null = null;
  editLabel: string = '';
  editBureaux: number = 1;

  // Alert State
  alertMessage = '';
  alertType: AlertType = 'success';
  showAlertPopup = false;

  // Confirm State
  showConfirmDialog = false;
  confirmTitle = '';
  confirmMessage = '';
  optionToDelete: any = null;

  constructor(private adminData: AdminDataService) {}

  ngOnInit() {
    this.loadOptions();
  }

  get currentTypeLabel(): string {
    return this.listTypes.find(t => t.id === this.selectedType)?.label || '';
  }

  get filteredOptions(): Option[] {
    return this.options.filter(o => o.type === this.selectedType);
  }

  get displayItems(): any[] {
    if (this.selectedType === 'centres_vote') {
      return this.centresVote;
    }
    return this.filteredOptions;
  }

  selectType(type: string) {
    this.selectedType = type;
    this.editingId = null;
    this.loadOptions();
  }

  loadOptions() {
    this.isLoading = true;
    if (this.selectedType === 'centres_vote') {
      this.adminData.getCentresVote().subscribe({
        next: (res: any) => {
          if (res.success) this.centresVote = res.data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.showAlert("Erreur lors du chargement des centres", 'error');
        }
      });
    } else {
      this.adminData.getOptions().subscribe({
        next: (res: any) => {
          if (res.success) this.options = res.data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.showAlert("Erreur lors du chargement des options", 'error');
        }
      });
    }
  }

  addOption() {
    if (this.selectedType === 'centres_vote') {
      if (!this.newCentreVote.nom.trim() || this.newCentreVote.bureaux < 1) return;
      this.isSaving = true;
      this.adminData.createCentreVote({ nom: this.newCentreVote.nom, bureaux: this.newCentreVote.bureaux }).subscribe({
        next: () => {
          this.isSaving = false;
          this.newCentreVote = { nom: '', bureaux: 1 };
          this.loadOptions();
          this.showAlert("Centre ajouté avec succès", 'success');
        },
        error: () => {
          this.isSaving = false;
          this.showAlert("Erreur lors de l'ajout", 'error');
        }
      });
      return;
    }

    if (!this.newOption.label.trim()) return;
    this.isSaving = true;
    
    // Générer une value (slug) à partir du label
    const value = this.newOption.label.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');

    const data = {
      type: this.selectedType,
      label: this.newOption.label.trim(),
      value: value,
      ordre: this.filteredOptions.length
    };

    this.adminData.createOption(data).subscribe({
      next: () => {
        this.isSaving = false;
        this.newOption.label = '';
        this.loadOptions();
        this.showAlert("Élément ajouté avec succès", 'success');
      },
      error: () => {
        this.isSaving = false;
        this.showAlert("Erreur lors de l'ajout", 'error');
      }
    });
  }

  startEdit(opt: any) {
    this.editingId = opt.id;
    this.editLabel = this.selectedType === 'centres_vote' ? opt.nom : opt.label;
    if (this.selectedType === 'centres_vote') {
      this.editBureaux = opt.bureaux;
    }
  }

  saveEdit(opt: any) {
    if (this.selectedType === 'centres_vote') {
      if (!this.editLabel.trim() || this.editBureaux < 1) return;
      this.adminData.updateCentreVote(opt.id, { nom: this.editLabel.trim(), bureaux: this.editBureaux }).subscribe({
        next: () => {
          this.editingId = null;
          this.loadOptions();
          this.showAlert("Centre mis à jour", 'success');
        },
        error: () => this.showAlert("Erreur lors de la modification", 'error')
      });
      return;
    }

    if (!this.editLabel.trim() || this.editLabel === opt.label) {
      this.editingId = null;
      return;
    }
    
    this.adminData.updateOption(opt.id, { label: this.editLabel.trim() }).subscribe({
      next: () => {
        this.editingId = null;
        this.loadOptions();
        this.showAlert("Élément mis à jour", 'success');
      },
      error: () => {
        this.showAlert("Erreur lors de la modification", 'error');
      }
    });
  }

  toggleActif(opt: Option) {
    this.adminData.updateOption(opt.id, { actif: !opt.actif }).subscribe({
      next: () => {
        this.loadOptions();
        this.showAlert(`Élément ${!opt.actif ? 'activé' : 'désactivé'}`, 'success');
      }
    });
  }

  askDelete(opt: any) {
    this.optionToDelete = opt;
    this.confirmTitle = "Supprimer l'élément";
    const name = this.selectedType === 'centres_vote' ? opt.nom : opt.label;
    this.confirmMessage = `Êtes-vous sûr de vouloir supprimer "${name}" ? Cette action est irréversible.`;
    this.showConfirmDialog = true;
  }

  onConfirmAction() {
    this.showConfirmDialog = false;
    if (this.optionToDelete) {
      const isCentre = this.selectedType === 'centres_vote';
      const idToDelete = this.optionToDelete.id;
      
      // Suppression optimiste : retirer l'élément de la liste immédiatement
      if (isCentre) {
        this.centresVote = this.centresVote.filter(c => c.id !== idToDelete);
      } else {
        this.options = this.options.filter(o => o.id !== idToDelete);
      }
      this.showAlert("Élément supprimé", 'success');

      const deleteObs = isCentre ? this.adminData.deleteCentreVote(idToDelete) : this.adminData.deleteOption(idToDelete);
      
      // Requête en arrière-plan
      deleteObs.subscribe({
        next: () => {
          // L'élément est déjà retiré du UI, pas besoin de recharger toute la liste
        },
        error: () => {
          this.showAlert("Erreur lors de la suppression. Actualisation...", 'error');
          this.loadOptions(); // Recharger la liste depuis le serveur en cas d'erreur
        }
      });
      
      this.optionToDelete = null;
    }
  }

  showAlert(message: string, type: AlertType) {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertPopup = true;
    setTimeout(() => this.showAlertPopup = false, 3000);
  }
}
