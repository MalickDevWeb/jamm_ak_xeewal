import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { AdminDataService } from '../../../../core/services/admin-data.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';

@Component({
  selector: 'app-admin-evenements',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, AlertPopupComponent],
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

      <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div *ngFor="let e of evenements" class="group bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col">
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
  showConfirmDialog = false;
  showAlert = false;
  alertType: AlertType = 'info';
  alertTitle = 'Information';
  alertMessage = '';
  itemToDelete: string | null = null;
  confirmTitle = 'Confirmer la suppression';

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

  constructor(private adminData: AdminDataService, private cdr: ChangeDetectorRef) {}

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
        next: () => { this.isSubmitting = false; this.closeModal(); this.loadEvenements(); },
        error: () => { this.isSubmitting = false; this.showAlertMethod('error', 'Erreur', 'Impossible de modifier.'); }
      });
    } else {
      this.adminData.createEntity('evenements', data).subscribe({
        next: () => { this.isSubmitting = false; this.closeModal(); this.loadEvenements(); },
        error: () => { this.isSubmitting = false; this.showAlertMethod('error', 'Erreur', 'Impossible de créer.'); }
      });
    }
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
}
