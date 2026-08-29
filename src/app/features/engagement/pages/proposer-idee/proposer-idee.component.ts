import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PublicDataService, Option } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-proposer-idee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './proposer-idee.component.html',
  styleUrl: './proposer-idee.component.css'
})
export class ProposerIdeeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  formData = {
    titre: '',
    axe_concerne: '',
    description: '',
    nom_citoyen: 'Anonyme',
    telephone_citoyen: ''
  };

  // Options dynamiques depuis la base de données
  axes: Option[] = [];

  isSubmitting = false;
  errorMsg = '';
  success = false;

  constructor(
    private publicData: PublicDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOptions();
  }

  private loadOptions() {
    // Charger les axes
    this.publicData.getOptions('axe').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.axes = res.data;
          if (this.axes.length > 0 && !this.formData.axe_concerne) {
            this.formData.axe_concerne = this.axes[0].value;
          }
          this.cdr.markForCheck();
        }
      }
    });
  }

  // TrackBy pour les options
  trackByOption(index: number, item: Option): string {
    return item.id;
  }

  onSubmit() {
    if (!this.formData.titre || !this.formData.description) {
      alert("Veuillez remplir le titre et la description.");
      return;
    }

    const payload = {
      titre: this.formData.titre,
      description: this.formData.description,
      categorie: this.formData.axe_concerne,
      auteur: this.formData.nom_citoyen,
      pole: this.formData.axe_concerne
    };

    this.isSubmitting = true;
    this.publicData.postIdee(payload).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMsg = "Erreur lors de l'envoi de la proposition.";
        setTimeout(() => this.errorMsg = '', 5000);
        this.cdr.markForCheck();
        this.cdr.markForCheck();
      }
    });
  }

  resetForm() {
    this!.success = false;
    const defaultAxe = this!.axes[0];
    this!.formData = { titre: '', axe_concerne: defaultAxe ? defaultAxe.value : '', description: '', nom_citoyen: 'Anonyme', telephone_citoyen: '' };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
