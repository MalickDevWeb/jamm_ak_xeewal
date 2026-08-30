import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-placeholder',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in-up bg-white/5 border border-white/10 p-12 rounded-3xl shadow-sm border border-white/10 text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
      
      <div class="relative z-10 flex flex-col items-center justify-center">
        <div class="w-24 h-24 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center text-4xl mb-6">
          <i class="fa-solid fa-person-digging"></i>
        </div>
        <h2 class="text-3xl font-black text-white mb-2 capitalize">{{ currentPath }}</h2>
        <p class="text-gray-400 max-w-md mx-auto mb-8">
          Ce module est en cours de développement. Il sera bientôt connecté au backend API (Next.js/Prisma) pour gérer ces données.
        </p>
        
        <button routerLink="/admin/dashboard" class="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
          <i class="fa-solid fa-arrow-left mr-2"></i> Retour au tableau de bord
        </button>
      </div>
    </div>
  `
})
export class AdminPlaceholderComponent {
  currentPath = '';
  
  constructor(private router: Router) {
    // Get the last segment of the url (e.g., 'adherents' from '/admin/adherents')
    const urlTree = this.router.parseUrl(this.router.url);
    const segments = urlTree.root.children['primary']?.segments;
    this.currentPath = segments ? segments[segments.length - 1].path : 'Module';
  }
}
