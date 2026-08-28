
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
      <p class="text-sm text-gray-500 mt-1">Modifiez les informations affichées sur le site public (header, footer, réseaux sociaux).</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Formulaire -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Coordonnées (header + footer) -->
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

        <!-- Réseaux Sociaux (header + footer) -->
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

        <!-- Mot de passe admin -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-xs"><i class="fa-solid fa-shield-halved"></i></div>
            Sécurité — Mot de passe Admin
          </h3>
          <p class="text-xs text-gray-400 mb-5 ml-9">Changez le mot de passe de connexion au back-office.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <button (click)="onSave()"
          class="w-full py-3.5 bg-[#022c16] text-white font-black rounded-xl hover:bg-[#022c16]/80 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#022c16]/30">
          <i class="fa-solid fa-floppy-disk"></i> Enregistrer toutes les modifications
        </button>
      </div>

      <!-- Aperçu visuel -->
      <div class="space-y-4">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            <i class="fa-solid fa-eye mr-1"></i> Aperçu — Barre du header
          </h3>
          <!-- Header bar preview -->
          <div class="bg-gray-900 text-gray-300 rounded-xl p-3 text-xs flex flex-col gap-2 mb-4">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-phone text-green-400 text-xs"></i>
              <span>{{ settings.telephone }}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-envelope text-green-400 text-xs"></i>
              <span>{{ settings.email }}</span>
            </div>
            <div class="flex items-center gap-3 pt-1 border-t border-white/10">
              <span class="text-[10px] text-gray-500">Réseaux :</span>
              <i class="fa-brands fa-whatsapp text-[#25D366]"></i>
              <i class="fa-brands fa-facebook-f text-[#1877F2]"></i>
              <i class="fa-brands fa-tiktok text-white"></i>
            </div>
          </div>
          <!-- Footer preview -->
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            <i class="fa-solid fa-eye mr-1"></i> Aperçu — Bloc Contact Footer
          </h3>
          <div class="bg-gray-900 text-gray-300 rounded-xl p-4 text-xs space-y-2">
            <div class="flex items-start gap-2">
              <i class="fa-solid fa-location-dot text-amber-400 mt-0.5"></i>
              <span>{{ settings.adresse }}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-phone text-amber-400"></i>
              <span>{{ settings.telephone }}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-envelope text-amber-400"></i>
              <span>{{ settings.email }}</span>
            </div>
          </div>
        </div>

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

  settings: any = {
    telephone: '+221 77 123 45 67',
    email: 'contact@jammakxeewal.sn',
    adresse: 'Siège social JÀMM AK XÉEWAL\nThiès-Nord, Sénégal',
    whatsapp: 'https://wa.me/',
    facebook: '#',
    tiktok: '#',
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
      },
      error: () => { this.isLoading = false; }
    });
  }

  onSave() {
    this.isSaving = true;
    const dataToSave = { ...this.settings };
    delete dataToSave.newPassword;
    delete dataToSave.confirmPassword;

    this.adminData.saveSettings(dataToSave).subscribe({
      next: () => {
        this.isSaving = false;
        this.saved = true;
        setTimeout(() => this.saved = false, 4000);
      },
      error: () => {
        this.isSaving = false;
        alert("Erreur lors de l'enregistrement");
      }
    });
  }
}
