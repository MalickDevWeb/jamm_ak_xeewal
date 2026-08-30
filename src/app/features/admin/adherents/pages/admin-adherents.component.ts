import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';

@Component({
  selector: 'app-admin-adherents',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, AlertPopupComponent],
  template: `
  <div class="animate-fade-in-up">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Adhérents</h2>
        <p class="text-sm text-gray-500 mt-1">{{ total }} membres inscrits au mouvement.</p>
      </div>
      <button (click)="openCreateModal()" class="px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-[#022c16]/80 transition-all flex items-center gap-2">
        <i class="fa-solid fa-user-plus"></i> Ajouter un adhérent
      </button>
    </div>

    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-500 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

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
                <button *ngIf="a.carteRectoUrl || a.carteVersoUrl" (click)="viewIdCard(a)" class="px-3 py-1.5 text-xs font-bold text-[#022c16] bg-[#022c16]/10 hover:bg-[#022c16]/20 rounded-lg transition-colors flex items-center gap-1.5">
                  <i class="fa-solid fa-id-card"></i> Voir pièce
                </button>
                <span *ngIf="!a.carteRectoUrl && !a.carteVersoUrl" class="text-xs text-gray-400">Aucune</span>
              </td>
              <td class="py-4 px-6">
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button (click)="action('Valider', a.id)" class="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors" *ngIf="a.statut === 'NOUVEAU'">
                    <i class="fa-solid fa-check text-xs"></i>
                  </button>
                  <button (click)="openEditModal(a)" class="p-1.5 text-gray-400 hover:text-brand-green hover:bg-brand-green/5 rounded-lg transition-colors">
                    <i class="fa-solid fa-pen text-xs"></i>
                  </button>
                  <button (click)="action('Supprimer', a.id)" class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <i class="fa-solid fa-trash text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-black text-gray-900 text-lg">{{ isEditing ? 'Modifier l\'adhérent' : 'Nouvel Adhérent' }}</h3>
          <button (click)="showModal = false" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Prénom <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="formData.prenom" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Prénom">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Nom <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="formData.nom" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Nom">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Téléphone <span class="text-red-500">*</span></label>
              <input type="tel" [(ngModel)]="formData.telephone" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="77 123 45 67">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Quartier <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="formData.quartier" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Ex: Médina">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Profession</label>
              <input type="text" [(ngModel)]="formData.profession" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="Ex: Enseignant">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Disponibilité</label>
              <select [(ngModel)]="formData.disponibilite" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none bg-white">
                <option value="">Sélectionner</option>
                <option value="Temps plein">Temps plein</option>
                <option value="Temps partiel">Temps partiel</option>
                <option value="Week-end">Week-end</option>
                <option value="Soirées">Soirées</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Compétences / Motivation</label>
            <textarea [(ngModel)]="formData.competences" rows="2" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none resize-none" placeholder="Compétences ou motivation..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Pièce d'identité (optionnel)</label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">Recto</label>
                <input type="text" [(ngModel)]="formData.carteRectoUrl" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="URL image recto">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 mb-1">Verso</label>
                <input type="text" [(ngModel)]="formData.carteVersoUrl" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#022c16] focus:ring-2 focus:ring-[#022c16]/20 transition-all outline-none" placeholder="URL image verso">
              </div>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button (click)="showModal = false" class="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Annuler</button>
            <button (click)="submitForm()" class="px-5 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#022c16]/90 rounded-xl transition-colors shadow-lg shadow-[#022c16]/30">
              {{ isEditing ? 'Enregistrer' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </div>
    </div>

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
        <div class="mt-8 flex justify-between items-center border-t border-gray-100 pt-6">
          <div class="flex gap-3">
            <button (click)="downloadIdCard('png')" [disabled]="isDownloading" class="px-5 py-2.5 text-sm font-bold text-white bg-[#022c16] hover:bg-[#022c16]/90 rounded-xl transition-all flex items-center gap-2 shadow-lg disabled:opacity-50">
              <i class="fa-solid fa-image" *ngIf="!isDownloading"></i>
              <i class="fa-solid fa-spinner fa-spin" *ngIf="isDownloading"></i>
              Télécharger PNG
            </button>
            <button (click)="downloadIdCard('pdf')" [disabled]="isDownloading" class="px-5 py-2.5 text-sm font-bold text-[#022c16] bg-[#022c16]/10 hover:bg-[#022c16]/20 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50">
              <i class="fa-solid fa-file-pdf" *ngIf="!isDownloading"></i>
              <i class="fa-solid fa-spinner fa-spin" *ngIf="isDownloading"></i>
              Télécharger PDF
            </button>
          </div>
          <button (click)="closeIdCard()" class="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Fermer</button>
        </div>
      </div>
    </div>

    <!-- Offscreen template for export -->
    <div *ngIf="selectedAdherent" id="id-card-export" class="bg-white" style="width: 800px; padding: 40px; position: absolute; left: -9999px; top: -9999px; background: white; z-index: -1;">
      <div style="border: 4px solid #022c16; border-radius: 20px; padding: 40px; background: #fafafa; font-family: sans-serif;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eaeaea; padding-bottom: 20px;">
          <h2 style="font-size: 32px; color: #022c16; margin: 0; font-weight: 900; text-transform: uppercase;">CARTE D'IDENTITÉ</h2>
          <p style="font-size: 18px; color: #666; margin-top: 10px; font-weight: bold;">JÀMM AK XÉEWAL - THIÈS NORD</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; font-size: 20px; color: #333;">
          <div><strong style="color: #022c16;">Prénom :</strong> {{ selectedAdherent.prenom }}</div>
          <div><strong style="color: #022c16;">Nom :</strong> {{ selectedAdherent.nom }}</div>
          <div><strong style="color: #022c16;">Téléphone :</strong> {{ selectedAdherent.telephone }}</div>
          <div><strong style="color: #022c16;">Quartier :</strong> {{ selectedAdherent.quartier }}</div>
        </div>

        <div style="text-align: center; margin-bottom: 40px;" *ngIf="selectedAdherent.carteRectoUrl">
          <div style="display: inline-block; padding: 10px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <h3 style="color: #888; text-transform: uppercase; margin: 0 0 15px 0; font-size: 14px; font-weight: bold;">Recto</h3>
            <img [src]="selectedAdherent.carteRectoUrl" crossorigin="anonymous" style="max-width: 100%; max-height: 350px; border-radius: 8px;">
          </div>
        </div>

        <div style="text-align: center;" *ngIf="selectedAdherent.carteVersoUrl">
          <div style="display: inline-block; padding: 10px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <h3 style="color: #888; text-transform: uppercase; margin: 0 0 15px 0; font-size: 14px; font-weight: bold;">Verso</h3>
            <img [src]="selectedAdherent.carteVersoUrl" crossorigin="anonymous" style="max-width: 100%; max-height: 350px; border-radius: 8px;">
          </div>
        </div>
      </div>
    </div>

    <app-alert-popup [visible]="showAlert" [type]="alertType" [title]="alertTitle" [message]="alertMessage" (close)="showAlert = false"></app-alert-popup>

    <app-confirm-dialog [visible]="showConfirmDialog" [title]="confirmTitle" message="Cette action est irréversible." (confirm)="confirmDelete()" (cancel)="showConfirmDialog = false"></app-confirm-dialog>
  </div>
  `
})
export class AdminadherentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  adherents: any[] = [];
  total = 0;
  isLoading = true;
  isDownloading = false;

  showModal = false;
  isEditing = false;
  editingId: string | null = null;
  showConfirmDialog = false;
  showIdCardModal = false;
  showAlert = false;
  alertType: AlertType = 'info';
  alertTitle = 'Information';
  alertMessage = '';
  selectedAdherent: any = null;
  itemToDelete: string | null = null;
  confirmTitle = 'Confirmer la suppression';

  formData = {
    prenom: '',
    nom: '',
    telephone: '',
    quartier: '',
    profession: '',
    competences: '',
    disponibilite: '',
    carteRectoUrl: '',
    carteVersoUrl: '',
    statut: 'NOUVEAU'
  };

  constructor(private adminData: AdminDataService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.adminData.getAdherents().subscribe({
      next: (res: any) => { this.adherents = res.data; this.total = res.total; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  getStatutClass(statut: string): string {
    const map: any = { ACTIF: 'bg-green-100 text-green-700', NOUVEAU: 'bg-yellow-100 text-yellow-700', SUSPENDU: 'bg-gray-100 text-gray-500' };
    return map[statut] || 'bg-gray-100 text-gray-500';
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.formData = { prenom: '', nom: '', telephone: '', quartier: '', profession: '', competences: '', disponibilite: '', carteRectoUrl: '', carteVersoUrl: '', statut: 'NOUVEAU' };
    this.showModal = true;
  }

  openEditModal(adherent: any) {
    this.isEditing = true;
    this.editingId = adherent.id;
    this.formData = {
      prenom: adherent.prenom || '',
      nom: adherent.nom || '',
      telephone: adherent.telephone || '',
      quartier: adherent.quartier || '',
      profession: adherent.profession || '',
      competences: adherent.competences || '',
      disponibilite: adherent.disponibilite || '',
      carteRectoUrl: adherent.carteRectoUrl || '',
      carteVersoUrl: adherent.carteVersoUrl || '',
      statut: adherent.statut || 'NOUVEAU'
    };
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

  showAlertMethod(type: AlertType, title: string, message: string) {
    this.alertType = type;
    this.alertTitle = title;
    this.alertMessage = message;
    this.showAlert = true;
  }

  action(type: string, id?: string) {
    if (type === 'Ajouter un adhérent') {
      this.openCreateModal();
    } else if (type === 'Supprimer' && id) {
      this.itemToDelete = id;
      this.confirmTitle = 'Supprimer cet adhérent ?';
      this.showConfirmDialog = true;
    } else if (type === 'Valider' && id) {
      this.isLoading = true;
      this.adminData.updateEntity('adherents', id, { statut: 'ACTIF' }).subscribe(() => this.refreshData());
    } else if (type === 'Éditer' && id) {
      const adherent = this.adherents.find((a: any) => a.id === id);
      if (adherent) {
        this.openEditModal(adherent);
      }
    }
  }

  deleteItem = (id: string) => {
    const previousAdherents = [...this.adherents];
    this.adherents = this.adherents.filter(a => a.id !== id);
    this.cdr.markForCheck();

    this.adminData.deleteEntity('adherents', id).subscribe({
      next: () => {
        this.total = Math.max(0, this.total - 1);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.adherents = previousAdherents;
        this.cdr.markForCheck();
        this.showAlertMethod('error', 'Erreur', 'Impossible de supprimer cet adhérent. Le serveur est surchargé, veuillez réessayer.');
      }
    });
  };

  confirmDelete() {
    if (this.itemToDelete) {
      this.deleteItem(this.itemToDelete);
      this.itemToDelete = null;
      this.showConfirmDialog = false;
    }
  }

  submitForm() {
    if (!this.formData.prenom || !this.formData.nom || !this.formData.telephone || !this.formData.quartier) {
      this.showAlertMethod('warning', 'Attention', 'Veuillez remplir les champs obligatoires');
      return;
    }

    const data = {
      prenom: this.formData.prenom,
      nom: this.formData.nom,
      telephone: this.formData.telephone,
      quartier: this.formData.quartier,
      profession: this.formData.profession || null,
      competences: this.formData.competences || null,
      disponibilite: this.formData.disponibilite || null,
      carteRectoUrl: this.formData.carteRectoUrl || null,
      carteVersoUrl: this.formData.carteVersoUrl || null,
      statut: this.formData.statut || 'NOUVEAU'
    };

    this.isLoading = true;
    this.showModal = false;

    if (this.isEditing && this.editingId) {
      this.adminData.updateEntity('adherents', this.editingId, data).subscribe({
        next: () => {
          this.refreshData();
          this.showAlertMethod('success', 'Succès', 'Adhérent modifié avec succès');
        },
        error: () => {
          this.showAlertMethod('error', 'Erreur', 'Erreur lors de la modification');
          this.cdr.markForCheck();
        }
      });
    } else {
      this.adminData.createEntity('adherents', data).subscribe({
        next: () => {
          this.refreshData();
          this.showAlertMethod('success', 'Succès', 'Adhérent ajouté avec succès');
        },
        error: () => {
          this.showAlertMethod('error', 'Erreur', "Erreur lors de l'ajout de l'adhérent");
          this.cdr.markForCheck();
        }
      });
    }
  }

  async downloadIdCard(format: 'png' | 'pdf') {
    const element = document.getElementById('id-card-export');
    if (!element) return;
    
    this.isDownloading = true;
    this.cdr.markForCheck();

    try {
      // Temporarily bring it on screen to ensure images load correctly (invisible)
      element.style.left = '0';
      element.style.top = '0';
      element.style.zIndex = '-9999';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      element.style.left = '-9999px';
      element.style.top = '-9999px';

      if (format === 'png') {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `carte_id_${this.selectedAdherent.prenom}_${this.selectedAdherent.nom}.png`;
        link.href = imgData;
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width / 2, canvas.height / 2]
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`carte_id_${this.selectedAdherent.prenom}_${this.selectedAdherent.nom}.pdf`);
      }
    } catch (err) {
      this.showAlertMethod('error', 'Erreur', 'Impossible de générer le fichier.');
    } finally {
      this.isDownloading = false;
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
