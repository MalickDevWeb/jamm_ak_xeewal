import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicDataService } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-proposer-idee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [PublicDataService],
  templateUrl: './proposer-idee.component.html',
  styleUrl: './proposer-idee.component.css'
})
export class ProposerIdeeComponent {
  formData = {
    titre: '',
    axe_concerne: 'Éducation et formation',
    description: '',
    nom_citoyen: 'Anonyme',
    telephone_citoyen: ''
  };

  isSubmitting = false;
  success = false;
  errorMsg = '';

  constructor(private publicData: PublicDataService) {}

  showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 5000);
  }

  onSubmit() {
    if (!this.formData.titre || !this.formData.description) {
      this.showError("Veuillez remplir le titre et la description.");
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
    this.errorMsg = '';
    this.publicData.postIdee(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = true;
      },
      error: () => {
        this.isSubmitting = false;
        this.showError("Erreur lors de l'envoi de la proposition.");
      }
    });
  }

  resetForm() {
    this.success = false;
    this.errorMsg = '';
    this.formData = { titre: '', axe_concerne: 'Éducation et formation', description: '', nom_citoyen: 'Anonyme', telephone_citoyen: '' };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
