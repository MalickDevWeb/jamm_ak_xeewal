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

  constructor(private publicData: PublicDataService) {}

  onSubmit() {
    if (!this.formData.description || !this.formData.quartier || !this.formData.telephone_citoyen) {
      alert("Veuillez remplir la description, le quartier et le téléphone.");
      return;
    }

    const payload = {
      description: this.formData.description,
      quartier: this.formData.quartier,
      contact: this.formData.telephone_citoyen,
      urgence: this.formData.urgence.toUpperCase()
    };

    this.isSubmitting = true;
    this.publicData.postBesoin(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = true;
      },
      error: () => {
        this.isSubmitting = false;
        alert("Erreur lors de l'envoi.");
      }
    });
  }
}
