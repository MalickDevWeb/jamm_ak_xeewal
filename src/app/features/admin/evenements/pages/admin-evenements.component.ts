import { BulkDeleteService } from '../../../../core/services/bulk-delete.service';
import { BulkActionsBarComponent } from '../../../../shared/components/bulk-actions-bar/bulk-actions-bar.component';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AdminDataService } from '../../../../core/services/admin-data.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-evenements',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, AlertPopupComponent, BulkActionsBarComponent],
  template: `
    <div class="animate-fade-in-up min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-4xl font-black text-gray-900 flex items-center gap-3">
            <i class="fa-solid fa-calendar-days text-3xl text-[#022c16]"></i>
            Agenda
          </h2>
          <p class="text-sm text-gray-500 mt-1">{{ total }} événement(s)</p>
        </div>
        <button (click)="openCreateModal()" class="px-6 py-3 bg-gradient-to-r from-[#022c16] to-[#034256] text-white rounded-2xl text-sm font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2">
          <i class="fa-solid fa-plus text-lg"></i>
          <span>Nouvel événement</span>
        </button>
      </div>

      <div *ngIf="isLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <i class="fa-solid fa-circle-notch fa-spin text-5xl text-[#022c16] mb-4"></i>
          <p class="text-gray-500 text-lg">Chargement...</p>
        </div>
      </div>

      <div *ngIf="!isLoading && evenements.length === 0" class="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
        <i class="fa-solid fa-calendar text-7xl text-gray-300 mb-4"></i>
        <p class="text-gray-500 text-xl mb-2">Aucun événement</p>
        <button (click)="openCreateModal()" class="text-[#022c16] font-bold hover:underline text-lg">Créer le premier événement →</button>
      </div>

      <!-- Select All Bar -->
      <div *ngIf="!isLoading && evenements.length > 0" class="mb-4 flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100">
        <input type="checkbox" [checked]="selectedIds.size === evenements.length && evenements.length > 0" (change)="toggleAllSelection()" class="w-4 h-4 cursor-pointer accent-[#022c16]">
        <span class="text-sm font-semibold text-gray-600">Sélectionner tout ({{ evenements.length }})</span>
      </div>

      <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div *ngFor="let e of evenements" class="relative group bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
             [class.ring-2]="isSelected(e.id)" [class.ring-red-400]="isSelected(e.id)" [class.bg-red-50]="isSelected(e.id)">
          <input type="checkbox" [checked]="isSelected(e.id)" (change)="toggleSelection(e.id)" class="absolute top-3 right-3 w-4 h-4 cursor-pointer accent-[#022c16] z-10">
          <div class="p-6 flex-1 flex flex-col">
            <div class="flex items-center gap-2 mb-3">
              <span class="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">{{ e.categorie || 'Général' }}</span>
              <span class="text-xs text-gray-400">{{ e.date | date:'dd/MM/yyyy' }}</span>
            </div>
            <h3 class="text-xl font-black text-gray-900 mb-2 line-clamp-1">{{ e.titre }}</h3>
            <p *ngIf="e.description" class="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">{{ e.description }}</p>
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold" [ngClass]="getStatutClass(e.statut)">
                {{ e.statut }}
              </span>
              <div class="flex gap-2">
                <button (click)="openEditModal(e)" class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all" title="Modifier">
                  <i class="fa-solid fa-pen text-sm"></i>
                </button>
                <button (click)="deleteItem(e.id)" class="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all" title="Supprimer">
                  <i class="fa-solid fa-trash text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in-up my-4">
          <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-3xl">
            <div class="flex items-center justify-between">
              <h3 class="font-black text-2xl text-gray-900">{{ isEditing ? 'Modifier' : 'Nouvel événement' }}</h3>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-all">
                <i class="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-black text-gray-700 mb-2">Titre *</label>
              <input type="text" [(ngModel)]="formData.titre" class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
            </div>
            <div>
              <label class="block text-sm font-black text-gray-700 mb-2">Description</label>
              <textarea [(ngModel)]="formData.description" rows="3" class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none resize-none"></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-black text-gray-700 mb-2">Date *</label>
                <input type="date" [(ngModel)]="formData.date" class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
              </div>
              <div>
                <label class="block text-sm font-black text-gray-700 mb-2">Catégorie</label>
                <select [(ngModel)]="formData.categorie" class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none bg-white">
                  <option value="">Général</option>
                  <option value="Causerie">Causerie</option>
                  <option value="Rencontre">Rencontre</option>
                  <option value="Formation">Formation</option>
                  <option value="Sport">Sport</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-black text-gray-700 mb-2">Heure début</label>
                <input type="time" [(ngModel)]="formData.heureDebut" class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
              </div>
              <div>
                <label class="block text-sm font-black text-gray-700 mb-2">Heure fin</label>
                <input type="time" [(ngModel)]="formData.heureFin" class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
              </div>
            </div>
            <div>
              <label class="block text-sm font-black text-gray-700 mb-2">Lieu</label>
              <input type="text" [(ngModel)]="formData.lieu" class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
            </div>
            <div>
              <label class="block text-sm font-black text-gray-700 mb-2">Statut</label>
              <select [(ngModel)]="formData.statut" class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none bg-white">
                <option value="A_VENIR">À venir</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINE">Terminé</option>
                <option value="ANNULE">Annulé</option>
              </select>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-3xl">
            <button (click)="closeModal()" class="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Annuler</button>
            <button (click)="submitForm()" [disabled]="isSubmitting" class="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#022c16] to-[#034256] rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70">
              {{ isEditing ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>

      <app-confirm-dialog [visible]="showConfirmDialog" [title]="confirmTitle" message="Cette action est irréversible." (confirm)="confirmDelete()" (cancel)="showConfirmDialog = false"></app-confirm-dialog>
      

    <!-- Bulk Actions Bar -->
    <app-bulk-actions-bar
      [selectedCount]="selectedIds.size"
      [loading]="loadingBulk"
      (deleteSelected)="bulkDeleteSelected()"
      (deleteAll)="bulkDeleteAll()"
      (clear)="clearSelection()">
    </app-bulk-actions-bar>

<app-alert-popup [visible]="showAlert" [type]="alertType" [title]="alertTitle" [message]="alertMessage" (close)="showAlert = false"></app-alert-popup>
    </div>
  `,
  styles: [`
    .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdminEvenementsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  evenements: any[] = [];
  total = 0;
  isLoading = true;
  isSubmitting = false;

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
    if (this.selectedIds.size === this.evenements.length) this.selectedIds.clear();
    else this.evenements.forEach((i: any) => this.selectedIds.add(i.id));
    this.cdr.markForCheck();
  }

  isSelected(id: string): boolean { return this.selectedIds.has(id); }

  clearSelection() {
    this.selectedIds.clear();
    this.cdr.markForCheck();
  }

  bulkDeleteSelected() {
    if (this.selectedIds.size === 0) return;
    this.openConfirm('Supprimer la selection ?', 'Vous allez supprimer ' + this.selectedIds.size + ' evenement(s). Cette action est irreversible.', 'bulk_delete_selected');
  }

  bulkDeleteAll() {
    this.openConfirm('Supprimer TOUS les evenement(s) ?', 'ATTENTION: Cette action supprimera TOUS les evenement(s) de la base.', 'bulk_delete_all');
  }

  showConfirmDialog = false;
  showAlert = false;
  alertType: AlertType = 'info';
  alertTitle = 'Information';
  alertMessage = '';
  itemToDelete: string | null = null;
  confirmTitle = 'Confirmer la suppression';
  confirmMessage = '';
  confirmActionType = '';
  confirmActionId: any = null;

  formData = {
    titre: '',
    description: '',
    date: '',
    heureDebut: '',
    heureFin: '',
    lieu: '',
    categorie: '',
    statut: 'A_VENIR'
  };

  constructor(
    private adminData: AdminDataService,
    private bulkDelete: BulkDeleteService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit() { this.loadEvenements(); }

  loadEvenements() {
    this.isLoading = true;
    this.adminData.getEvenements().subscribe({
      next: (res: any) => { this.evenements = res.data || []; this.total = res.total || this.evenements.length; this.isLoading = false; this.cdr.markForCheck(); },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); }
    });
  }

  getStatutClass(s: string): string {
    const map: any = { 'A_VENIR': 'bg-blue-100 text-blue-700', 'EN_COURS': 'bg-green-100 text-green-700', 'TERMINE': 'bg-gray-100 text-gray-700', 'ANNULE': 'bg-red-100 text-red-700' };
    return map[s] || 'bg-gray-100 text-gray-700';
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.formData = { titre: '', description: '', date: new Date().toISOString().split('T')[0], heureDebut: '', heureFin: '', lieu: '', categorie: '', statut: 'A_VENIR' };
    this.showModal = true;
  }

  openEditModal(e: any) {
    this.isEditing = true;
    this.editingId = e.id;
    this.formData = { ...e, date: e.date ? new Date(e.date).toISOString().split('T')[0] : '' };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.isSubmitting = false; }

  submitForm() {
    if (!this.formData.titre || !this.formData.date) {
      this.showAlertMethod('warning', 'Attention', 'Veuillez remplir les champs obligatoires (titre et date)');
      return;
    }

    // Validation côté frontend
    if (this.formData.heureDebut) {
      const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(this.formData.heureDebut)) {
        this.showAlertMethod('warning', 'Attention', 'Format heure invalide (HH:MM)');
        return;
      }
    }
    if (this.formData.heureFin) {
      const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(this.formData.heureFin)) {
        this.showAlertMethod('warning', 'Attention', 'Format heure de fin invalide (HH:MM)');
        return;
      }
    }

    const allowedCategories = ['Causerie', 'Rencontre', 'Formation', 'Sport', 'Culture', 'Autre'];
    if (this.formData.categorie && !allowedCategories.includes(this.formData.categorie)) {
      this.formData.categorie = 'Autre';
    }

    const allowedStatuts = ['A_VENIR', 'EN_COURS', 'TERMINE', 'ANNULE'];
    if (!allowedStatuts.includes(this.formData.statut)) {
      this.formData.statut = 'A_VENIR';
    }

    this.isSubmitting = true;
    const data = { ...this.formData, date: new Date(this.formData.date).toISOString() };

    if (this.isEditing && this.editingId) {
      this.adminData.updateEntity('evenements', this.editingId, data).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          this.closeModal();
          this.loadEvenements();
          // Push si événement visible
          if (['A_VENIR', 'EN_COURS'].includes(this.formData.statut)) {
            this.sendPushNotification(res?.data || data, false);
          }
        },
        error: () => { this.isSubmitting = false; this.showAlertMethod('error', 'Erreur', 'Impossible de modifier.'); }
      });
    } else {
      this.adminData.createEntity('evenements', data).subscribe({
        next: (res: any) => {
          this.isSubmitting = false;
          this.closeModal();
          this.loadEvenements();
          // Push si événement visible
          if (['A_VENIR', 'EN_COURS'].includes(this.formData.statut)) {
            this.sendPushNotification(res?.data || data, true);
          }
        },
        error: () => { this.isSubmitting = false; this.showAlertMethod('error', 'Erreur', 'Impossible de créer.'); }
      });
    }
  }

  private sendPushNotification(event: any, isNew: boolean) {
    const titre = event?.titre || this.formData.titre || 'Nouvel événement';
    const dateStr = event?.date
      ? new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
      : '';
    const lieu = event?.lieu || this.formData.lieu || '';
    const heure = (event?.heureDebut || this.formData.heureDebut) || '';

    let body = isNew ? `📅 ${dateStr}` : `✅ Mis à jour — ${dateStr}`;
    if (heure) body += ` à ${heure}`;
    if (lieu) body += ` — ${lieu}`;

    const pushPayload = {
      title: `🚨 ${isNew ? 'Nouvel événement' : 'Événement mis à jour'} : ${titre}`,
      body,
      icon: '${environment.publicUrl}/assets/icons/icon-192x192.png',
      url: '/'
    };

    const token = localStorage.getItem('admin_token') || '';
    this.http.post(`${environment.bacOfficeUrl}/api/v1/push/send`, pushPayload, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => console.log(`[Push Agenda] Notifié: ${res?.sent ?? 0} abonné(s)`),
      error: (err) => console.warn('[Push Agenda] Erreur:', err?.message)
    });
  }

  deleteItem(id: string) {
    const previous = [...this.evenements];
    this.evenements = this.evenements.filter(e => e.id !== id);
    this.total = Math.max(0, this.total - 1);
    this.cdr.markForCheck();

    this.adminData.deleteEntity('evenements', id).subscribe({
      next: () => {},
      error: () => {
        this.evenements = previous;
        this.total = previous.length;
        this.showAlertMethod('error', 'Erreur', 'Impossible de supprimer.');
      }
    });
  }

  confirmDelete() {
    if (this.itemToDelete) {
      this.deleteItem(this.itemToDelete);
      this.itemToDelete = null;
      this.showConfirmDialog = false;
    } else if (this.confirmActionType === 'bulk_delete_selected') {
      this.showConfirmDialog = false;
      this.loadingBulk = true;
      const ids = Array.from(this.selectedIds);
      Promise.all(ids.map(id => this.adminData.deleteEntity('evenements', id).toPromise()))
        .then(() => {
          this.evenements = this.evenements.filter((e: any) => !this.selectedIds.has(e.id));
          this.total = this.evenements.length;
          this.selectedIds.clear();
          this.loadingBulk = false;
          this.cdr.markForCheck();
          this.showAlertMethod('success', 'Succès', ids.length + ' événement(s) supprimé(s)');
        })
        .catch(() => { this.loadingBulk = false; this.cdr.markForCheck(); });
    } else if (this.confirmActionType === 'bulk_delete_all') {
      this.showConfirmDialog = false;
      this.loadingBulk = true;
      Promise.all(this.evenements.map((e: any) => this.adminData.deleteEntity('evenements', e.id).toPromise()))
        .then(() => {
          this.evenements = [];
          this.total = 0;
          this.selectedIds.clear();
          this.loadingBulk = false;
          this.cdr.markForCheck();
          this.showAlertMethod('success', 'Succès', 'Tous les événements supprimés');
        })
        .catch(() => { this.loadingBulk = false; this.cdr.markForCheck(); });
    }
  }

  showAlertMethod(type: AlertType, title: string, message: string) {
    this.alertType = type;
    this.alertTitle = title;
    this.alertMessage = message;
    this.showAlert = true;
    this.cdr.markForCheck();
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
  openConfirm(title: string, message: string, actionType: string, actionId: any = null) {
    this.confirmTitle = title;
    this.confirmMessage = message;
    this.confirmActionType = actionType;
    this.confirmActionId = actionId;
    this.showConfirmDialog = true;
  }


}
