import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicDataService } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [PublicDataService],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  formData = {
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
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
    if (!this.formData.nom || !this.formData.sujet || !this.formData.message) {
      this.showError("Veuillez remplir votre nom et votre message.");
      return;
    }

    this.isSubmitting = true;
    this.errorMsg = '';
    const payload = {
      nom: this.formData.nom,
      email: this.formData.email || this.formData.telephone || '',
      telephone: this.formData.telephone || '',
      sujet: this.formData.sujet || 'Contact depuis le site',
      contenu: this.formData.message
    };

    this.publicData.postMessage(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.success = true;
      },
      error: (err: any) => {
        this.isSubmitting = false;
        let friendlyError = "Une erreur est survenue lors de l'envoi de votre message.";
        if (err.status === 0) {
          friendlyError = "Impossible de joindre le serveur. Veuillez vérifier votre connexion internet.";
        } else if (err.error && err.error.message) {
          friendlyError = err.error.message;
        }
        this.showError(friendlyError);
      }
    });
  }

  resetForm() {
    this.success = false;
    this.errorMsg = '';
    this.formData = { nom: '', email: '', telephone: '', sujet: '', message: '' };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
