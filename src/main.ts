import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
// (Sentry désactivé, aucune initialisation requise)

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    // En cas d'échec du bootstrap, on se contente d'afficher l'erreur
    console.error('Bootstrap error:', err);
  });
