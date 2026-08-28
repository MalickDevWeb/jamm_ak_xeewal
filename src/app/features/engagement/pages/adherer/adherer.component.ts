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

  constructor(private publicData: PublicDataService) {}

  onSubmit() {
    if (!this.formData.prenom || !this.formData.telephone || !this.formData.quartier) {
      alert("Veuillez remplir les champs obligatoires (Nom, Téléphone, Quartier).");
      return;
    }

    this.isSubmitting = true;
    
    // Convertir prenom/nom
    const parts = this.formData.prenom.split(' ');
    const nom = parts.pop() || '';
    const prenom = parts.join(' ');

    const payload = {
      prenom: prenom || this.formData.prenom,
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
      error: () => {
        this.isSubmitting = false;
        alert("Une erreur est survenue.");
      }
    });
  }
}
