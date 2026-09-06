import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { BulkDeleteService } from '../../../../core/services/bulk-delete.service';
import { BulkActionsBarComponent } from '../../../../shared/components/bulk-actions-bar/bulk-actions-bar.component';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-comptes-rendus',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AlertPopupComponent, ConfirmDialogComponent, BulkActionsBarComponent],
  template: `
  <div class="animate-fade-in-up max-w-[1600px] mx-auto">

    <!-- Alert Popup -->
    <app-alert-popup 
      [message]="alertMessage" 
      [type]="alertType" 
      [visible]="showAlertPopup" 
      (close)="showAlertPopup = false">
    </app-alert-popup>

    <!-- Confirm Dialog -->
    <app-confirm-dialog
      [title]="confirmTitle"
      [message]="confirmMessage"
      [visible]="showConfirmDialog"
      (confirm)="onConfirmAction()"
      (cancel)="showConfirmDialog = false">
    </app-confirm-dialog>


    

    <!-- Bulk Actions Bar -->
    <app-bulk-actions-bar
      [selectedCount]="selectedIds.size"
      [loading]="loadingBulk"
      (deleteSelected)="bulkDeleteSelected()"
      (deleteAll)="bulkDeleteAll()"
      (clear)="clearSelection()">
    </app-bulk-actions-bar>

<!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center shrink-0">
          <i class="fa-solid fa-file-contract text-[#008d36] text-2xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Comptes-Rendus</h2>
          <p class="text-[13px] text-gray-500 font-medium mt-0.5">{{ total }} rapports et synthèses disponibles.</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button (click)="action('Rédiger')" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#008d36] transition-colors flex items-center gap-2">
          <i class="fa-solid fa-pen-nib"></i> Rédiger
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div *ngIf="isLoading" class="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-[#008d36] mb-4"></i>
        <p class="text-gray-500 text-sm font-medium">Chargement des comptes-rendus...</p>
      </div>
    </div>

    <div *ngIf="!isLoading && comptesRendus.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-file-contract text-3xl text-gray-300"></i>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-1">Aucun compte-rendu</h3>
      <p class="text-sm text-gray-500">Rédigez le premier rapport pour cette instance.</p>
    </div>

    <!-- Select All Bar -->
    <div *ngIf="!isLoading && comptesRendus.length > 0" class="mb-4 flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100">
      <input type="checkbox" [checked]="selectedIds.size === comptesRendus.length && comptesRendus.length > 0" (change)="toggleAllSelection()" class="w-4 h-4 cursor-pointer accent-[#008d36]">
      <span class="text-sm font-semibold text-gray-600">Sélectionner tout ({{ comptesRendus.length }})</span>
    </div>

    <div *ngIf="!isLoading && comptesRendus.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div *ngFor="let cr of comptesRendus; trackBy: trackById" class="relative bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 p-5 group hover:shadow-lg transition-all relative overflow-hidden flex flex-col"
           [class.bg-red-50]="isSelected(cr.id)"
           [class.ring-2]="isSelected(cr.id)"
           [class.ring-red-400]="isSelected(cr.id)">
        <input type="checkbox" [checked]="isSelected(cr.id)" (change)="toggleSelection(cr.id)" class="absolute top-3 right-3 w-4 h-4 cursor-pointer accent-[#008d36] z-10">
        
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span [class]="getStatutClass(cr.statut)" class="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{{ cr.statut }}</span>
            </div>
            <h3 class="text-[16px] font-bold text-gray-900 leading-snug line-clamp-2">{{ cr.titre }}</h3>
            <p class="text-[13px] text-gray-500 font-medium mt-2 flex items-center gap-1.5"><i class="fa-solid fa-location-dot text-gray-400"></i> {{ cr.lieu }}</p>
            <p class="text-[13px] text-gray-500 font-medium mt-1 flex items-center gap-1.5"><i class="fa-solid fa-user-pen text-gray-400"></i> {{ cr.auteur }}</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-[#e6f3eb] flex items-center justify-center shrink-0">
             <i class="fa-regular fa-file-lines text-[#008d36] text-xl"></i>
          </div>
        </div>
        
        <div class="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
          <span class="text-xs font-bold text-gray-400 flex items-center gap-1.5"><i class="fa-regular fa-calendar"></i> {{ cr.date | date:'dd/MM/yyyy' }}</span>
          <div class="flex gap-2">
            <button class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors">
               <i class="fa-solid fa-eye text-xs"></i>
            </button>
            <button (click)="action('Supprimer', cr.id)" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors">
              <i class="fa-solid fa-trash text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl w-full max-w-4xl shadow-2xl animate-fade-in-up my-4 overflow-hidden flex flex-col max-h-[90vh]">
        
        <!-- Header Modale -->
        <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <h3 class="font-black text-xl text-gray-900 flex items-center gap-3">
             <div class="w-10 h-10 rounded-xl bg-[#e6f3eb] flex items-center justify-center">
               <i class="fa-solid fa-pen-nib text-[#008d36]"></i>
             </div>
             Nouveau compte-rendu détaillé
          </h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        
        <!-- Corps de la Modale -->
        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          
          <!-- Infos de base -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Titre <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="formData.titre" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" placeholder="Titre du rapport (ex: Réunion de Bureau)">
            </div>
            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Auteur</label>
              <input type="text" [(ngModel)]="formData.auteur" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" placeholder="Nom de l'auteur">
            </div>
            <div class="md:col-span-3">
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Lieu / Date</label>
              <input type="text" [(ngModel)]="formData.lieu" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" placeholder="Lieu, Réunion Zoom, etc.">
            </div>
          </div>

          <hr class="border-gray-100">

          <!-- Éditeur de Texte Riche (Style Word) -->
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5 flex justify-between items-center">
              <span>Contenu du rapport <span class="text-red-500">*</span></span>
              <span class="text-[10px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Copier-collez depuis Word supporté</span>
            </label>
            <div class="border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#022c16] focus-within:ring-1 focus-within:ring-[#022c16] transition-all">
              <!-- Toolbar WYSIWYG -->
              <div class="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1">
                <button (click)="execCommand('bold')" class="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors" title="Gras (Ctrl+B)"><i class="fa-solid fa-bold"></i></button>
                <button (click)="execCommand('italic')" class="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors" title="Italique (Ctrl+I)"><i class="fa-solid fa-italic"></i></button>
                <button (click)="execCommand('underline')" class="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors" title="Souligné (Ctrl+U)"><i class="fa-solid fa-underline"></i></button>
                <div class="w-px h-6 bg-gray-300 mx-1 self-center"></div>
                <button (click)="execCommand('insertUnorderedList')" class="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors" title="Liste à puces"><i class="fa-solid fa-list-ul"></i></button>
                <button (click)="execCommand('insertOrderedList')" class="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors" title="Liste numérotée"><i class="fa-solid fa-list-ol"></i></button>
                <div class="w-px h-6 bg-gray-300 mx-1 self-center"></div>
                <button (click)="execCommand('formatBlock', 'H2')" class="px-2 h-8 rounded hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors text-xs font-bold" title="Titre 2">Titre 1</button>
                <button (click)="execCommand('formatBlock', 'H3')" class="px-2 h-8 rounded hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors text-xs font-bold" title="Titre 3">Titre 2</button>
                <button (click)="execCommand('removeFormat')" class="w-8 h-8 rounded hover:bg-gray-200 flex items-center justify-center text-red-500 transition-colors ml-auto" title="Effacer le formatage"><i class="fa-solid fa-eraser"></i></button>
              </div>
              <!-- Zone Editable -->
              <div #editor id="cr-editor" contenteditable="true" (input)="onEditorInput()" (paste)="onEditorPaste($event)"
                   class="p-4 min-h-[300px] max-h-[500px] overflow-y-auto bg-white outline-none prose prose-sm sm:prose-base max-w-none text-gray-800"
                   [innerHTML]="formData.contenu">
              </div>
            </div>
          </div>

          <hr class="border-gray-100">

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Pièces jointes -->
            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                <i class="fa-solid fa-paperclip text-blue-500"></i> Pièces jointes (PDF, Word, etc.)
              </label>
              <div class="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                <input type="file" multiple (change)="onFilesSelected($event)" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                <i class="fa-regular fa-file-pdf text-3xl text-gray-400 mb-2"></i>
                <p class="text-sm font-bold text-gray-700">Cliquez ou glissez vos fichiers ici</p>
                <p class="text-xs text-gray-500 mt-1">Taille max : 5Mo par fichier</p>
              </div>
              <!-- Liste des fichiers -->
              <div *ngIf="formData.attachments.length > 0" class="mt-3 space-y-2">
                <div *ngFor="let file of formData.attachments; let i = index" class="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-lg p-2 px-3">
                  <div class="flex items-center gap-2 truncate">
                    <i class="fa-regular fa-file-lines text-blue-500"></i>
                    <span class="text-xs font-bold text-gray-700 truncate max-w-[150px]">{{ file.name }}</span>
                  </div>
                  <button (click)="removeFile(i)" class="text-red-400 hover:text-red-600 p-1"><i class="fa-solid fa-xmark"></i></button>
                </div>
              </div>
            </div>

            <!-- Audience (Ciblage) -->
            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-2 flex items-center gap-2">
                <i class="fa-solid fa-bullseye text-orange-500"></i> Visibilité et Audience
              </label>
              <div class="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="visibilite" value="PUBLIC" [(ngModel)]="formData.visibilite" class="text-[#008d36] focus:ring-[#008d36] w-4 h-4">
                  <span class="text-sm font-bold text-gray-800">Public (Tout le monde)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="visibilite" value="GROUPES" [(ngModel)]="formData.visibilite" class="text-[#008d36] focus:ring-[#008d36] w-4 h-4">
                  <span class="text-sm font-bold text-gray-800">Seulement certains rôles</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="visibilite" value="PERSONNES" [(ngModel)]="formData.visibilite" class="text-[#008d36] focus:ring-[#008d36] w-4 h-4">
                  <span class="text-sm font-bold text-gray-800">Personnes spécifiques</span>
                </label>
                
                <!-- Si Groupes -->
                <div *ngIf="formData.visibilite === 'GROUPES'" class="pl-6 pt-2 animate-fade-in-up">
                  <p class="text-[11px] text-gray-500 mb-2">Sélectionnez les rôles autorisés :</p>
                  <div class="flex flex-wrap gap-2">
                    <label *ngFor="let role of ['Admin', 'Agent', 'Adhérent']" class="flex items-center gap-1.5 bg-white px-2 py-1 border border-gray-200 rounded shadow-sm cursor-pointer">
                      <input type="checkbox" (change)="toggleRole(role)" [checked]="formData.groupesCibles.includes(role)" class="rounded text-[#008d36] focus:ring-[#008d36]">
                      <span class="text-xs font-bold text-gray-700">{{ role }}</span>
                    </label>
                  </div>
                </div>

                <!-- Si Personnes -->
                <div *ngIf="formData.visibilite === 'PERSONNES'" class="pl-6 pt-2 animate-fade-in-up">
                  <p class="text-[11px] text-gray-500 mb-2">Identifiants ou Noms des personnes :</p>
                  <input type="text" placeholder="Entrez les noms séparés par des virgules..."
                         (change)="updatePersonnesCibles($event)"
                         [value]="formData.personnesCibles.join(', ')"
                         class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] outline-none">
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        <!-- Footer Modale -->
        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 shrink-0">
          <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">Annuler</button>
          <button (click)="submitForm()" [disabled]="isLoading" class="px-6 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#008d36] rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
            <i *ngIf="!isLoading" class="fa-solid fa-paper-plane"></i>
            <i *ngIf="isLoading" class="fa-solid fa-spinner fa-spin"></i>
            {{ isLoading ? 'Enregistrement...' : 'Publier le compte-rendu' }}
          </button>
        </div>

      </div>
    </div>
  </div>
  `
})
export class AdminComptesRendusComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  comptesRendus: any[] = [];
  total = 0;
  isLoading = true;

  showModal = false;
  formData: any = {
    titre: '',
    lieu: '',
    auteur: 'Admin',
    contenu: '',
    visibilite: 'PUBLIC',
    groupesCibles: [],
    personnesCibles: [],
    attachments: []
  };

  // Alert State
  alertMessage = '';
  alertType: AlertType = 'success';
  showAlertPopup = false;

  showAlert(message: string, type: AlertType = 'success') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlertPopup = true;
    setTimeout(() => this.showAlertPopup = false, 3000);
  }

  // === BULK DELETE STATE ===
  selectedIds: Set<string> = new Set();
  loadingBulk = false;

  toggleSelection(id: string) {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
    this.cdr.markForCheck();
  }

  toggleAllSelection() {
    if (this.selectedIds.size === this.comptesRendus.length) this.selectedIds.clear();
    else this.comptesRendus.forEach((i: any) => this.selectedIds.add(i.id));
    this.cdr.markForCheck();
  }

  isSelected(id: string): boolean { return this.selectedIds.has(id); }

  clearSelection() {
    this.selectedIds.clear();
    this.cdr.markForCheck();
  }

  bulkDeleteSelected() {
    if (this.selectedIds.size === 0) return;
    this.openConfirm('Supprimer la selection ?', 'Vous allez supprimer ' + this.selectedIds.size + ' compte(s)-rendu. Cette action est irreversible.', 'bulk_delete_selected');
  }

  bulkDeleteAll() {
    this.openConfirm('Supprimer TOUS les compte(s)-rendu ?', 'ATTENTION: Cette action supprimera TOUS les compte(s)-rendu de la base.', 'bulk_delete_all');
  }

  // Confirm State
  showConfirmDialog = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmActionType = '';
  confirmActionId: any = null;

  openConfirm(title: string, message: string, actionType: string, id: any = null) {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmActionType = actionType;
    this.confirmActionId = id;
    this.showConfirmDialog = true;
  }

  onConfirmAction() {
    this.showConfirmDialog = false;
    if (this.confirmActionType === 'delete' && this.confirmActionId) {
      this.isLoading = true;
      this.adminData.deleteEntity('comptes-rendus', this.confirmActionId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.refreshData();
          this.showAlert('Compte-rendu supprimé avec succès');
        },
        error: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.showAlert('Erreur lors de la suppression', 'error');
        }
      });
    } else if (this.confirmActionType === 'bulk_delete_selected') {
      this.loadingBulk = true;
      const ids = Array.from(this.selectedIds);
      Promise.all(ids.map(id => this.adminData.deleteEntity('comptes-rendus', id).toPromise()))
        .then(() => {
          this.comptesRendus = this.comptesRendus.filter((cr: any) => !this.selectedIds.has(cr.id));
          this.total = this.comptesRendus.length;
          this.selectedIds.clear();
          this.loadingBulk = false;
          this.cdr.markForCheck();
          this.showAlert(ids.length + ' compte(s)-rendu supprimé(s)');
        })
        .catch(() => { this.loadingBulk = false; this.cdr.markForCheck(); this.showAlert('Erreur', 'error'); });
    } else if (this.confirmActionType === 'bulk_delete_all') {
      this.loadingBulk = true;
      Promise.all(this.comptesRendus.map((cr: any) => this.adminData.deleteEntity('comptes-rendus', cr.id).toPromise()))
        .then(() => {
          this.comptesRendus = [];
          this.total = 0;
          this.selectedIds.clear();
          this.loadingBulk = false;
          this.cdr.markForCheck();
          this.showAlert('Tous les comptes-rendus supprimés');
        })
        .catch(() => { this.loadingBulk = false; this.cdr.markForCheck(); this.showAlert('Erreur', 'error'); });
    }
  }

  constructor(
    private adminData: AdminDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.refreshData(); }

  refreshData() {
    this.adminData.getComptesRendus().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => { 
        this.comptesRendus = res.data; 
        this.total = res.total; 
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { 
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  getStatutClass(statut: string): string {
    const map: any = {
      'PUBLIE': 'bg-[#e6f3eb] text-[#008d36]',
      'INTERNE': 'bg-purple-50 text-purple-600',
      'BROUILLON': 'bg-gray-100 text-gray-500'
    };
    return map[statut] || 'bg-gray-100 text-gray-500';
  }

  action(type: string, id?: string) {
    if (type === 'Rédiger') {
      this.formData = { titre: '', lieu: '', auteur: 'Admin', contenu: '', visibilite: 'PUBLIC', groupesCibles: [], personnesCibles: [], attachments: [] };
      this.showModal = true;
    } else if (type === 'Supprimer' && id) {
      this.openConfirm('Supprimer ce compte-rendu ?', 'Êtes-vous sûr de vouloir supprimer définitivement ce compte-rendu ?', 'delete', id);
    }
  }

  // === WYSISYG & UPLOAD LOGIC ===
  
  execCommand(command: string, value: string = '') {
    document.execCommand(command, false, value);
    this.onEditorInput();
  }

  onEditorInput() {
    const editor = document.getElementById('cr-editor');
    if (editor) {
      this.formData.contenu = editor.innerHTML;
    }
  }

  onEditorPaste(e: ClipboardEvent) {
    // Laisse le navigateur gérer le paste HTML natif de Word
    setTimeout(() => this.onEditorInput(), 10);
  }

  onFilesSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          this.showAlert(`Le fichier ${file.name} dépasse 5Mo`, 'error');
          continue;
        }
        // Simulation encodage b64 ou simple reference
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.formData.attachments.push({
            name: file.name,
            type: file.type,
            url: e.target.result // Base64 content
          });
          this.cdr.markForCheck();
        };
        reader.readAsDataURL(file);
      }
    }
    event.target.value = '';
  }

  removeFile(index: number) {
    this.formData.attachments.splice(index, 1);
  }

  toggleRole(role: string) {
    const idx = this.formData.groupesCibles.indexOf(role);
    if (idx > -1) this.formData.groupesCibles.splice(idx, 1);
    else this.formData.groupesCibles.push(role);
  }

  updatePersonnesCibles(event: any) {
    const val = event.target.value;
    this.formData.personnesCibles = val.split(',').map((s: string) => s.trim()).filter((s: string) => !!s);
  }

  submitForm() {
    if (!this.formData.titre) {
      this.showAlert('Veuillez saisir un titre', 'info');
      return;
    }
    if (!this.formData.contenu || this.formData.contenu.trim() === '') {
      this.showAlert('Veuillez rédiger un contenu', 'info');
      return;
    }
    this.isLoading = true;
    
    this.adminData.createEntity('comptes-rendus', { 
      titre: this.formData.titre, 
      contenu: this.formData.contenu, 
      lieu: this.formData.lieu,
      auteur: this.formData.auteur, 
      statut: 'PUBLIE',
      date: new Date().toISOString(),
      visibilite: this.formData.visibilite,
      groupesCibles: this.formData.groupesCibles,
      personnesCibles: this.formData.personnesCibles,
      attachments: this.formData.attachments
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showModal = false;
        this.refreshData();
        this.showAlert('Compte-rendu publié avec succès !');
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('Erreur lors de la publication', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$!.next();
    this.destroy$!.complete();
  }
}
