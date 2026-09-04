import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { ApplicationConfig, ErrorHandler } from '@angular/core';
import { provideRouter, Router, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import * as Sentry from '@sentry/angular';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),

    // Intercepter toutes les erreurs Angular et les envoyer a Sentry
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false,
        logErrors: !environment.production,
      }),
    },

    // Tracing pour performance monitoring
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
  ],
};
