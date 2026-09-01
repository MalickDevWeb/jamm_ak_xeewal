import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PublicDataService } from '../../../../core/services/public-data.service';

interface Pole {
  id: number;
  titre: string;
  soustitre: string;
  icon: string;
  color: string;
  actions: string[];
}

@Component({
  selector: 'app-axes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './axes.component.html',
  styleUrl: './axes.component.css'
})
export class AxesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  content: any = null;

  poles: Pole[] = [
    {
      id: 1,
      titre: 'Développement Humain & Inclusion Sociale',
      soustitre: "Garantir l'épanouissement, la santé et l'équité pour chaque citoyen de Thiès-Nord.",
      icon: 'fa-solid fa-users',
      color: 'emerald',
      actions: [
        'Éducation, formation de base et accompagnement pédagogique',
        'Action sociale, prévention santé et soutien aux personnes vulnérables',
        'Autonomisation économique et leadership des femmes',
        'Culture, sport et renforcement de la cohésion intergénérationnelle'
      ]
    },
    {
      id: 2,
      titre: 'Économie, Emploi & Innovation Numérique',
      soustitre: 'Transformer le potentiel de notre jeunesse et de notre territoire en opportunités réelles.',
      icon: 'fa-solid fa-rocket',
      color: 'blue',
      actions: [
        "Accompagnement à l'entrepreneuriat et insertion professionnelle",
        "Formation aux métiers du numérique et de l'intelligence artificielle",
        'Digitalisation des initiatives et création de solutions locales',
        'Incubation de projets et mise en réseau des compétences'
      ]
    },
    {
      id: 3,
      titre: 'Cadre de vie, Environnement & Sécurité',
      soustitre: 'Bâtir un environnement propre, sûr, durable et apaisé pour tous nos quartiers.',
      icon: 'fa-solid fa-leaf',
      color: 'teal',
      actions: [
        "Campagnes d'assainissement et gestion participative des déchets",
        'Protection des espaces publics, aménagement et reboisement',
        'Comités de vigilance citoyenne et éclairage public sécuritaire',
        'Prévention et dialogue pour assurer la tranquillité publique'
      ]
    }
  ];

  constructor(
    private publicData: PublicDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.publicData.getPoles().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res.success && res.data && res.data.length > 0) {
          const publishedPoles = res.data.filter((p: any) => p.statut === 'PUBLIE');
          if (publishedPoles.length > 0) {
            this.poles = publishedPoles.map((p: any, i: number) => ({
              id: p.id,
              titre: p.titre,
              soustitre: p.description,
              icon: this.getIconForIndex(i),
              color: this.getColorForIndex(i),
              actions: p.objectifs ? p.objectifs.split('\n').map((a: string) => a.trim()).filter((a: string) => a) : []
            }));
            this.cdr.markForCheck();
            return; // Don't load from editorial if we have dynamic poles
          }
        }
        
        // Fallback to editorial or keep hardcoded if API fails/empty
        this.loadEditorialPoles();
      },
      error: () => this.loadEditorialPoles()
    });
  }

  private loadEditorialPoles() {
    this.publicData.getEditorial('axes').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.content = res.data;
          if (res.data.poles && Array.isArray(res.data.poles)) {
            this.poles = res.data.poles.map((p: any, i: number) => ({
              id: i + 1,
              titre: p.titre,
              soustitre: p.soustitre,
              icon: this.getIconForIndex(i),
              color: this.getColorForIndex(i),
              actions: p.actions ? p.actions.split('\n') : []
            }));
          }
          this.cdr.markForCheck();
        }
      }
    });
  }

  private getIconForIndex(index: number): string {
    const icons = ['fa-solid fa-users', 'fa-solid fa-rocket', 'fa-solid fa-leaf'];
    return icons[index] || 'fa-solid fa-star';
  }

  private getColorForIndex(index: number): string {
    const colors = ['emerald', 'blue', 'teal'];
    return colors[index] || 'slate';
  }

  trackByPole(index: number, item: Pole): any {
    return item.id;
  }

  trackByAction(index: number, item: string): string {
    return item;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
