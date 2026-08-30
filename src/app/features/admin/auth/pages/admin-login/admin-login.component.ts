import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../core/services/auth.service';
import { AdminDataService } from '../../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html'
})
export class AdminLoginComponent {
  email = '';
  password = '';
  showPassword = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private adminData: AdminDataService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        // Précharger toutes les données en arrière-plan pour que le dashboard soit instantané
        this.prefetchAllData();
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Erreur de connexion';
      }
    });
  }

  private async prefetchAllData() {
    // Appels séquentiels pour ne pas saturer le pool de connexions (Prisma/Neon)
    const requests = [
      this.adminData.getAdherents(),
      this.adminData.getBesoins(),
      this.adminData.getIdees(),
      this.adminData.getMessages(),
      this.adminData.getCommissions(),
      this.adminData.getSondages(),
      this.adminData.getActivites(),
      this.adminData.getComptesRendus(),
      this.adminData.getSettings(),
    ];
    
    for (const req$ of requests) {
      await new Promise<void>(resolve => {
        req$.subscribe({ 
          next: () => resolve(),
          error: () => resolve() 
        });
      });
    }
  }
}
