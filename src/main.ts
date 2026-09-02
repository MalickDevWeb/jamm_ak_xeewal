import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { SentryService } from './app/core/services/sentry.service';

// Initialiser Sentry AVANT le bootstrap Angular
// (capture les erreurs pendant le bootstrap)
SentryService.init();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    // En cas d'echec du bootstrap, on log ET on envoie a Sentry
    console.error(err);
    SentryService.captureException(err, { context: 'bootstrap' });
  });
