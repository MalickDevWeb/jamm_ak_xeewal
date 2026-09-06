import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaymentProviderConfig {
  id?: string;
  provider: string; // 'WAVE' | 'ORANGE_MONEY' | 'MANUAL'
  enabled: boolean;
  mode: 'SANDBOX' | 'PRODUCTION';
  credentialsEncrypted?: string;
  webhookSecretEncrypted?: string;
  lastTestedAt?: string;
  lastTestStatus?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceConfigService {
  private http = inject(HttpClient);
  // Pour le MVP, on simule un organizationId fixe 'DEFAULT_ORG'
  private organizationId = 'DEFAULT_ORG';

  getConfigs(): Observable<PaymentProviderConfig[]> {
    return this.http.get<PaymentProviderConfig[]>(
      `${environment.apiUrl}/payment-providers/config?organizationId=${this.organizationId}`
    );
  }

  saveConfig(config: PaymentProviderConfig): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/payment-providers/config`,
      { ...config, organizationId: this.organizationId }
    );
  }
}
