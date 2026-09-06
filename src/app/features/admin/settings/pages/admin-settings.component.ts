import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';
import { RbacService } from '../../../../core/services/rbac.service';
import { AlertPopupComponent, AlertType } from '../../../../shared/components/alert-popup/alert-popup.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertPopupComponent, ConfirmDialogComponent],
  providers: [AdminDataService],
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


    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center shrink-0">
          <i class="fa-solid fa-gear text-[#008d36] text-2xl animate-[spin_4s_linear_infinite]"></i>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Paramètres du Site</h2>
          <p class="text-[13px] text-gray-500 font-medium mt-0.5">Modifiez les informations affichées sur le site public (header, footer, réseaux sociaux, QR code).</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Formulaire -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Coordonnées -->
        <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 relative overflow-hidden border-l-[6px] border-l-[#008d36]">
          <h3 class="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-[#e6f3eb] text-[#008d36] flex items-center justify-center text-xs"><i class="fa-solid fa-phone"></i></div>
            Coordonnées affichées (Header & Footer)
          </h3>
          <p class="text-[11px] font-medium text-gray-500 mb-5 ml-9">Ces données apparaissent dans la barre d'info en haut du site et dans le footer.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">
                <i class="fa-solid fa-phone text-[#008d36] mr-1"></i> Téléphone
              </label>
              <input [(ngModel)]="settings.telephone" type="tel"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none">
            </div>
            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">
                <i class="fa-solid fa-envelope text-[#008d36] mr-1"></i> Email de contact
              </label>
              <input [(ngModel)]="settings.email" type="email"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none">
            </div>
            <div class="sm:col-span-2">
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">
                <i class="fa-solid fa-location-dot text-[#008d36] mr-1"></i> Adresse (Footer)
              </label>
              <input [(ngModel)]="settings.adresse" type="text"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none">
            </div>
          </div>
        </div>

        <!-- Réseaux Sociaux -->
        <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 relative overflow-hidden border-l-[6px] border-l-blue-500">
          <h3 class="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs"><i class="fa-solid fa-share-nodes"></i></div>
            Liens Réseaux Sociaux (Header & Footer)
          </h3>
          <p class="text-[11px] font-medium text-gray-500 mb-5 ml-9">Activez et configurez les réseaux sociaux qui apparaîtront sur le site public.</p>
          
          <div class="space-y-3">
            <div *ngFor="let social of availableSocials; let i = index" class="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl transition-all" [ngClass]="{'opacity-60': !social.active}">
              <!-- Toggle & Icon -->
              <div class="flex items-center gap-3 w-40 shrink-0">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" [(ngModel)]="social.active" class="sr-only peer">
                  <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <div class="w-8 h-8 text-white rounded-lg flex items-center justify-center text-sm shadow-sm" [style.background-color]="social.active ? social.color : '#9ca3af'">
                  <i [class]="social.icon"></i>
                </div>
                <span class="text-[13px] font-bold text-gray-700">{{ social.name }}</span>
              </div>
              
              <!-- URL Input -->
              <input [(ngModel)]="social.url" [disabled]="!social.active" type="url" [placeholder]="'URL de votre profil ' + social.name"
                class="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none disabled:bg-gray-100 disabled:text-gray-400">
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════
             QR CODE D'ADHÉSION (NOUVEAU)
        ═══════════════════════════════════════════ -->
        <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 relative overflow-hidden border-l-[6px] border-l-amber-500">
          <!-- Badge "Nouveau" -->
          <div class="absolute top-4 right-4 bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-amber-100">
            Page d'accueil
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs"><i class="fa-solid fa-qrcode"></i></div>
            QR Code d'Adhésion — Page d'Accueil
          </h3>
          <p class="text-[11px] font-medium text-gray-500 mb-5 ml-9">
            Entrez l'URL que le QR code doit pointer. Cela peut être votre <strong>lien WhatsApp</strong>,
            un <strong>Google Form</strong>, ou n'importe quelle URL d'inscription.
            Le QR code sera <strong>régénéré automatiquement</strong> à chaque modification.
          </p>

          <!-- Champ URL -->
          <div class="mb-4">
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">
              <i class="fa-solid fa-link text-[#008d36] mr-1"></i> URL cible du QR Code
            </label>
            <div class="flex items-center gap-2">
              <input [(ngModel)]="settings.qr_code_url"
                     (ngModelChange)="onQrUrlChange()"
                     type="url"
                     placeholder="https://wa.me/221770000000 ou https://forms.google.com/..."
                     class="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:border-[#022c16] focus:ring-1 focus:ring-[#022c16] transition-all outline-none font-mono">
              <!-- Bouton raccourci WhatsApp -->
              <button *ngIf="settings.whatsapp"
                      (click)="useWhatsappAsQr()"
                      title="Utiliser le lien WhatsApp"
                      class="flex-shrink-0 w-11 h-11 bg-[#25D366] text-white rounded-xl flex items-center justify-center hover:bg-[#1da851] transition-colors shadow-sm">
                <i class="fa-brands fa-whatsapp text-xl"></i>
              </button>
            </div>
            <p class="text-[11px] text-gray-400 font-medium mt-2 flex items-center gap-1.5">
              <i class="fa-solid fa-circle-info text-[#008d36]"></i>
              Exemples : <code class="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold">https://wa.me/221XXXXXXXXX</code>,
              <code class="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold">https://forms.gle/xxx</code>,
              <code class="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-bold">{{ environment.publicUrl }}/adherer</code>
            </p>
          </div>

          <!-- Aperçu QR live -->
          <div *ngIf="previewQrUrl" class="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center gap-5">
            <div class="flex-shrink-0 bg-white p-2.5 rounded-xl shadow-sm border border-gray-200">
              <img [src]="previewQrUrl"
                   alt="Aperçu QR Code"
                   class="w-28 h-28 object-contain rounded-lg"
                   onerror="this.style.display='none'">
            </div>
            <div class="min-w-0 text-center sm:text-left">
              <p class="text-[13px] font-bold text-gray-900 mb-1 flex items-center gap-1.5 justify-center sm:justify-start">
                <i class="fa-solid fa-eye text-[#008d36]"></i> Aperçu en direct
              </p>
              <p class="text-[11px] text-gray-500 font-medium break-all leading-relaxed">{{ settings.qr_code_url }}</p>
              <a [href]="settings.qr_code_url" target="_blank"
                 class="inline-flex items-center gap-1.5 mt-2.5 text-xs text-[#008d36] font-bold bg-[#e6f3eb] px-3 py-1.5 rounded-lg hover:bg-[#d1e8d9] transition-colors">
                <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> Tester le lien
              </a>
            </div>
          </div>

          <!-- État vide -->
          <div *ngIf="!previewQrUrl" class="mt-5 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-center text-gray-500 text-xs font-medium">
            <i class="fa-solid fa-qrcode text-3xl mb-3 block text-gray-300"></i>
            Saisissez une URL ci-dessus pour voir l'aperçu du QR code
          </div>
        </div>

        <!-- ═══════════════════════════════════════════
             DURÉE DES MESSAGES VOCAUX
        ═══════════════════════════════════════════ -->
        <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 relative overflow-hidden border-l-[6px] border-l-purple-500">
          <!-- Badge -->
          <div class="absolute top-4 right-4 bg-purple-50 text-purple-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-purple-100">
            Signalements
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs"><i class="fa-solid fa-microphone"></i></div>
            Durée Max des Messages Vocaux
          </h3>
          <p class="text-[11px] font-medium text-gray-500 mb-6 ml-9">
            Définissez le nombre de secondes maximum qu'un citoyen peut enregistrer lors d'un signalement vocal.
            Cette limite s'applique en temps réel sur le formulaire public.
          </p>

          <!-- Valeur affichée en grand -->
          <div class="flex items-center justify-center mb-6">
            <div class="bg-gradient-to-br from-purple-50 to-white text-purple-900 rounded-2xl px-10 py-5 text-center shadow-sm border border-purple-100">
              <p class="text-4xl font-black font-mono tracking-widest">{{ vocalMaxFormatted }}</p>
              <p class="text-purple-600 text-xs mt-1 font-bold">{{ settings.vocal_max_seconds }} secondes</p>
            </div>
          </div>

          <!-- Slider -->
          <div class="mb-5 bg-gray-50 p-5 rounded-xl border border-gray-100">
            <label class="block text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">
              <span><i class="fa-solid fa-sliders mr-2 text-purple-500"></i> Glissez pour ajuster</span>
              <span class="font-mono text-purple-700 font-black text-base bg-purple-100 px-3 py-1 rounded-lg">{{ settings.vocal_max_seconds }}s</span>
            </label>
            <input
              type="range"
              [(ngModel)]="settings.vocal_max_seconds"
              min="15"
              max="300"
              step="5"
              id="vocal-duration-slider"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style="accent-color: #9333ea;"
            >
            <div class="flex justify-between text-[10px] text-gray-400 mt-2 font-mono font-bold">
              <span>15s</span>
              <span>1min</span>
              <span>2min</span>
              <span>3min</span>
              <span>5min</span>
            </div>
          </div>

          <!-- Input numérique direct -->
          <div class="flex items-center gap-3 mb-6">
            <div class="flex-1">
              <label class="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Ou saisissez directement (en secondes)</label>
              <div class="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all shadow-sm">
                <button type="button"
                        (click)="settings.vocal_max_seconds = Math.max(15, +settings.vocal_max_seconds - 5)"
                        class="px-4 py-2.5 bg-gray-50 text-gray-600 font-black hover:bg-gray-100 transition-colors text-lg border-r border-gray-200">−</button>
                <input
                  type="number"
                  [(ngModel)]="settings.vocal_max_seconds"
                  min="15" max="300"
                  id="vocal-duration-input"
                  class="flex-1 px-3 py-2.5 text-center font-black text-gray-900 text-base focus:outline-none bg-transparent">
                <button type="button"
                        (click)="settings.vocal_max_seconds = Math.min(300, +settings.vocal_max_seconds + 5)"
                        class="px-4 py-2.5 bg-gray-50 text-gray-600 font-black hover:bg-gray-100 transition-colors text-lg border-l border-gray-200">+</button>
              </div>
            </div>
          </div>

          <!-- Presets rapides -->
          <div>
            <p class="text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">Durées prédéfinies</p>
            <div class="grid grid-cols-4 gap-3">
              <button type="button"
                      *ngFor="let preset of [{label:'30s', val:30},{label:'1 min', val:60},{label:'2 min', val:120},{label:'3 min', val:180}]"
                      (click)="settings.vocal_max_seconds = preset.val"
                      class="py-2.5 rounded-xl text-[13px] font-bold border transition-all"
                      [ngClass]="settings.vocal_max_seconds == preset.val
                        ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'">
                {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- Info -->
          <div class="mt-6 bg-purple-50 border border-purple-100 rounded-xl p-4 flex gap-3">
            <i class="fa-solid fa-circle-info text-purple-500 text-lg mt-0.5 shrink-0"></i>
            <p class="text-[11px] font-medium text-purple-800 leading-relaxed">
              Les citoyens verront un décompte en temps réel lors de l'enregistrement. L'enregistrement s'arrête automatiquement à la limite fixée.
            </p>
          </div>
        </div>

        <!-- Sécurité -->
        <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 relative overflow-hidden border-l-[6px] border-l-red-500">
          <h3 class="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-xs"><i class="fa-solid fa-shield-halved"></i></div>
            Sécurité — Mot de passe Admin
          </h3>
          <p class="text-[11px] font-medium text-gray-500 mb-5 ml-9">Changez le mot de passe de connexion au back-office.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Mot de passe actuel</label>
              <input [(ngModel)]="settings.currentPassword" type="password" placeholder="••••••••"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none">
            </div>
            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Nouveau mot de passe</label>
              <input [(ngModel)]="settings.newPassword" type="password" placeholder="••••••••"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none">
            </div>
            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Confirmer</label>
              <input [(ngModel)]="settings.confirmPassword" type="password" placeholder="••••••••"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none">
            </div>
          </div>
        </div>

        <button (click)="onSave()" [disabled]="isSaving || !rbac.hasPermission('settings.update')"
          class="w-full py-4 bg-[#022c16] text-white font-black rounded-xl hover:bg-[#008d36] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
          <i [class]="isSaving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'"></i>
          {{ isSaving ? 'Enregistrement en cours...' : 'Enregistrer toutes les modifications' }}
        </button>
      </div>

      <!-- Colonne droite : Aperçus -->
      <div class="space-y-5">

        <!-- Aperçu Header -->
        <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sticky top-24">
          <h3 class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
            <i class="fa-solid fa-eye mr-2 text-gray-400"></i> Aperçu — Barre du header
          </h3>
          <div class="bg-[#022c16] text-white rounded-xl p-4 text-[11px] flex flex-col gap-3 mb-5 shadow-inner">
            <div class="flex items-center gap-2"><i class="fa-solid fa-phone text-[#008d36]"></i><span class="font-medium">{{ settings.telephone }}</span></div>
            <div class="flex items-center gap-2"><i class="fa-solid fa-envelope text-[#008d36]"></i><span class="font-medium">{{ settings.email }}</span></div>
            <div class="flex items-center gap-3 pt-2 border-t border-white/10 mt-1">
              <span class="text-white/60 font-medium">Réseaux :</span>
              <ng-container *ngFor="let social of availableSocials">
                <i *ngIf="social.active" [class]="social.icon" [style.color]="social.color" class="text-sm"></i>
              </ng-container>
            </div>
          </div>

          <!-- Aperçu QR mini -->
          <h3 class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
            <i class="fa-solid fa-qrcode mr-2 text-gray-400"></i> QR Code — Page d'accueil
          </h3>
          <div class="bg-gray-50 rounded-xl p-5 border border-gray-100 text-center">
            <div *ngIf="previewQrUrl" class="inline-block bg-white border border-gray-200 p-2.5 rounded-xl shadow-sm">
              <img [src]="previewQrUrl" alt="QR aperçu" class="w-24 h-24 rounded-lg object-contain">
            </div>
            <div *ngIf="!previewQrUrl" class="w-24 h-24 bg-white border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center mx-auto">
              <i class="fa-solid fa-qrcode text-gray-300 text-3xl"></i>
            </div>
            <p class="text-[10px] text-gray-500 font-medium mt-3 truncate max-w-[160px] mx-auto bg-white px-2 py-1 rounded border border-gray-100">
              {{ settings.qr_code_url || 'Aucune URL définie' }}
            </p>
          </div>
        </div>

        <!-- Notification succès -->
        <div *ngIf="saved" class="bg-[#e6f3eb] border border-[#008d36]/20 text-[#008d36] rounded-xl p-4 text-sm flex items-start gap-3 animate-fade-in-up shadow-sm">
          <i class="fa-solid fa-circle-check text-xl mt-0.5"></i>
          <div>
            <p class="font-black text-gray-900">Enregistré avec succès !</p>
            <p class="text-[11px] font-medium text-gray-600 mt-0.5">Les modifications sont maintenant visibles sur le site public.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AdminSettingsComponent implements OnInit {
  public environment = environment;
  readonly Math = Math;
  saved = false;
  isLoading = true;
  isSaving = false;
  previewQrUrl = '';
  private qrDebounceTimer: any;

  availableSocials = [
    { id: 'whatsapp', name: 'WhatsApp', icon: 'fa-brands fa-whatsapp', color: '#25D366', active: true, url: '' },
    { id: 'facebook', name: 'Facebook', icon: 'fa-brands fa-facebook-f', color: '#1877F2', active: true, url: '' },
    { id: 'tiktok', name: 'TikTok', icon: 'fa-brands fa-tiktok', color: '#000000', active: true, url: '' },
    { id: 'youtube', name: 'YouTube', icon: 'fa-brands fa-youtube', color: '#FF0000', active: true, url: '' },
    { id: 'instagram', name: 'Instagram', icon: 'fa-brands fa-instagram', color: '#E4405F', active: false, url: '' },
    { id: 'twitter', name: 'X (Twitter)', icon: 'fa-brands fa-x-twitter', color: '#000000', active: false, url: '' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'fa-brands fa-linkedin-in', color: '#0A66C2', active: false, url: '' },
    { id: 'telegram', name: 'Telegram', icon: 'fa-brands fa-telegram', color: '#26A5E4', active: false, url: '' },
    { id: 'snapchat', name: 'Snapchat', icon: 'fa-brands fa-snapchat', color: '#FFFC00', active: false, url: '' }
  ];

  settings: any = {
    telephone: '+221 77 123 45 67',
    email: environment.publicEmail,
    adresse: 'Siège social JÀMM AK XÉEWAL\nThiès-Nord, Sénégal',
    whatsapp: 'https://wa.me/',
    facebook: '#',
    tiktok: '#',
    youtube: '#',
    social_links: [],
    qr_code_url: '',
    vocal_max_seconds: 120,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  get vocalMaxFormatted(): string {
    const secs = +this.settings.vocal_max_seconds || 120;
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  
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
    // Logique de confirmation selon this.confirmActionType si nécessaire
  }

  constructor(private adminData: AdminDataService, public rbac: RbacService) {}

  ngOnInit() {
    this.adminData.getSettings().subscribe({
      next: (res: any) => {
        if (res.data && Object.keys(res.data).length > 0) {
          this.settings = { ...this.settings, ...res.data };
          // S'assurer que vocal_max_seconds est un nombre
          if (this.settings.vocal_max_seconds) {
            this.settings.vocal_max_seconds = +this.settings.vocal_max_seconds;
          }
          
          // Hydrater availableSocials
          if (this.settings.social_links && Array.isArray(this.settings.social_links)) {
            // Merge des settings existants
            this.availableSocials.forEach(social => {
              const saved = this.settings.social_links.find((s: any) => s.id === social.id);
              if (saved) {
                social.url = saved.url;
                social.active = saved.active;
              }
            });
          } else {
            // Compatibilité avec l'ancien format hardcodé
            const mapOld: Record<string, string> = {
              'whatsapp': this.settings.whatsapp,
              'facebook': this.settings.facebook,
              'tiktok': this.settings.tiktok,
              'youtube': this.settings.youtube
            };
            this.availableSocials.forEach(social => {
              if (mapOld[social.id] !== undefined) {
                social.url = mapOld[social.id] || '';
                social.active = !!social.url && social.url !== '#';
              }
            });
          }
        }
        this.isLoading = false;
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
    
    // Synchro de availableSocials vers settings
    this.settings.social_links = this.availableSocials.map(s => ({
      id: s.id, name: s.name, icon: s.icon, color: s.color, active: s.active, url: s.url
    }));
    
    // Retro-compatibilité pour l'ancien header (au cas où)
    const getUrl = (id: string) => { const f = this.availableSocials.find(x => x.id === id); return (f && f.active && f.url) ? f.url : '#'; };
    this.settings.whatsapp = getUrl('whatsapp');
    this.settings.facebook = getUrl('facebook');
    this.settings.tiktok = getUrl('tiktok');
    this.settings.youtube = getUrl('youtube');

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
        this.showAlert("Erreur lors de l'enregistrement", 'error');
      }
    });
  }
}
