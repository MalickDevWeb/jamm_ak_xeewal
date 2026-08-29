import { Component, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('rectoInput') rectoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('versoInput') versoInput!: ElementRef<HTMLInputElement>;

  formData = {
    prenom: '',
    nom: '',
    telephone: '',
    quartier: '',
    motivation: '',
    pole: '',
    localite: ''
  };

  // Carte d'identité
  carteRectoBase64: string | null = null;
  carteVersoBase64: string | null = null;
  carteRectoName: string = '';
  carteVersoName: string = '';
  rectoError: string = '';
  versoError: string = '';
  
  isSubmitting = false;
  success = false;
  errorMsg = '';

  constructor(private publicData: PublicDataService) {}

  showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 5000);
  }

  triggerRectoUpload() {
    this.rectoInput.nativeElement.click();
  }

  triggerVersoUpload() {
    this.versoInput.nativeElement.click();
  }

  onRectoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.rectoError = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.rectoError = 'Veuillez sélectionner une image valide (JPG, PNG, etc.).';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.rectoError = 'L\'image ne doit pas dépasser 5 Mo.';
      return;
    }
    this.carteRectoName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.carteRectoBase64 = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onVersoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.versoError = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.versoError = 'Veuillez sélectionner une image valide (JPG, PNG, etc.).';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.versoError = 'L\'image ne doit pas dépasser 5 Mo.';
      return;
    }
    this.carteVersoName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.carteVersoBase64 = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeRecto() {
    this.carteRectoBase64 = null;
    this.carteRectoName = '';
    this.rectoError = '';
    if (this.rectoInput) this.rectoInput.nativeElement.value = '';
  }

  removeVerso() {
    this.carteVersoBase64 = null;
    this.carteVersoName = '';
    this.versoError = '';
    if (this.versoInput) this.versoInput.nativeElement.value = '';
  }

  onSubmit() {
    if (!this.formData.prenom || !this.formData.telephone || !this.formData.quartier) {
      this.showError("Veuillez remplir les champs obligatoires (Prénom et Nom, Téléphone, Quartier).");
      return;
    }
    if (!this.carteRectoBase64 || !this.carteVersoBase64) {
      this.showError("Veuillez télécharger les deux faces de votre carte d'identité (Recto et Verso).");
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
      competences: this.formData.motivation,
      profession: this.formData.pole,
      carteRectoUrl: this.carteRectoBase64,
      carteVersoUrl: this.carteVersoBase64
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

  resetForm() {
    this.success = false;
    this.errorMsg = '';
    this.formData = { prenom: '', nom: '', telephone: '', quartier: '', motivation: '', pole: '', localite: '' };
    this.removeRecto();
    this.removeVerso();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
