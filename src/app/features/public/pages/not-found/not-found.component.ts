import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center relative overflow-hidden bg-white">
      
      <!-- Background Animated Elements -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-green/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div class="absolute top-1/3 right-1/4 w-64 h-64 bg-brand-yellow/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-8 left-1/3 w-64 h-64 bg-green-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div class="relative z-10 max-w-2xl px-6 py-12 text-center flex flex-col items-center">
        
        <!-- Big Animated Emoji & 404 -->
        <div class="relative mb-8 group">
          <!-- Oups Text behind -->
          <h1 class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[150px] md:text-[250px] font-black text-gray-50/80 -z-10 select-none">404</h1>
          
          <!-- Bouncing Emoji -->
          <div class="w-40 h-40 md:w-56 md:h-56 animate-bounce-slow relative">
            <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-2xl text-brand-yellow filter hover:brightness-110 transition-all duration-300">
              <circle cx="50" cy="50" r="48" fill="currentColor" />
              <!-- Eyes (Smiling and happy) -->
              <path d="M 30 40 Q 35 30 40 40" stroke="#022c16" stroke-width="4" stroke-linecap="round" fill="none" class="animate-wink" />
              <path d="M 60 40 Q 65 30 70 40" stroke="#022c16" stroke-width="4" stroke-linecap="round" fill="none" />
              <!-- Cheeks -->
              <circle cx="25" cy="55" r="6" fill="#f87171" opacity="0.6" />
              <circle cx="75" cy="55" r="6" fill="#f87171" opacity="0.6" />
              <!-- Big Smile -->
              <path d="M 30 55 Q 50 85 70 55" stroke="#022c16" stroke-width="5" stroke-linecap="round" fill="none" />
              <!-- Tongue -->
              <path d="M 45 70 Q 50 85 55 70" fill="#f43f5e" />
            </svg>
            
            <!-- Sparkles -->
            <i class="fa-solid fa-sparkles absolute -top-4 -right-4 text-3xl text-brand-yellow animate-pulse"></i>
            <i class="fa-solid fa-star absolute -bottom-2 -left-4 text-xl text-brand-yellow animate-spin-slow"></i>
          </div>
        </div>

        <!-- Content -->
        <div class="space-y-4 animate-fade-in-up">
          <h2 class="text-3xl md:text-5xl font-black text-brand-dark tracking-tight">
            Oups ! Vous vous êtes perdu ?
          </h2>
          <p class="text-gray-500 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
            Ne vous inquiétez pas, même les meilleurs explorateurs s'égarent parfois. La page que vous cherchez a peut-être déménagé !
          </p>
        </div>

        <!-- Action Button -->
        <div class="mt-10 animate-fade-in-up animation-delay-200">
          <a routerLink="/" class="relative inline-flex items-center justify-center gap-3 px-8 py-4 font-bold text-white transition-all duration-200 bg-brand-green border border-transparent rounded-full shadow-xl hover:bg-[#024c26] hover:shadow-2xl hover:-translate-y-1 group overflow-hidden">
            <span class="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
            <i class="fa-solid fa-house text-lg group-hover:scale-110 transition-transform"></i>
            <span class="relative text-lg">Retourner à la maison</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [\`
    @keyframes bounce-slow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
    @keyframes wink {
      0%, 45%, 55%, 100% { d: path('M 30 40 Q 35 30 40 40'); }
      50% { d: path('M 30 40 Q 35 45 40 40'); }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-bounce-slow {
      animation: bounce-slow 3s ease-in-out infinite;
    }
    .animate-wink {
      animation: wink 4s infinite;
    }
    .animate-spin-slow {
      animation: spin-slow 6s linear infinite;
    }
    .animation-delay-200 {
      animation-delay: 200ms;
    }
  \`]
})
export class NotFoundComponent {
}
