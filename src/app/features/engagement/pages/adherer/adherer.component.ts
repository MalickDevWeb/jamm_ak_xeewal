import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicDataService } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-adherer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  providers: [PublicDataService],
  templateUrl: './adherer.component.html',
  styleUrl: './adherer.component.css'
})
export class AdhererComponent {
  formData = {
    prenom: '',
    nom: '',
    telephone: '',
    quartier: '',
    motivation: '',
    pole: ''
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
    if (!this.formData.prenom || !this.formData.telephone || !this.formData.quartier) {
      this.showError("Veuillez remplir les champs obligatoires (Prénom et Nom, Téléphone, Quartier).");
      return;
    }

    this.isSubmitting = true;
    this.errorMsg = '';
    
    // Convertir prenom/nom
    const parts = this.formData.prenom.trim().split(' ');
    const nom = parts.length > 1 ? (parts.pop() || '') : '';
    const prenom = parts.join(' ') || this.formData.prenom;

    const payload = {
      prenom: prenom,
      nom: nom,
      telephone: this.formData.telephone,
      quartier: this.formData.quartier,
      competences: this.formData.motivation, // Stocké dans competences/motivation
      profession: this.formData.pole // Stocké ici par défaut
    };

    this.publicData.postAdherent(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = true;
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.status === 409) {
          this.showError("Ce numéro de téléphone est déjà enregistré. Veuillez utiliser un autre numéro.");
        } else {
          this.showError("Une erreur est survenue lors de l'envoi de votre adhésion. Veuillez réessayer.");
        }
      }
    });
  }
}
