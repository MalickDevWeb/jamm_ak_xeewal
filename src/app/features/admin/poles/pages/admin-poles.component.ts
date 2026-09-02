import { Component, OnInit, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-poles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="animate-fade-in-up max-w-[1200px] mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-[#e6f3eb] flex items-center justify-center">
            <i class="fa-solid fa-layer-group text-[#008d36] text-xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-black text-gray-900 tracking-tight">Pôles d'Action</h2>
            <p class="text-sm font-medium text-gray-500">Gérez les pôles et leurs objectifs</p>
          </div>
        </div>
        <button (click)="openCreateModal()" class="bg-[#022c16] text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#008d36] transition-colors shadow-sm">
          <i class="fa-solid fa-plus"></i> Nouveau pôle
        </button>
      </div>

      <div *ngIf="isLoading()" class="flex items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div class="text-center">
          <i class="fa-solid fa-circle-notch fa-spin text-4xl text-[#008d36] mb-4"></i>
          <p class="text-gray-500 font-medium text-sm">Chargement...</p>
        </div>
      </div>

      <div *ngIf="!isLoading() && poles().length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid fa-layer-group text-3xl text-gray-300"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-1">Aucun pôle</h3>
        <p class="text-sm text-gray-500 mb-6">Créez votre premier pôle d'action.</p>
        <button (click)="openCreateModal()" class="text-[#008d36] bg-[#e6f3eb] font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#d1e8d9] transition-colors">
          Créer un pôle
        </button>
      </div>

      <div *ngIf="!isLoading() && poles().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let pole of poles()" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-lg transition-all duration-300">
          <div class="p-5 flex-1 flex flex-col">
            <div class="flex items-center justify-between mb-3">
              <span *ngIf="pole.statut === 'PUBLIE'" class="bg-[#e6f3eb] text-[#008d36] text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5 uppercase"><i class="fa-solid fa-check-circle"></i> Publié</span>
              <span *ngIf="pole.statut !== 'PUBLIE'" class="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5 uppercase"><i class="fa-solid fa-pen"></i> Brouillon</span>
              
              <div class="flex gap-2">
                <button (click)="openEditModal(pole)" class="w-8 h-8 rounded-lg bg-gray-50 hover:bg-[#e6f3eb] text-gray-500 hover:text-[#008d36] flex items-center justify-center transition-colors">
                  <i class="fa-solid fa-pen text-[11px]"></i>
                </button>
                <button (click)="deletePole(pole.id)" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors">
                  <i class="fa-solid fa-trash text-[11px]"></i>
                </button>
              </div>
            </div>
            
            <h3 class="text-[16px] font-bold text-gray-900 mb-2 leading-tight">{{ pole.titre }}</h3>
            <p class="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{{ pole.description }}</p>
            
            <div *ngIf="pole.objectifs" class="pt-4 border-t border-gray-100">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Objectifs</p>
              <ul class="text-[13px] text-gray-600 space-y-1">
                <li *ngFor="let obj of getObjectifsArray(pole.objectifs).slice(0, 3)" class="flex items-start gap-2">
                  <i class="fa-solid fa-check text-[#008d36] mt-1 text-[10px]"></i>
                  <span class="line-clamp-1">{{ obj }}</span>
                </li>
                <li *ngIf="getObjectifsArray(pole.objectifs).length > 3" class="text-xs text-gray-400 italic">
                  + {{ getObjectifsArray(pole.objectifs).length - 3 }} autres...
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal()" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-fade-in-up my-4 overflow-hidden">
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 class="font-black text-xl text-gray-900 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#e6f3eb] flex items-center justify-center">
                 <i class="fa-solid" [class.fa-plus]="isCreating()" [class.fa-pen]="!isCreating()" class="text-[#008d36]"></i>
              </div>
              {{ isCreating() ? 'Nouveau pôle' : "Modifier le pôle" }}
            </h3>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <div class="p-6 space-y-5">
            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Titre du pôle <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="formData.titre" placeholder="Ex: Développement Humain..." class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none" />
            </div>

            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Description <span class="text-red-500">*</span></label>
              <textarea [(ngModel)]="formData.description" rows="3" placeholder="Décrivez la vision de ce pôle..." class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none resize-none"></textarea>
            </div>

            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Objectifs (Un par ligne)</label>
              <textarea [(ngModel)]="formData.objectifs" rows="4" placeholder="Ex:&#10;Action sociale et prévention&#10;Autonomisation économique" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none resize-none"></textarea>
              <p class="text-xs text-gray-400 mt-1">Séparez chaque objectif par un retour à la ligne.</p>
            </div>

            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Icône <span class="text-red-500">*</span></label>
              <div class="grid grid-cols-5 sm:grid-cols-10 gap-2">
                <button *ngFor="let icon of availableIcons" 
                        type="button"
                        (click)="formData.icone = icon.value"
                        [ngClass]="formData.icone === icon.value ? 'bg-[#e6f3eb] border-[#008d36] text-[#008d36] scale-110 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-600'"
                        class="h-10 border rounded-xl flex items-center justify-center text-lg transition-all"
                        [title]="icon.label">
                  <i [class]="icon.value"></i>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Statut</label>
              <select [(ngModel)]="formData.statut" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none cursor-pointer">
                <option value="PUBLIE">Publié (Visible pour tous)</option>
                <option value="BROUILLON">Brouillon (Caché)</option>
              </select>
            </div>

            <p *ngIf="errorMessage()" class="text-red-500 text-xs font-bold bg-red-50 px-3 py-2 rounded-lg">
              <i class="fa-solid fa-circle-exclamation"></i> {{ errorMessage() }}
            </p>
          </div>

          <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
            <button (click)="closeModal()" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">Annuler</button>
            <button (click)="submitForm()" [disabled]="isSubmitting() || !formData.titre || !formData.description" class="px-6 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#008d36] rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2">
              <span *ngIf="!isSubmitting()"><i class="fa-solid fa-save"></i> Enregistrer</span>
              <span *ngIf="isSubmitting()"><i class="fa-solid fa-circle-notch fa-spin"></i> En cours...</span>
            </button>
          </div>
        </div>
      </div>

      <app-confirm-dialog
        [visible]="showConfirmDialog()"
        title="Supprimer ce pôle ?"
        message="Cette action est irréversible et supprimera également les liaisons avec les adhérents (si configuré en cascade)."
        (confirm)="confirmDelete()"
        (cancel)="showConfirmDialog.set(false)">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminPolesComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private adminData = inject(AdminDataService);

  poles = signal<any[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  isCreating = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal('');
  
  showConfirmDialog = signal(false);
  currentId = signal<string | null>(null);

  formData = {
    titre: '',
    description: '',
    objectifs: '',
    icone: 'fa-solid fa-star',
    statut: 'PUBLIE'
  };

  availableIcons = [
    { label: 'Général / Étoile', value: 'fa-solid fa-star' },
    { label: 'Utilisateurs / Social', value: 'fa-solid fa-users' },
    { label: 'Fusée / Innovation', value: 'fa-solid fa-rocket' },
    { label: 'Feuille / Environnement', value: 'fa-solid fa-leaf' },
    { label: 'Santé / Cœur', value: 'fa-solid fa-heart-pulse' },
    { label: 'Sport', value: 'fa-solid fa-person-running' },
    { label: 'Éducation / Livre', value: 'fa-solid fa-book-open' },
    { label: 'Économie / Pièces', value: 'fa-solid fa-coins' },
    { label: 'Sécurité / Bouclier', value: 'fa-solid fa-shield-halved' },
    { label: 'Culture / Masque', value: 'fa-solid fa-masks-theater' }
  ];

  ngOnInit() {
    this.loadPoles();
  }

  loadPoles() {
    this.isLoading.set(true);
    this.adminData.getPoles().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        if (res.success) this.poles.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getObjectifsArray(objectifs: any): string[] {
    if (!objectifs) return [];
    if (Array.isArray(objectifs)) return objectifs;
    return typeof objectifs === 'string' ? objectifs.split('\n').map(o => o.trim()).filter(o => o.length > 0) : [];
  }

  openCreateModal() {
    this.isCreating.set(true);
    this.currentId.set(null);
    this.formData = { titre: '', description: '', objectifs: '', icone: 'fa-solid fa-star', statut: 'PUBLIE' };
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  openEditModal(pole: any) {
    this.isCreating.set(false);
    this.currentId.set(pole.id);
    this.formData = {
      titre: pole.titre,
      description: pole.description,
      objectifs: Array.isArray(pole.objectifs) ? pole.objectifs.join('\n') : (pole.objectifs || ''),
      icone: pole.icone || 'fa-solid fa-star',
      statut: pole.statut
    };
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  deletePole(id: string) {
    this.currentId.set(id);
    this.showConfirmDialog.set(true);
  }

  confirmDelete() {
    const id = this.currentId();
    if (!id) return;
    this.adminData.deleteEntity('poles', id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.poles.update(list => list.filter(p => p.id !== id));
        this.showConfirmDialog.set(false);
      }
    });
  }

  submitForm() {
    if (!this.formData.titre || !this.formData.description) return;
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const dataToSend = {
      ...this.formData,
      objectifs: this.formData.objectifs ? this.formData.objectifs.split('\n').map(o => o.trim()).filter(o => o.length > 0) : []
    };

    const action = this.isCreating() 
      ? this.adminData.createEntity('poles', dataToSend)
      : this.adminData.updateEntity('poles', this.currentId()!, dataToSend);

    action.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        if (this.isCreating()) {
          this.poles.update(list => [res.data, ...list]);
        } else {
          this.poles.update(list => list.map(p => p.id === res.data.id ? res.data : p));
        }
        this.closeModal();
        this.isSubmitting.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors de l\'enregistrement.');
        this.isSubmitting.set(false);
      }
    });
  }
}
