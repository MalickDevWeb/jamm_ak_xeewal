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

  constructor(private publicData: PublicDataService) {}

  onSubmit() {
    if (!this.formData.titre || !this.formData.description) {
      alert("Veuillez remplir le titre et la description.");
      return;
    }

    const payload = {
      titre: this.formData.titre,
      description: this.formData.description,
      categorie: this.formData.axe_concerne,
      auteur: this.formData.nom_citizen,
      pole: this.formData.axe_concerne
    };

    this.isSubmitting = true;
    this.publicData.postIdee(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = true;
      },
      error: () => {
        this.isSubmitting = false;
        alert("Erreur lors de l'envoi de la proposition.");
      }
    });
  }
}
