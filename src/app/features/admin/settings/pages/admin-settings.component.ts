
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [AdminDataService],
  template: `
  <div class="animate-fade-in-up">
    <div class="mb-8">
      <h2 class="text-2xl font-black text-gray-900">Paramètres du Site</h2>
      <p class="text-sm text-gray-500 mt-1">Modifiez les informations affichées sur le site public (header, footer, réseaux sociaux, QR code).</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Formulaire -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Coordonnées -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-[#022c16]/10 text-[#022c16] flex items-center justify-center text-xs"><i class="fa-solid fa-phone"></i></div>
            Coordonnées affichées (Header & Footer)
          </h3>
          <p class="text-xs text-gray-400 mb-5 ml-9">Ces données apparaissent dans la barre d'info en haut du site et dans le footer.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                <i class="fa-solid fa-phone text-[#022c16] mr-1"></i> Téléphone
              </label>
              <input [(ngModel)]="settings.telephone" type="tel"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                <i class="fa-solid fa-envelope text-[#022c16] mr-1"></i> Email de contact
              </label>
              <input [(ngModel)]="settings.email" type="email"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all">
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-bold text-gray-700 mb-1.5">
                <i class="fa-solid fa-location-dot text-[#022c16] mr-1"></i> Adresse (Footer)
              </label>
              <input [(ngModel)]="settings.adresse" type="text"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all">
            </div>
          </div>
        </div>

        <!-- Réseaux Sociaux -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs"><i class="fa-solid fa-share-nodes"></i></div>
            Liens Réseaux Sociaux (Header & Footer)
          </h3>
          <p class="text-xs text-gray-400 mb-5 ml-9">Les liens des icônes WhatsApp, Facebook et TikTok du site public.</p>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-[#25D366] text-white rounded-xl flex items-center justify-center text-sm shrink-0"><i class="fa-brands fa-whatsapp"></i></div>
              <input [(ngModel)]="settings.whatsapp" type="url" placeholder="https://wa.me/221770000000"
                class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all">
            </div>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-[#1877F2] text-white rounded-xl flex items-center justify-center text-sm shrink-0"><i class="fa-brands fa-facebook-f"></i></div>
              <input [(ngModel)]="settings.facebook" type="url" placeholder="https://facebook.com/jammakxeewal"
                class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all">
            </div>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-gray-900 text-white rounded-xl flex items-center justify-center text-sm shrink-0"><i class="fa-brands fa-tiktok"></i></div>
              <input [(ngModel)]="settings.tiktok" type="url" placeholder="https://tiktok.com/@jammakxeewal"
                class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all">
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════
             QR CODE D'ADHÉSION (NOUVEAU)
        ═══════════════════════════════════════════ -->
        <div class="bg-white rounded-2xl shadow-sm border-2 border-[#022c16]/20 p-6 relative overflow-hidden">
          <!-- Badge "Nouveau" -->
          <div class="absolute top-4 right-4 bg-brand-yellow/20 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-amber-200">
            Page d'accueil
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-[#022c16]/10 text-[#022c16] flex items-center justify-center text-xs"><i class="fa-solid fa-qrcode"></i></div>
            QR Code d'Adhésion — Page d'Accueil
          </h3>
          <p class="text-xs text-gray-400 mb-5 ml-9">
            Entrez l'URL que le QR code doit pointer. Cela peut être votre <strong class="text-gray-600">lien WhatsApp</strong>,
            un <strong class="text-gray-600">Google Form</strong>, ou n'importe quelle URL d'inscription.
            Le QR code sera <strong class="text-gray-600">régénéré automatiquement</strong> à chaque modification.
          </p>

          <!-- Champ URL -->
          <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-1.5">
              <i class="fa-solid fa-link text-[#022c16] mr-1"></i> URL cible du QR Code
            </label>
            <div class="flex items-center gap-2">
              <input [(ngModel)]="settings.qr_code_url"
                     (ngModelChange)="onQrUrlChange()"
                     type="url"
                     placeholder="https://wa.me/221770000000 ou https://forms.google.com/..."
                     class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all font-mono">
              <!-- Bouton raccourci WhatsApp -->
              <button *ngIf="settings.whatsapp"
                      (click)="useWhatsappAsQr()"
                      title="Utiliser le lien WhatsApp"
                      class="flex-shrink-0 w-10 h-10 bg-[#25D366] text-white rounded-xl flex items-center justify-center hover:bg-[#1da851] transition-colors shadow-sm">
                <i class="fa-brands fa-whatsapp text-lg"></i>
              </button>
            </div>
            <p class="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
              <i class="fa-solid fa-circle-info text-blue-400"></i>
              Exemples : <code class="bg-gray-50 px-1 rounded">https://wa.me/221XXXXXXXXX</code>,
              <code class="bg-gray-50 px-1 rounded">https://forms.gle/xxx</code>,
              <code class="bg-gray-50 px-1 rounded">https://jammakxeewal.sn/adherer</code>
            </p>
          </div>

          <!-- Aperçu QR live -->
          <div *ngIf="previewQrUrl" class="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center gap-5">
            <div class="flex-shrink-0 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
              <img [src]="previewQrUrl"
                   alt="Aperçu QR Code"
                   class="w-32 h-32 object-contain rounded-lg"
                   onerror="this.style.display='none'">
            </div>
            <div class="min-w-0 text-center sm:text-left">
              <p class="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1 justify-center sm:justify-start">
                <i class="fa-solid fa-eye text-[#022c16]"></i> Aperçu en direct
              </p>
              <p class="text-[11px] text-gray-500 break-all leading-relaxed">{{ settings.qr_code_url }}</p>
              <a [href]="settings.qr_code_url" target="_blank"
                 class="inline-flex items-center gap-1.5 mt-2 text-xs text-[#022c16] font-bold hover:underline">
                <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> Tester le lien
              </a>
            </div>
          </div>

          <!-- État vide -->
          <div *ngIf="!previewQrUrl" class="mt-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center text-gray-400 text-xs">
            <i class="fa-solid fa-qrcode text-2xl mb-2 block opacity-30"></i>
            Saisissez une URL ci-dessus pour voir l'aperçu du QR code
          </div>
        </div>

        <!-- Sécurité -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-xs"><i class="fa-solid fa-shield-halved"></i></div>
            Sécurité — Mot de passe Admin
          </h3>
          <p class="text-xs text-gray-400 mb-5 ml-9">Changez le mot de passe de connexion au back-office.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Mot de passe actuel</label>
              <input [(ngModel)]="settings.currentPassword" type="password" placeholder="••••••••"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Nouveau mot de passe</label>
              <input [(ngModel)]="settings.newPassword" type="password" placeholder="••••••••"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Confirmer</label>
              <input [(ngModel)]="settings.confirmPassword" type="password" placeholder="••••••••"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#022c16]/20 focus:border-[#022c16] transition-all">
            </div>
          </div>
        </div>

        <button (click)="onSave()" [disabled]="isSaving"
          class="w-full py-3.5 bg-[#022c16] text-white font-black rounded-xl hover:bg-[#022c16]/80 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#022c16]/30 disabled:opacity-60 disabled:cursor-not-allowed">
          <i [class]="isSaving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'"></i>
          {{ isSaving ? 'Enregistrement...' : 'Enregistrer toutes les modifications' }}
        </button>
      </div>

      <!-- Colonne droite : Aperçus -->
      <div class="space-y-4">

        <!-- Aperçu Header -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            <i class="fa-solid fa-eye mr-1"></i> Aperçu — Barre du header
          </h3>
          <div class="bg-gray-900 text-gray-300 rounded-xl p-3 text-xs flex flex-col gap-2 mb-4">
            <div class="flex items-center gap-2"><i class="fa-solid fa-phone text-green-400 text-xs"></i><span>{{ settings.telephone }}</span></div>
            <div class="flex items-center gap-2"><i class="fa-solid fa-envelope text-green-400 text-xs"></i><span>{{ settings.email }}</span></div>
            <div class="flex items-center gap-3 pt-1 border-t border-white/10">
              <span class="text-[10px] text-gray-500">Réseaux :</span>
              <i class="fa-brands fa-whatsapp text-[#25D366]"></i>
              <i class="fa-brands fa-facebook-f text-[#1877F2]"></i>
              <i class="fa-brands fa-tiktok text-white"></i>
            </div>
          </div>

          <!-- Aperçu QR mini -->
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            <i class="fa-solid fa-qrcode mr-1"></i> QR Code — Page d'accueil
          </h3>
          <div class="bg-[#022c16]/5 rounded-xl p-4 border border-[#022c16]/10 text-center">
            <div *ngIf="previewQrUrl" class="inline-block bg-white p-2 rounded-xl shadow-sm border border-gray-100">
              <img [src]="previewQrUrl" alt="QR aperçu" class="w-20 h-20 rounded-lg object-contain">
            </div>
            <div *ngIf="!previewQrUrl" class="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
              <i class="fa-solid fa-qrcode text-gray-300 text-2xl"></i>
            </div>
            <p class="text-[10px] text-gray-400 mt-2 truncate max-w-[160px] mx-auto">
              {{ settings.qr_code_url || 'Aucune URL définie' }}
            </p>
          </div>
        </div>

        <!-- Notification succès -->
        <div *ngIf="saved" class="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm font-bold flex items-center gap-2 animate-fade-in-up">
          <i class="fa-solid fa-circle-check text-lg"></i>
          <div>
            <p class="font-black">Enregistré !</p>
            <p class="text-xs font-normal text-green-600">Les modifications seront appliquées sur le site public.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AdminSettingsComponent implements OnInit {
  saved = false;
  isLoading = true;
  isSaving = false;
  previewQrUrl = '';
  private qrDebounceTimer: any;

  settings: any = {
    telephone: '+221 77 123 45 67',
    email: 'contact@jammakxeewal.sn',
    adresse: 'Siège social JÀMM AK XÉEWAL\nThiès-Nord, Sénégal',
    whatsapp: 'https://wa.me/',
    facebook: '#',
    tiktok: '#',
    qr_code_url: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private adminData: AdminDataService) {}

  ngOnInit() {
    this.adminData.getSettings().subscribe({
      next: (res: any) => {
        if (res.data && Object.keys(res.data).length > 0) {
          this.settings = { ...this.settings, ...res.data };
        }
        this.isLoading = false;
        // Générer l'aperçu QR si une URL est déjà enregistrée
        if (this.settings.qr_code_url) {
          this.buildPreviewQr(this.settings.qr_code_url);
        }
      },
      error: () => { this.isLoading = false; }
    });
  }

  /** Appelé à chaque frappe dans le champ URL — debounce 600ms */
  onQrUrlChange() {
    clearTimeout(this.qrDebounceTimer);
    const url = this.settings.qr_code_url?.trim();
    if (!url) { this.previewQrUrl = ''; return; }
    this.qrDebounceTimer = setTimeout(() => this.buildPreviewQr(url), 600);
  }

  /** Génère l'aperçu QR via l'API goqr.me */
  buildPreviewQr(url: string) {
    const encoded = encodeURIComponent(url);
    this.previewQrUrl =
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=022c16&bgcolor=ffffff&margin=10&data=${encoded}`;
  }

  /** Raccourci : utiliser le lien WhatsApp déjà configuré */
  useWhatsappAsQr() {
    this.settings.qr_code_url = this.settings.whatsapp;
    this.buildPreviewQr(this.settings.whatsapp);
  }

  onSave() {
    this.isSaving = true;
    const dataToSave = { ...this.settings };
    delete dataToSave.newPassword;
    delete dataToSave.confirmPassword;

    const passwordChange = this.settings.newPassword && this.settings.newPassword === this.settings.confirmPassword;

    this.adminData.saveSettings(dataToSave).subscribe({
      next: () => {
        if (passwordChange) {
          this.adminData.changePassword(this.settings.currentPassword || '', this.settings.newPassword).subscribe({
            next: () => {
              this.isSaving = false;
              this.saved = true;
              setTimeout(() => this.saved = false, 4000);
              this.settings.newPassword = '';
              this.settings.confirmPassword = '';
              this.settings.currentPassword = '';
            },
            error: () => {
              this.isSaving = false;
              this.saved = true;
              setTimeout(() => this.saved = false, 4000);
              this.settings.newPassword = '';
              this.settings.confirmPassword = '';
              this.settings.currentPassword = '';
            }
          });
        } else {
          this.isSaving = false;
          this.saved = true;
          setTimeout(() => this.saved = false, 4000);
        }
      },
      error: () => {
        this.isSaving = false;
        alert("Erreur lors de l'enregistrement");
      }
    });
  }
}
