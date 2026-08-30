import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-editorial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [AdminDataService],
  template: `
  <div class="animate-fade-in-up max-w-[1600px] mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-[#e6f3eb] flex items-center justify-center shrink-0">
          <i class="fa-solid fa-pen-ruler text-[#008d36] text-2xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-black text-gray-900 tracking-tight">Contenu Éditorial</h2>
          <p class="text-[13px] text-gray-500 font-medium mt-0.5">Modifiez les textes des pages <strong class="text-[#022c16]">Le Mouvement</strong> et <strong class="text-[#022c16]">Nos Axes</strong>.</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-max">
      <button (click)="activeTab = 'home'"
        [class]="activeTab === 'home' ? 'px-5 py-2.5 bg-[#e6f3eb] text-[#008d36] rounded-xl text-sm font-bold shadow-sm' : 'px-5 py-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-xl text-sm font-bold transition-colors'">
        <i class="fa-solid fa-house mr-2"></i> Accueil
      </button>
      <button (click)="activeTab = 'mouvement'"
        [class]="activeTab === 'mouvement' ? 'px-5 py-2.5 bg-[#e6f3eb] text-[#008d36] rounded-xl text-sm font-bold shadow-sm' : 'px-5 py-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-xl text-sm font-bold transition-colors'">
        <i class="fa-solid fa-seedling mr-2"></i> Le Mouvement
      </button>
      <button (click)="activeTab = 'axes'"
        [class]="activeTab === 'axes' ? 'px-5 py-2.5 bg-[#e6f3eb] text-[#008d36] rounded-xl text-sm font-bold shadow-sm' : 'px-5 py-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-xl text-sm font-bold transition-colors'">
        <i class="fa-solid fa-network-wired mr-2"></i> Nos Axes
      </button>
    </div>

    <!-- ===== TAB: ACCUEIL ===== -->
    <div *ngIf="activeTab === 'home'" class="space-y-6">

      <!-- Section Hero -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h3 class="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-[#e6f3eb] text-[#008d36] flex items-center justify-center text-xs"><i class="fa-solid fa-heading"></i></div>
          Section Hero (Haut de page)
        </h3>
        <div class="space-y-5">
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Grand Titre</label>
            <input [(ngModel)]="home.heroTitle" type="text"
              class="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm font-bold focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all outline-none"
              placeholder="Écouter les besoins, Construire Ensemble.">
          </div>
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Paragraphe sous le titre</label>
            <textarea [(ngModel)]="home.heroParagraph" rows="3"
              class="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all resize-none outline-none"
              placeholder="JÀMM AK XÉEWAL n'est pas..."></textarea>
          </div>
        </div>
      </div>

      <!-- Photo du Président -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h3 class="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-[#e6f3eb] text-[#008d36] flex items-center justify-center text-xs"><i class="fa-solid fa-camera"></i></div>
          Photo du Président
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Changer la photo</label>
            <div class="flex gap-3">
              <input type="file" (change)="onUploadPhoto($event)" accept="image/*" class="hidden" #photoInput>
              <button (click)="photoInput.click()" [disabled]="isUploadingPhoto"
                class="px-4 py-2 bg-[#e6f3eb] text-[#008d36] font-bold rounded-lg hover:bg-[#d1e8d9] transition-colors flex items-center gap-2">
                <i class="fa-solid fa-cloud-arrow-up"></i> {{ isUploadingPhoto ? 'Upload en cours...' : 'Uploader une image' }}
              </button>
              <input [(ngModel)]="home.presidentPhoto" type="text"
                class="flex-1 px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all outline-none"
                placeholder="URL de l'image (auto après upload)">
            </div>
          </div>
          <div *ngIf="home.presidentPhoto" class="mt-3">
            <img [src]="home.presidentPhoto" alt="Aperçu" class="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm">
          </div>
        </div>
      </div>

      <!-- Message du Président -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h3 class="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-[#e6f3eb] text-[#008d36] flex items-center justify-center text-xs"><i class="fa-solid fa-quote-right"></i></div>
          Message du Président
        </h3>
        <div class="space-y-5">
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Titre de la section</label>
            <input [(ngModel)]="home.title" type="text"
              class="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all outline-none"
              placeholder="Ensemble, bâtissons le Thiès-Nord de demain">
          </div>
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Nom du Président</label>
            <input [(ngModel)]="home.presidentName" type="text"
              class="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all outline-none"
              placeholder="Nom complet du président">
          </div>
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Message du Président</label>
            <textarea [(ngModel)]="home.message" rows="8"
              class="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all resize-none outline-none"
              placeholder="Votre message ici..."></textarea>
            <p class="text-[11px] text-gray-400 font-medium mt-2">Tapez votre texte naturellement. Les retours à la ligne seront respectés.</p>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h3 class="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs"><i class="fa-solid fa-chart-bar"></i></div>
          Statistiques d'Impact
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Citoyens actifs</label>
            <input [(ngModel)]="home.stat1Value" type="text"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:ring-1 focus:ring-[#022c16] transition-all outline-none mb-2"
              placeholder="500+">
            <input [(ngModel)]="home.stat1Label" type="text"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:ring-1 focus:ring-[#022c16] transition-all outline-none"
              placeholder="Citoyens actifs">
          </div>
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quartiers</label>
            <input [(ngModel)]="home.stat2Value" type="text"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:ring-1 focus:ring-[#022c16] transition-all outline-none mb-2"
              placeholder="15">
            <input [(ngModel)]="home.stat2Label" type="text"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:ring-1 focus:ring-[#022c16] transition-all outline-none"
              placeholder="Quartiers">
          </div>
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Actions réalisées</label>
            <input [(ngModel)]="home.stat3Value" type="text"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:ring-1 focus:ring-[#022c16] transition-all outline-none mb-2"
              placeholder="32">
            <input [(ngModel)]="home.stat3Label" type="text"
              class="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:ring-1 focus:ring-[#022c16] transition-all outline-none"
              placeholder="Actions réalisées">
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button (click)="onSave('home')"
          class="px-8 py-3 bg-[#022c16] text-white font-black rounded-xl hover:bg-[#008d36] transition-colors flex items-center gap-2 shadow-sm">
          <i class="fa-solid fa-floppy-disk"></i> Enregistrer "Accueil"
        </button>
        <a href="/" target="_blank"
          class="px-5 py-3 text-sm font-bold text-[#022c16] bg-[#e6f3eb] rounded-xl hover:bg-[#d1e8d9] transition-colors flex items-center gap-2">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Voir la page
        </a>
      </div>
    </div>

    <!-- ===== TAB: LE MOUVEMENT ===== -->
    <div *ngIf="activeTab === 'mouvement'" class="space-y-6">

      <!-- Hero & Intro -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h3 class="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-[#e6f3eb] text-[#008d36] flex items-center justify-center text-xs"><i class="fa-solid fa-heading"></i></div>
          Section Hero — "Qui sommes-nous ?"
        </h3>
        <div class="space-y-5">
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Sous-titre de page</label>
            <input [(ngModel)]="mouvement.heroSubtitle" type="text"
              class="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all outline-none">
          </div>
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Titre principal</label>
            <input [(ngModel)]="mouvement.heroTitle" type="text"
              class="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm font-bold focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all outline-none">
          </div>
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Paragraphe principal</label>
            <textarea [(ngModel)]="mouvement.heroParagraph" rows="4"
              class="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all resize-none outline-none"></textarea>
          </div>
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Sous-paragraphe (3 piliers)</label>
            <textarea [(ngModel)]="mouvement.heroSubParagraph" rows="2"
              class="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all resize-none outline-none"></textarea>
          </div>
        </div>
      </div>

      <!-- Vision / Mission / Valeurs -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h3 class="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-[#e6f3eb] text-[#008d36] flex items-center justify-center text-xs"><i class="fa-solid fa-compass"></i></div>
          Section "Ce qui nous anime" — Vision, Mission, Valeurs
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-sm"><i class="fa-solid fa-eye"></i></div>
              <span class="text-sm font-bold text-gray-900">Notre Vision</span>
            </div>
            <textarea [(ngModel)]="mouvement.vision" rows="5"
              class="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all resize-none outline-none"></textarea>
          </div>
          <div class="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-sm"><i class="fa-solid fa-bullseye"></i></div>
              <span class="text-sm font-bold text-gray-900">Notre Mission</span>
            </div>
            <textarea [(ngModel)]="mouvement.mission" rows="5"
              class="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all resize-none outline-none"></textarea>
          </div>
          <div class="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 bg-[#e6f3eb] text-[#008d36] rounded-lg flex items-center justify-center text-sm"><i class="fa-solid fa-heart"></i></div>
              <span class="text-sm font-bold text-gray-900">Nos Valeurs</span>
            </div>
            <textarea [(ngModel)]="mouvement.valeurs" rows="5"
              class="w-full px-3 py-2.5 border border-gray-200 bg-white rounded-lg text-sm text-gray-700 focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all resize-none outline-none"
              placeholder="Une valeur par ligne..."></textarea>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button (click)="onSave('mouvement')"
          class="px-8 py-3 bg-[#022c16] text-white font-black rounded-xl hover:bg-[#008d36] transition-colors flex items-center gap-2 shadow-sm">
          <i class="fa-solid fa-floppy-disk"></i> Enregistrer "Le Mouvement"
        </button>
        <a href="/mouvement" target="_blank"
          class="px-5 py-3 text-sm font-bold text-[#022c16] bg-[#e6f3eb] rounded-xl hover:bg-[#d1e8d9] transition-colors flex items-center gap-2">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Voir la page
        </a>
      </div>
    </div>

    <!-- ===== TAB: NOS AXES ===== -->
    <div *ngIf="activeTab === 'axes'" class="space-y-6">

      <!-- Hero Axes -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h3 class="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-[#e6f3eb] text-[#008d36] flex items-center justify-center text-xs"><i class="fa-solid fa-heading"></i></div>
          Section Hero — "Nos 3 Pôles d'Action"
        </h3>
        <div class="space-y-5">
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Titre principal</label>
            <input [(ngModel)]="axes.heroTitle" type="text"
              class="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm font-bold focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all outline-none">
          </div>
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Description</label>
            <textarea [(ngModel)]="axes.heroDesc" rows="3"
              class="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all resize-none outline-none"></textarea>
          </div>
        </div>
      </div>

      <!-- Les 3 pôles -->
      <div *ngFor="let pole of axes.poles; let i = index" class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h3 class="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-[#022c16] text-white flex items-center justify-center text-xs font-black">{{ i + 1 }}</div>
          Pôle {{ i + 1 }}
        </h3>
        <div class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Titre du pôle</label>
              <input [(ngModel)]="pole.titre" type="text"
                class="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm font-bold text-[#008d36] focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all outline-none">
            </div>
            <div>
              <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Sous-titre</label>
              <input [(ngModel)]="pole.soustitre" type="text"
                class="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all outline-none">
            </div>
          </div>
          <div>
            <label class="block text-[13px] font-bold text-gray-700 mb-1.5">Actions (une par ligne)</label>
            <textarea [(ngModel)]="pole.actions" rows="5"
              class="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:ring-1 focus:ring-[#022c16] focus:border-[#022c16] transition-all resize-none font-mono text-[13px] leading-relaxed outline-none text-gray-700"></textarea>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button (click)="onSave('axes')"
          class="px-8 py-3 bg-[#022c16] text-white font-black rounded-xl hover:bg-[#008d36] transition-colors flex items-center gap-2 shadow-sm">
          <i class="fa-solid fa-floppy-disk"></i> Enregistrer "Nos Axes"
        </button>
        <a href="/axes" target="_blank"
          class="px-5 py-3 text-sm font-bold text-[#022c16] bg-[#e6f3eb] rounded-xl hover:bg-[#d1e8d9] transition-colors flex items-center gap-2">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Voir la page
        </a>
      </div>
    </div>

    <!-- Success toast -->
    <div *ngIf="saved" class="fixed bottom-6 right-6 bg-[#008d36] text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in-up z-50">
      <i class="fa-solid fa-circle-check text-xl"></i>
      <div>
        <p class="font-black text-sm">Contenu enregistré !</p>
        <p class="text-[11px] text-white/90">La mise à jour sera visible sur le site public.</p>
      </div>
    </div>
  </div>
  `
})
export class AdminEditorialComponent implements OnInit {
  activeTab: 'home' | 'mouvement' | 'axes' = 'home';
  saved = false;
  isLoading = true;

  home: any = {
    heroTitle: 'Écouter les besoins, <br/>\n<span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow via-yellow-300 to-brand-yellow drop-shadow-none">Construire Ensemble.</span>',
    heroParagraph: 'JÀMM AK XÉEWAL n\'est pas qu\'une idée, c\'est <strong class="text-white">une force en action sur le terrain</strong>.<br/><br/>Rejoignez des centaines de citoyens engagés pour transformer notre quartier, rue par rue.',
    presidentPhoto: 'assets/president-photo.jpeg',
    presidentName: 'Le Président',
    title: 'Ensemble, bâtissons <br/><span class=\'text-brand-greenLight\'>le Thiès-Nord de demain</span>',
    message: '<p>« Chères citoyennes, chers citoyens de Thiès-Nord,</p><p>Notre localité regorge de talents, de ressources et d\'une jeunesse dynamique. Le mouvement JÀMM AK XÉEWAL est votre outil. Il n\'est pas conçu pour faire des promesses, mais pour bâtir avec vous. Chaque idée que vous proposez, chaque problème que vous signalez, constitue la brique de notre futur programme.</p><p class=\'text-white font-medium\'>Agissons ensemble, dans la paix et pour la prospérité de tous. »</p>',
    stat1Value: '500+',
    stat1Label: 'Citoyens actifs',
    stat2Value: '15',
    stat2Label: 'Quartiers',
    stat3Value: '32',
    stat3Label: 'Actions réalisées'
  };

  mouvement: any = {
    heroSubtitle: 'Découvrez l\'histoire, la vision et les valeurs fondamentales qui animent JÀMM AK XÉEWAL.',
    heroTitle: 'Agir ensemble pour l\'avenir de Thiès-Nord',
    heroParagraph: 'Le mouvement JÀMM AK XÉEWAL est né d\'un constat simple et d\'une volonté citoyenne profonde : rassembler les forces vives de notre localité autour d\'un idéal de Paix (Jàmm) et de Prospérité partagée (Xéewal).',
    heroSubParagraph: 'Loin des clivages politiques traditionnels, nous construisons une véritable plateforme d\'action communautaire. Notre démarche s\'articule autour de 3 piliers :',
    vision: 'Bâtir un Thiès-Nord prospère, solidaire et durable, où chaque citoyen est acteur du développement de son quartier et moteur du changement.',
    mission: 'Fédérer les énergies locales, écouter attentivement les populations et co-construire un programme d\'actions concrètes, inclusives et réalisables.',
    valeurs: 'Paix (Jàmm) & Prospérité (Xéewal)\nTransparence & Justice sociale\nEngagement citoyen absolu'
  };

  axes: any = {
    heroTitle: 'Nos 3 Pôles d\'Action',
    heroDesc: 'Le projet JÀMM AK XÉEWAL a fusionné ses initiatives autour de 3 grands pôles stratégiques. Découvrez notre vision unifiée pour Thiès-Nord.',
    poles: [
      {
        titre: 'Développement Humain & Inclusion Sociale',
        soustitre: 'Garantir l\'épanouissement, la santé et l\'équité pour chaque citoyen de Thiès-Nord.',
        actions: 'Éducation, formation de base et accompagnement pédagogique\nAction sociale, prévention santé et soutien aux personnes vulnérables\nAutonomisation économique et leadership des femmes\nCulture, sport et renforcement de la cohésion intergénérationnelle'
      },
      {
        titre: 'Économie, Emploi & Innovation Numérique',
        soustitre: 'Transformer le potentiel de notre jeunesse et de notre territoire en opportunités réelles.',
        actions: 'Accompagnement à l\'entrepreneuriat et insertion professionnelle\nFormation aux métiers du numérique et de l\'intelligence artificielle\nDigitalisation des initiatives et création de solutions locales\nIncubation de projets et mise en réseau des compétences'
      },
      {
        titre: 'Cadre de vie, Environnement & Sécurité',
        soustitre: 'Bâtir un environnement propre, sûr, durable et apaisé pour tous nos quartiers.',
        actions: 'Campagnes d\'assainissement et gestion participative des déchets\nProtection des espaces publics, aménagement et reboisement\nComités de vigilance citoyenne et éclairage public sécuritaire\nPrévention et dialogue pour assurer la tranquillité publique'
      }
    ]
  };

  constructor(private adminData: AdminDataService) {}

  isUploadingPhoto = false;

  onUploadPhoto(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.isUploadingPhoto = true;
      this.adminData.uploadMedia(file).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.home.presidentPhoto = res.data.url;
          }
          this.isUploadingPhoto = false;
        },
        error: () => {
          alert("Erreur lors de l'upload de la photo");
          this.isUploadingPhoto = false;
        }
      });
    }
  }

  ngOnInit() {
    this.adminData.getEditorial('home').subscribe({
      next: (res: any) => { if (res.data) this.home = res.data; }
    });
    this.adminData.getEditorial('mouvement').subscribe({
      next: (res: any) => { if (res.data) this.mouvement = res.data; }
    });
    this.adminData.getEditorial('axes').subscribe({
      next: (res: any) => { if (res.data) this.axes = res.data; }
    });
  }

  onSave(section: string) {
    const content = section === 'home' ? this.home : section === 'mouvement' ? this.mouvement : this.axes;
    this.adminData.saveEditorial(section, content).subscribe({
      next: () => {
        this.saved = true;
        setTimeout(() => this.saved = false, 3500);
      },
      error: () => alert("Erreur de sauvegarde")
    });
  }
}
