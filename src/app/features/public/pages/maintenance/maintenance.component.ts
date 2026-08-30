import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { gsap } from 'gsap';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#022c16] flex flex-col items-center justify-center p-6 text-center font-sans overflow-hidden relative" #container>
      <!-- Premium Animated Background Grid -->
      <div class="absolute inset-0 z-0 opacity-20">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
      </div>
      
      <!-- Animated Orbs -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div #orb1 class="absolute -top-32 -right-32 w-[600px] h-[600px] bg-[#008d36]/20 rounded-full blur-[120px]"></div>
        <div #orb2 class="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-[#ffb000]/15 rounded-full blur-[120px]"></div>
        <div #orb3 class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#022c16] rounded-full blur-[100px] opacity-80 z-[-1]"></div>
      </div>

      <!-- Main Content Card -->
      <div #mainCard class="relative z-10 max-w-2xl w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-10 md:p-16 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
        
        <!-- Animated Icon Container -->
        <div #iconContainer class="relative w-32 h-32 mx-auto mb-10">
          <div #gear1 class="absolute top-0 right-0 text-[#ffb000] opacity-80" style="font-size: 2rem;">
            <i class="fa-solid fa-gear"></i>
          </div>
          <div #gear2 class="absolute bottom-2 left-2 text-[#008d36] opacity-80" style="font-size: 1.5rem;">
            <i class="fa-solid fa-gear"></i>
          </div>
          <div class="w-24 h-24 bg-gradient-to-br from-[#008d36]/30 to-[#022c16]/80 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-white/10 relative z-10 transform rotate-3">
            <i #mainIcon class="fa-solid fa-screwdriver-wrench text-5xl text-white drop-shadow-md"></i>
          </div>
        </div>
        
        <div class="inline-block mb-4 px-4 py-1.5 rounded-full bg-[#ffb000]/10 border border-[#ffb000]/20 text-[#ffb000] text-xs font-black tracking-[0.2em] uppercase" #badge>
          Mise à jour du système
        </div>
        
        <h1 #title class="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
          De retour <br/> <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ffb000] to-yellow-200">très bientôt !</span>
        </h1>
        
        <p #text class="text-lg text-gray-300 mb-10 max-w-lg mx-auto leading-relaxed font-medium">
          La plateforme <strong class="text-white">JÀMM AK XÉEWAL</strong> se refait une beauté pour vous offrir une expérience encore plus performante. Merci de votre patience.
        </p>
        
        <button #btn (click)="checkStatus()" [disabled]="isChecking" class="group relative px-8 py-4 bg-white text-[#022c16] font-black rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.25)] hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-3 mx-auto overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-white via-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <i [class]="isChecking ? 'fa-solid fa-spinner fa-spin text-xl relative z-10' : 'fa-solid fa-rotate-right text-xl relative z-10'"></i>
          <span class="relative z-10 tracking-wide uppercase text-sm">{{ isChecking ? 'Vérification...' : 'Actualiser la page' }}</span>
        </button>
      </div>
      
      <!-- Footer Info -->
      <div #footer class="absolute bottom-8 left-0 right-0 text-center z-10 flex flex-col items-center gap-2">
        <div class="flex gap-1.5">
          <div class="w-2 h-2 rounded-full bg-[#ffb000] animate-bounce" style="animation-delay: 0s;"></div>
          <div class="w-2 h-2 rounded-full bg-[#ffb000] animate-bounce" style="animation-delay: 0.2s;"></div>
          <div class="w-2 h-2 rounded-full bg-[#ffb000] animate-bounce" style="animation-delay: 0.4s;"></div>
        </div>
        <p class="text-xs text-gray-400 font-medium tracking-widest uppercase">&copy; {{ currentYear }} JÀMM AK XÉEWAL</p>
      </div>
    </div>
  `
})
export class MaintenanceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('mainCard') mainCard!: ElementRef;
  @ViewChild('iconContainer') iconContainer!: ElementRef;
  @ViewChild('gear1') gear1!: ElementRef;
  @ViewChild('gear2') gear2!: ElementRef;
  @ViewChild('mainIcon') mainIcon!: ElementRef;
  @ViewChild('badge') badge!: ElementRef;
  @ViewChild('title') title!: ElementRef;
  @ViewChild('text') text!: ElementRef;
  @ViewChild('btn') btn!: ElementRef;
  @ViewChild('footer') footer!: ElementRef;
  @ViewChild('orb1') orb1!: ElementRef;
  @ViewChild('orb2') orb2!: ElementRef;

  isChecking = false;
  currentYear = new Date().getFullYear();
  private ctx!: gsap.Context;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // Initialize GSAP context for easy cleanup
    this.ctx = gsap.context(() => {
      
      // Master Timeline for entry animation
      const tl = gsap.timeline();

      // Initial states
      gsap.set([this.mainCard.nativeElement, this.footer.nativeElement], { opacity: 0 });
      gsap.set(this.mainCard.nativeElement, { y: 100, scale: 0.95 });
      gsap.set([this.badge.nativeElement, this.title.nativeElement, this.text.nativeElement, this.btn.nativeElement], { opacity: 0, y: 30 });
      gsap.set(this.iconContainer.nativeElement, { scale: 0, rotation: -45 });
      gsap.set([this.orb1.nativeElement, this.orb2.nativeElement], { scale: 0.5, opacity: 0 });

      // Entry animations
      tl.to([this.orb1.nativeElement, this.orb2.nativeElement], {
        scale: 1,
        opacity: 1,
        duration: 2,
        ease: "power2.out",
        stagger: 0.2
      })
      .to(this.mainCard.nativeElement, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: "expo.out"
      }, "-=1.5")
      .to(this.iconContainer.nativeElement, {
        scale: 1,
        rotation: 0,
        duration: 1,
        ease: "elastic.out(1, 0.5)"
      }, "-=0.8")
      .to([this.badge.nativeElement, this.title.nativeElement, this.text.nativeElement, this.btn.nativeElement], {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.15
      }, "-=0.6")
      .to(this.footer.nativeElement, {
        opacity: 1,
        duration: 1,
        ease: "power2.out"
      }, "-=0.2");

      // Continuous floating animations (Orbs)
      gsap.to(this.orb1.nativeElement, {
        x: 100,
        y: 50,
        duration: 10,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });
      gsap.to(this.orb2.nativeElement, {
        x: -80,
        y: -60,
        duration: 8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

      // Continuous gear spinning
      gsap.to(this.gear1.nativeElement, {
        rotation: 360,
        duration: 8,
        ease: "none",
        repeat: -1
      });
      gsap.to(this.gear2.nativeElement, {
        rotation: -360,
        duration: 6,
        ease: "none",
        repeat: -1
      });

      // Floating wrench
      gsap.to(this.mainIcon.nativeElement, {
        y: -10,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

    });
  }

  ngOnDestroy() {
    if (this.ctx) {
      this.ctx.revert(); // Clean up GSAP animations
    }
  }

  checkStatus() {
    this.isChecking = true;
    
    // Quick button squeeze animation
    gsap.to(this.btn.nativeElement, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });

    this.http.get<any>(`${environment.apiUrl}/settings`).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data['MAINTENANCE_MODE'] !== 'true') {
          // Animate out before leaving
          const tlOut = gsap.timeline({
            onComplete: () => {
              this.router.navigate(['/']);
            }
          });
          
          tlOut.to(this.mainCard.nativeElement, {
            scale: 1.1,
            opacity: 0,
            duration: 0.6,
            ease: "power3.in"
          });
        } else {
          // Still in maintenance, shake the card slightly to give feedback
          setTimeout(() => {
            this.isChecking = false;
            gsap.fromTo(this.mainCard.nativeElement, 
              { x: -10 },
              { x: 10, duration: 0.1, yoyo: true, repeat: 3, ease: "power1.inOut", onComplete: () => {
                gsap.set(this.mainCard.nativeElement, { x: 0 });
              }}
            );
          }, 800);
        }
      },
      error: () => {
        setTimeout(() => {
          this.isChecking = false;
        }, 800);
      }
    });
  }
}
