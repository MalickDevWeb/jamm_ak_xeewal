import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/pages/home/home.component';
import { MouvementComponent } from './features/public/pages/mouvement/mouvement.component';
import { AxesComponent } from './features/public/pages/axes/axes.component';
import { ContactComponent } from './features/public/pages/contact/contact.component';

import { AdhererComponent } from './features/engagement/pages/adherer/adherer.component';
import { ProposerIdeeComponent } from './features/engagement/pages/proposer-idee/proposer-idee.component';
import { DeclarerBesoinComponent } from './features/engagement/pages/declarer-besoin/declarer-besoin.component';
import { SondageComponent } from './features/engagement/pages/sondage/sondage.component';
import { CommissionsComponent } from './features/engagement/pages/commissions/commissions.component';

import { ActivitesComponent } from './features/media/pages/activites/activites.component';
import { GalerieComponent } from './features/media/pages/galerie/galerie.component';
import { CompteRenduComponent } from './features/media/pages/compte-rendu/compte-rendu.component';

// === ADMIN ===
import { AdminLoginComponent } from './features/admin/auth/pages/admin-login/admin-login.component';
import { AdminDashboardComponent } from './features/admin/dashboard/pages/admin-dashboard/admin-dashboard.component';
import { AdminAdherentsComponent } from './features/admin/adherents/pages/admin-adherents.component';
import { AdminBesoinsComponent } from './features/admin/besoins/pages/admin-besoins.component';
import { AdminIdeesComponent } from './features/admin/idees/pages/admin-idees.component';
import { AdminMessagesComponent } from './features/admin/messages/pages/admin-messages.component';
import { AdminCommissionsComponent } from './features/admin/commissions/pages/admin-commissions.component';
import { AdminSondagesComponent } from './features/admin/sondages/pages/admin-sondages.component';
import { AdminSettingsComponent } from './features/admin/settings/pages/admin-settings.component';
import { AdminPlaceholderComponent } from './features/admin/shared/components/admin-placeholder/admin-placeholder.component';
import { AdminEditorialComponent } from './features/admin/editorial/pages/admin-editorial.component';
import { AdminActivitesComponent } from './features/admin/activites/pages/admin-activites.component';
import { AdminComptesRendusComponent } from './features/admin/comptes-rendus/pages/admin-comptes-rendus.component';

// === LAYOUTS ===
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminAuthLayoutComponent } from './layouts/admin-auth-layout/admin-auth-layout.component';
import { AdminDashboardLayoutComponent } from './layouts/admin-dashboard-layout/admin-dashboard-layout.component';

export const routes: Routes = [
  // --- Admin Login ---
  {
    path: 'admin/login',
    component: AdminAuthLayoutComponent,
    children: [{ path: '', component: AdminLoginComponent }]
  },
  // --- Admin Back-office (toutes les routes opérationnelles) ---
  {
    path: 'admin',
    component: AdminDashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'adherents', component: AdminAdherentsComponent },
      { path: 'besoins', component: AdminBesoinsComponent },
      { path: 'idees', component: AdminIdeesComponent },
      { path: 'messages', component: AdminMessagesComponent },
      { path: 'commissions', component: AdminCommissionsComponent },
      { path: 'sondages', component: AdminSondagesComponent },
      { path: 'settings', component: AdminSettingsComponent },
      { path: 'editorial', component: AdminEditorialComponent },
      { path: 'activites', component: AdminActivitesComponent },
      { path: 'comptes-rendus', component: AdminComptesRendusComponent }
    ]
  },
  // --- Site Public ---
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'mouvement', component: MouvementComponent },
      { path: 'axes', component: AxesComponent },
      { path: 'activites', component: ActivitesComponent },
      { path: 'declarer-besoin', component: DeclarerBesoinComponent },
      { path: 'adherer', component: AdhererComponent },
      { path: 'proposer-idee', component: ProposerIdeeComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'galerie', component: GalerieComponent },
      { path: 'sondage', component: SondageComponent },
      { path: 'commissions', component: CommissionsComponent },
      { path: 'compte-rendu', component: CompteRenduComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
