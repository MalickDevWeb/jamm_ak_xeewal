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
  <div class="animate-fade-in-up">
    <div class="mb-8">
      <h2 class="text-2xl font-black text-white">Contenu Éditorial</h2>
      <p class="text-sm text-gray-400 mt-1">
        Modifiez les textes des pages <strong class="text-[#022c16]">Le Mouvement</strong> (/mouvement) et <strong class="text-[#022c16]">Nos Axes</strong> (/axes) du site public.
      </p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <button (click)="activeTab = 'home'"
        [class]="activeTab === 'home' ? 'px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow' : 'px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-sm font-bold border border-white/20 hover:bg-white/5 transition-colors'">
        <i class="fa-solid fa-house mr-2"></i> Accueil
      </button>
      <button (click)="activeTab = 'mouvement'"
        [class]="activeTab === 'mouvement' ? 'px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow' : 'px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-sm font-bold border border-white/20 hover:bg-white/5 transition-colors'">
        <i class="fa-solid fa-seedling mr-2"></i> Le Mouvement
      </button>
      <button (click)="activeTab = 'axes'"
        [class]="activeTab === 'axes' ? 'px-5 py-2.5 bg-[#022c16] text-white rounded-xl text-sm font-bold shadow' : 'px-5 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-sm font-bold border border-white/20 hover:bg-white/5 transition-colors'">
        <i class="fa-solid fa-network-wired mr-2"></i> Nos Axes
      </button>
    </div>

    <!-- ===== TAB: ACCUEIL ===== -->
    <div *ngIf="activeTab === 'home'" class="space-y-6">

      <!-- Photo du Président -->
      <div class="bg-white/5 border border-white/10 rounded-2xl shadow-sm border border-white/10 p-6">
        <h3 class="text-base font-bold text-white mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-brand-green/20 text-brand-green flex items-center justify-center text-xs"><i class="fa-solid fa-camera"></i></div>
          Photo du Président
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">URL de la photo</label>
            <input [(ngModel)]="home.presidentPhoto" type="text"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              placeholder="https://... ou assets/photo.jpg">
            <p class="text-xs text-gray-400 mt-1">Collez l'URL de la photo ou uploadez via la section Médias</p>
          </div>
          <div *ngIf="home.presidentPhoto" class="mt-3">
            <img [src]="home.presidentPhoto" alt="Aperçu" class="w-32 h-32 object-cover rounded-xl border border-white/20">
          </div>
        </div>
      </div>

      <!-- Message du Président -->
      <div class="bg-white/5 border border-white/10 rounded-2xl shadow-sm border border-white/10 p-6">
        <h3 class="text-base font-bold text-white mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-brand-green/5 text-brand-green flex items-center justify-center text-xs"><i class="fa-solid fa-quote-right"></i></div>
          Message du Président
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Titre de la section</label>
            <input [(ngModel)]="home.title" type="text"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              placeholder="Ensemble, bâtissons le Thiès-Nord de demain">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nom du Président</label>
            <input [(ngModel)]="home.presidentName" type="text"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              placeholder="Nom complet du président">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Message (HTML supporté)</label>
            <textarea [(ngModel)]="home.message" rows="8"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"
              placeholder="<p>Votre message ici...</p>"></textarea>
            <p class="text-xs text-gray-400 mt-1">Utilisez <code>&lt;p&gt;</code> pour les paragraphes, <code>&lt;strong&gt;</code> pour le texte en gras</p>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="bg-white/5 border border-white/10 rounded-2xl shadow-sm border border-white/10 p-6">
        <h3 class="text-base font-bold text-white mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs"><i class="fa-solid fa-chart-bar"></i></div>
          Statistiques d'Impact
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Citoyens actifs</label>
            <input [(ngModel)]="home.stat1Value" type="text"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              placeholder="500+">
            <input [(ngModel)]="home.stat1Label" type="text"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all mt-2"
              placeholder="Citoyens actifs">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Quartiers</label>
            <input [(ngModel)]="home.stat2Value" type="text"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              placeholder="15">
            <input [(ngModel)]="home.stat2Label" type="text"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all mt-2"
              placeholder="Quartiers">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Actions réalisées</label>
            <input [(ngModel)]="home.stat3Value" type="text"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              placeholder="32">
            <input [(ngModel)]="home.stat3Label" type="text"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all mt-2"
              placeholder="Actions réalisées">
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button (click)="onSave('home')"
          class="px-8 py-3 bg-[#022c16] text-white font-black rounded-xl hover:bg-[#022c16]/80 transition-all flex items-center gap-2 shadow-lg">
          <i class="fa-solid fa-floppy-disk"></i> Enregistrer "Accueil"
        </button>
        <a href="/" target="_blank"
          class="px-5 py-3 text-sm font-bold text-[#022c16] bg-[#022c16]/10 rounded-xl hover:bg-[#022c16]/20 transition-colors flex items-center gap-2">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Voir la page d'accueil
        </a>
      </div>
    </div>

    <!-- ===== TAB: LE MOUVEMENT ===== -->
    <div *ngIf="activeTab === 'mouvement'" class="space-y-6">

      <!-- Hero & Intro -->
      <div class="bg-white/5 border border-white/10 rounded-2xl shadow-sm border border-white/10 p-6">
        <h3 class="text-base font-bold text-white mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-brand-green/20 text-brand-green flex items-center justify-center text-xs"><i class="fa-solid fa-heading"></i></div>
          Section Hero — "Qui sommes-nous ?"
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Sous-titre de page</label>
            <input [(ngModel)]="mouvement.heroSubtitle" type="text"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Titre principal</label>
            <input [(ngModel)]="mouvement.heroTitle" type="text"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Paragraphe principal</label>
            <textarea [(ngModel)]="mouvement.heroParagraph" rows="4"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Sous-paragraphe (3 piliers)</label>
            <textarea [(ngModel)]="mouvement.heroSubParagraph" rows="2"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"></textarea>
          </div>
        </div>
      </div>

      <!-- Vision / Mission / Valeurs -->
      <div class="bg-white/5 border border-white/10 rounded-2xl shadow-sm border border-white/10 p-6">
        <h3 class="text-base font-bold text-white mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-brand-green/5 text-brand-green flex items-center justify-center text-xs"><i class="fa-solid fa-compass"></i></div>
          Section "Ce qui nous anime" — Vision, Mission, Valeurs
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div class="bg-black/20 rounded-xl p-4 border border-white/10">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-6 h-6 bg-brand-green/10 text-brand-green rounded-lg flex items-center justify-center text-xs"><i class="fa-solid fa-eye"></i></div>
              <span class="text-sm font-bold text-gray-200">Notre Vision</span>
            </div>
            <textarea [(ngModel)]="mouvement.vision" rows="4"
              class="w-full px-3 py-2 border border-white/20 rounded-lg text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none bg-white/5 border border-white/10"></textarea>
          </div>
          <div class="bg-black/20 rounded-xl p-4 border border-white/10">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-6 h-6 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center text-xs"><i class="fa-solid fa-bullseye"></i></div>
              <span class="text-sm font-bold text-gray-200">Notre Mission</span>
            </div>
            <textarea [(ngModel)]="mouvement.mission" rows="4"
              class="w-full px-3 py-2 border border-white/20 rounded-lg text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none bg-white/5 border border-white/10"></textarea>
          </div>
          <div class="bg-black/20 rounded-xl p-4 border border-white/10">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-6 h-6 bg-brand-green/20 text-brand-green rounded-lg flex items-center justify-center text-xs"><i class="fa-solid fa-heart"></i></div>
              <span class="text-sm font-bold text-gray-200">Nos Valeurs</span>
            </div>
            <textarea [(ngModel)]="mouvement.valeurs" rows="4"
              class="w-full px-3 py-2 border border-white/20 rounded-lg text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none bg-white/5 border border-white/10"
              placeholder="Une valeur par ligne..."></textarea>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button (click)="onSave('mouvement')"
          class="px-8 py-3 bg-[#022c16] text-white font-black rounded-xl hover:bg-[#022c16]/80 transition-all flex items-center gap-2 shadow-lg">
          <i class="fa-solid fa-floppy-disk"></i> Enregistrer "Le Mouvement"
        </button>
        <a href="/mouvement" target="_blank"
          class="px-5 py-3 text-sm font-bold text-[#022c16] bg-[#022c16]/10 rounded-xl hover:bg-[#022c16]/20 transition-colors flex items-center gap-2">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Voir la page publique
        </a>
      </div>
    </div>

    <!-- ===== TAB: NOS AXES ===== -->
    <div *ngIf="activeTab === 'axes'" class="space-y-6">

      <!-- Hero Axes -->
      <div class="bg-white/5 border border-white/10 rounded-2xl shadow-sm border border-white/10 p-6">
        <h3 class="text-base font-bold text-white mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-brand-green/20 text-brand-green flex items-center justify-center text-xs"><i class="fa-solid fa-heading"></i></div>
          Section Hero — "Nos 3 Pôles d'Action"
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Titre principal</label>
            <input [(ngModel)]="axes.heroTitle" type="text"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
            <textarea [(ngModel)]="axes.heroDesc" rows="2"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"></textarea>
          </div>
        </div>
      </div>

      <!-- Les 3 pôles -->
      <div *ngFor="let pole of axes.poles; let i = index" class="bg-white/5 border border-white/10 rounded-2xl shadow-sm border border-white/10 p-6">
        <h3 class="text-base font-bold text-white mb-5 flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-[#022c16] text-white flex items-center justify-center text-xs font-black">{{ i + 1 }}</div>
          Pôle {{ i + 1 }}
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Titre du pôle</label>
            <input [(ngModel)]="pole.titre" type="text"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Sous-titre</label>
            <input [(ngModel)]="pole.soustitre" type="text"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Actions (une par ligne)</label>
            <textarea [(ngModel)]="pole.actions" rows="5"
              class="w-full px-4 py-2.5 border border-white/20 rounded-xl text-sm focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none font-mono text-xs"></textarea>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button (click)="onSave('axes')"
          class="px-8 py-3 bg-[#022c16] text-white font-black rounded-xl hover:bg-[#022c16]/80 transition-all flex items-center gap-2 shadow-lg">
          <i class="fa-solid fa-floppy-disk"></i> Enregistrer "Nos Axes"
        </button>
        <a href="/axes" target="_blank"
          class="px-5 py-3 text-sm font-bold text-[#022c16] bg-[#022c16]/10 rounded-xl hover:bg-[#022c16]/20 transition-colors flex items-center gap-2">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Voir la page publique
        </a>
      </div>
    </div>

    <!-- Success toast -->
    <div *ngIf="saved" class="fixed bottom-6 right-6 bg-[#022c16] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up z-50">
      <i class="fa-solid fa-circle-check text-xl"></i>
      <div>
        <p class="font-black text-sm">Contenu enregistré !</p>
        <p class="text-xs text-white/70">La mise à jour sera visible sur le site public.</p>
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
    presidentPhoto: 'assets/media_1787574641552.jpg',
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
    const content = section === 'mouvement' ? this.mouvement : this.axes;
    this.adminData.saveEditorial(section, content).subscribe({
      next: () => {
        this.saved = true;
        setTimeout(() => this.saved = false, 3500);
      },
      error: () => alert("Erreur de sauvegarde")
    });
  }
}
