import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Option } from '../../../../core/services/admin-data.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-adherents',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
  <div class="animate-fade-in-up">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Adhérents</h2>
        <p class="text-sm text-gray-500 mt-1">{{ total }} membres inscrits au mouvement.</p>
      </div>
      <button (click)="openCreateModal()"
              class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#022c16]/80 transition-all flex items-center gap-2">
        <i class="fa-solid fa-user-plus"></i> Ajouter un adhérent
      </button>
    </div>

    <!-- Loading -->
    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-500 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

    <!-- Table -->
    <div *ngIf="!isLoading" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50/50">
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Adhérent</th>
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Quartier</th>
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Date d'adhésion</th>
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Statut</th>
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Pièce d'identité</th>
              <th class="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr *ngFor="let a of adherents" class="hover:bg-gray-50/50 transition-colors group">
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-[#022c16]/10 text-[#022c16] flex items-center justify-center font-bold text-sm shrink-0">
                    {{ a.prenom.charAt(0) }}
                  </div>
                  <div>
                    <span class="font-semibold text-gray-900 text-sm block">{{ a.prenom }} {{ a.nom }}</span>
                    <span *ngIf="a.profession" class="text-xs text-gray-400">{{ a.profession }}</span>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6">
                <p class="text-sm text-gray-700">{{ a.telephone }}</p>
              </td>
              <td class="py-4 px-6">
                <span class="text-sm text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg font-medium">{{ a.quartier }}</span>
              </td>
              <td class="py-4 px-6 text-sm text-gray-500">
                {{ a.createdAt | date: 'dd/MM/yyyy' }}
              </td>
              <td class="py-4 px-6">
                <span [class]="getStatutClass(a.statut)" class="text-[11px] font-bold px-2.5 py-1 rounded-full">{{ a.statut }}</span>
              </td>
              <td class="py-4 px-6">
                <button *ngIf="a.carteRectoUrl || a.carteVersoUrl"
                        (click)="viewIdCard(a)"
                        class="px-3 py-1.5 text-xs font-bold text-[#022c16] bg-[#022c16]/10 hover:bg-[#022c16]/20 rounded-lg transition-colors flex items-center gap-1.5">
                  <i class="fa-solid fa-id-card"></i> Voir pièce
                </button>
                <span *ngIf="!a.carteRectoUrl && !a.carteVersoUrl" class="text-xs text-gray-400">Aucune</span>
              </td>
              <td class="py-4 px-6">
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button (click)="action('Valider', a.id)"
                          class="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          *ngIf="a.statut === 'NOUVEAU'">
                    <i class="fa-solid fa-check text-xs"></i>
                  </button>
                  <button (click)="action('Supprimer', a.id)"
                          class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <i class="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Création -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-black text-gray-900 text-lg">Nouvel Adhérent</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Prénom</label>
              <input type="text" [(ngModel)]="formData.prenom" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Nom</label>
              <input type="text" [(ngModel)]="formData.nom" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Téléphone</label>
              <input type="text" [(ngModel)]="formData.telephone" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Profession</label>
              <input type="text" [(ngModel)]="formData.profession" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Quartier</label>
              <select [(ngModel)]="formData.quartier" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
                <option value="">Sélectionnez un quartier</option>
                <option *ngFor="let q of quartiers" [value]="q.label">{{ q.label }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Pôle d'expertise</label>
              <select [(ngModel)]="formData.pole" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none">
                <option value="">Sélectionnez un pôle</option>
                <option *ngFor="let p of poles" [value]="p.label">{{ p.label }}</option>
              </select>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1">Motivation / Compétences particulières</label>
            <textarea [(ngModel)]="formData.motivation" rows="2" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none"></textarea>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Annuler</button>
            <button (click)="submitForm()" class="px-5 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#022c16]/90 rounded-xl transition-colors shadow-lg shadow-[#022c16]/30">Ajouter</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pièce d'identité Lightbox -->
    <div *ngIf="showIdCardModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4" (click)="closeIdCard()">
      <div class="bg-white rounded-3xl shadow-2xl max-w-5xl w-full p-6 animate-fade-in-up" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-black text-xl text-gray-900 flex items-center gap-2">
            <i class="fa-solid fa-id-card text-[#022c16]"></i>
            Pièce d'identité — {{ selectedAdherent?.prenom }} {{ selectedAdherent?.nom }}
          </h3>
          <button (click)="closeIdCard()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-all">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Recto -->
          <div class="text-center">
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recto</p>
            <div class="relative bg-gray-100 rounded-2xl overflow-hidden shadow-lg" style="min-height: 220px;">
              <img *ngIf="selectedAdherent?.carteRectoUrl" [src]="selectedAdherent.carteRectoUrl" class="w-full h-auto object-contain" style="max-height: 400px;">
              <div *ngIf="!selectedAdherent?.carteRectoUrl" class="flex items-center justify-center h-64 text-gray-400">
                <div class="text-center">
                  <i class="fa-solid fa-image text-4xl mb-2"></i>
                  <p class="text-sm">Recto non disponible</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Verso -->
          <div class="text-center">
            <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Verso</p>
            <div class="relative bg-gray-100 rounded-2xl overflow-hidden shadow-lg" style="min-height: 220px;">
              <img *ngIf="selectedAdherent?.carteVersoUrl" [src]="selectedAdherent.carteVersoUrl" class="w-full h-auto object-contain" style="max-height: 400px;">
              <div *ngIf="!selectedAdherent?.carteVersoUrl" class="flex items-center justify-center h-64 text-gray-400">
                <div class="text-center">
                  <i class="fa-solid fa-image text-4xl mb-2"></i>
                  <p class="text-sm">Verso non disponible</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button (click)="closeIdCard()" class="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
            Fermer
          </button>
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
  `,
})
export class AdminadherentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  adherents: any[] = [];
  total = 0;
  isLoading = true;

  showModal = false;
  showConfirmDialog = false;
  showIdCardModal = false;
  selectedAdherent: any = null;
  itemToDelete: string | null = null;
  confirmTitle = 'Confirmer la suppression';

  formData = {
    prenom: '',
    nom: '',
    telephone: '',
    quartier: '',
    profession: '',
    pole: '',
    motivation: ''
  };

  quartiers: Option[] = [];
  poles: Option[] = [];

  constructor(
    private adminData: AdminDataService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.refreshData();
    this.loadOptions();
  }

  loadOptions() {
    this.adminData.getOptions('quartier').pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.quartiers = res?.data || [];
      this.cdr.markForCheck();
    });
    this.adminData.getOptions('pole_activite').pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.poles = res?.data || [];
      this.cdr.markForCheck();
    });
  }

  refreshData() {
    this.adminData.getAdherents().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.adherents = res.data;
        this.total = res.total;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  getStatutClass(statut: string): string {
    const map: any = {
      ACTIF: 'bg-green-100 text-green-700',
      NOUVEAU: 'bg-yellow-100 text-yellow-700',
      SUSPENDU: 'bg-gray-100 text-gray-500',
    };
    return map[statut] || 'bg-gray-100 text-gray-500';
  }

  openCreateModal() {
    this.formData = { prenom: '', nom: '', telephone: '', quartier: '', profession: '', pole: '', motivation: '' };
    this.showModal = true;
  }

  viewIdCard(adherent: any) {
    this.selectedAdherent = adherent;
    this.showIdCardModal = true;
  }

  closeIdCard() {
    this.showIdCardModal = false;
    this.selectedAdherent = null;
  }

  action(type: string, id?: string) {
    if (type === 'Ajouter un adhérent') {
      this.openCreateModal();
    } else if (type === 'Supprimer' && id) {
      this.itemToDelete = id;
      this.confirmTitle = 'Supprimer cet adhérent ?';
      this.showConfirmDialog = true;
      this.cdr.markForCheck();
    } else if (type === 'Valider' && id) {
      this.isLoading = true;
      this.cdr.markForCheck();
      this.adminData.updateEntity('adherents', id, { statut: 'ACTIF' }).subscribe(() => this.refreshData());
    } else {
      alert(type + ' : Formulaire en cours de développement.');
    }
  }

  deleteItem = (id: string) => {
    this.adminData.deleteEntity('adherents', id).subscribe({
      next: () => this.refreshData(),
      error: (err) => {
        alert('Erreur lors de la suppression: ' + (err.message || 'Erreur inconnue'));
        this.cdr.markForCheck();
      }
    });
  };

  confirmDelete() {
    if (this.itemToDelete) {
      this.deleteItem(this.itemToDelete);
      this.itemToDelete = null;
      this.showConfirmDialog = false;
      this.cdr.markForCheck();
    }
  }

  submitForm() {
    if (!this.formData.nom || !this.formData.prenom || !this.formData.telephone) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }
    this.isLoading = true;
    this.showModal = false;
    this.cdr.markForCheck();
    this.adminData.createEntity('adherents', this.formData).subscribe(() => this.refreshData());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
