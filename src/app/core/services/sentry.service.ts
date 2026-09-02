import { Injectable, ErrorHandler } from '@angular/core';
import * as Sentry from '@sentry/angular';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SentryService {
  static init(): void {
    if (!environment.sentryDsn) {
      console.info('[Sentry] DSN non configure, monitoring desactive');
      return;
    }

    Sentry.init({
      dsn: environment.sentryDsn,
      environment: environment.production ? 'production' : 'development',
      release: 'jamm-angular@' + (environment.version || '1.0.0'),

      // Sentry v8 integre automatiquement BrowserTracing via les integrations
      // Pas besoin d'importer @sentry/tracing separement
      tracesSampleRate: environment.production ? 0.2 : 1.0,

      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        'NetworkError when attempting to fetch resource',
      ],

      enabled: environment.production,

      beforeSend(event: any): any {
        if (event.request) {
          if (event.request.cookies) delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers['authorization'];
            delete event.request.headers['Authorization'];
          }
        }
        return event;
      },
    });

    console.info('[Sentry] Initialise pour environnement:', environment.production ? 'production' : 'development');
  }

  static setUser(user: { id: string; email: string; role: string } | null): void {
    if (!environment.sentryDsn) return;
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    } else {
      Sentry.setUser(null);
    }
  }

  static captureException(error: any, context?: Record<string, any>): void {
    if (!environment.sentryDsn) return;
    Sentry.captureException(error, { extra: context });
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!environment.sentryDsn) return;
    Sentry.captureMessage(message, level);
  }

  static setContext(key: string, context: Record<string, any>): void {
    if (!environment.sentryDsn) return;
    Sentry.setContext(key, context);
  }
}
