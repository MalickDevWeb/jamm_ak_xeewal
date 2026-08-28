import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PublicDataService } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-declarer-besoin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  providers: [PublicDataService],
  templateUrl: './declarer-besoin.component.html',
  styleUrl: './declarer-besoin.component.css'
})
export class DeclarerBesoinComponent {
  formData = {
    titre: '',
    description: '',
    quartier: '',
    urgence: 'Moyenne',
    nom_citoyen: '',
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
    if (!this.formData.description || !this.formData.quartier || !this.formData.telephone_citoyen) {
      this.showError("Veuillez remplir les champs obligatoires (Description, Quartier et Téléphone).");
      return;
    }

    // Mémoriser le nom pour le backend s'il est fourni
    const contactInfo = this.formData.nom_citoyen 
      ? `${this.formData.nom_citoyen} - ${this.formData.telephone_citoyen}` 
      : this.formData.telephone_citoyen;

    const payload = {
      description: this.formData.description,
      quartier: this.formData.quartier,
      contact: contactInfo,
      urgence: this.formData.urgence.toUpperCase()
    };

    this.isSubmitting = true;
    this.errorMsg = '';
    
    this.publicData.postBesoin(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = true;
      },
      error: () => {
        this.isSubmitting = false;
        this.showError("Une erreur est survenue lors de l'envoi de votre signalement. Veuillez réessayer.");
      }
    });
  }
}
