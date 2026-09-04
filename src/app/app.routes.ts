import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// === LAYOUTS ===
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminAuthLayoutComponent } from './layouts/admin-auth-layout/admin-auth-layout.component';
import { AdminDashboardLayoutComponent } from './layouts/admin-dashboard-layout/admin-dashboard-layout.component';
import { TerrainLayoutComponent } from './layouts/terrain-layout/terrain-layout.component';
import { terrainGuard } from './core/guards/terrain.guard';

export const routes: Routes = [
  // --- Admin Login ---
  {
    path: 'admin/login',
    component: AdminAuthLayoutComponent,
    children: [{ 
      path: '', 
      loadComponent: () => import('./features/admin/auth/pages/admin-login/admin-login.component')
        .then(m => m.AdminLoginComponent)
    }]
  },
  // --- Admin Back-office (lazy loaded) ---
  {
    path: 'admin',
    component: AdminDashboardLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/admin/dashboard/pages/admin-dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent)
      },
      { 
        path: 'adherents', 
        loadComponent: () => import('./features/admin/adherents/pages/admin-adherents.component')
          .then(m => m.AdminadherentsComponent)
      },
      { 
        path: 'besoins', 
        loadComponent: () => import('./features/admin/besoins/pages/admin-besoins.component')
          .then(m => m.AdminbesoinsComponent)
      },
      { 
        path: 'idees', 
        loadComponent: () => import('./features/admin/idees/pages/admin-idees.component')
          .then(m => m.AdminideesComponent)
      },
      { 
        path: 'messages', 
        loadComponent: () => import('./features/admin/messages/pages/admin-messages.component')
          .then(m => m.AdminmessagesComponent)
      },
      { 
        path: 'commissions', 
        loadComponent: () => import('./features/admin/commissions/pages/admin-commissions.component')
          .then(m => m.AdmincommissionsComponent)
      },
      { 
        path: 'sondages', 
        loadComponent: () => import('./features/admin/sondages/pages/admin-sondages.component')
          .then(m => m.AdminsondagesComponent)
      },
      { 
        path: 'settings', 
        loadComponent: () => import('./features/admin/settings/pages/admin-settings.component')
          .then(m => m.AdminSettingsComponent)
      },
      { 
        path: 'options', 
        loadComponent: () => import('./features/admin/options/pages/admin-options.component')
          .then(m => m.AdminOptionsComponent)
      },
      { 
        path: 'editorial', 
        loadComponent: () => import('./features/admin/editorial/pages/admin-editorial.component')
          .then(m => m.AdminEditorialComponent)
      },
      { 
        path: 'activites', 
        loadComponent: () => import('./features/admin/activites/pages/admin-activites.component')
          .then(m => m.AdminactivitesComponent)
      },
      { 
        path: 'comptes-rendus', 
        loadComponent: () => import('./features/admin/comptes-rendus/pages/admin-comptes-rendus.component')
          .then(m => m.AdminComptesRendusComponent)
      },
      { 
        path: 'evenements', 
        loadComponent: () => import('./features/admin/evenements/pages/admin-evenements.component')
          .then(m => m.AdminEvenementsComponent)
      },
      { 
        path: 'notifications', 
        loadComponent: () => import('./features/admin/notifications/pages/admin-notifications.component')
          .then(m => m.AdminNotificationsComponent)
      },
      { 
        path: 'poles', 
        loadComponent: () => import('./features/admin/poles/pages/admin-poles.component')
          .then(m => m.AdminPolesComponent)
      },
      { 
        path: 'agents-terrain', 
        loadComponent: () => import('./features/admin/agents-terrain/pages/admin-agents-terrain.component')
          .then(m => m.AdminAgentsTerrainComponent)
      }
    ]
  },
  // --- Site Public (lazy loaded) ---
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { 
        path: '', 
        loadComponent: () => import('./features/public/pages/home/home.component')
          .then(m => m.HomeComponent)
      },
      { 
        path: 'mouvement', 
        loadComponent: () => import('./features/public/pages/mouvement/mouvement.component')
          .then(m => m.MouvementComponent)
      },
      { 
        path: 'axes', 
        loadComponent: () => import('./features/public/pages/axes/axes.component')
          .then(m => m.AxesComponent)
      },
      { 
        path: 'activites', 
        loadComponent: () => import('./features/media/pages/activites/activites.component')
          .then(m => m.ActivitesComponent)
      },
      { 
        path: 'declarer-besoin', 
        loadComponent: () => import('./features/engagement/pages/declarer-besoin/declarer-besoin.component')
          .then(m => m.DeclarerBesoinComponent)
      },
      { 
        path: 'adherer', 
        loadComponent: () => import('./features/engagement/pages/adherer/adherer.component')
          .then(m => m.AdhererComponent)
      },
      { 
        path: 'proposer-idee', 
        loadComponent: () => import('./features/engagement/pages/proposer-idee/proposer-idee.component')
          .then(m => m.ProposerIdeeComponent)
      },
      { 
        path: 'contact', 
        loadComponent: () => import('./features/public/pages/contact/contact.component')
          .then(m => m.ContactComponent)
      },
      { 
        path: 'galerie', 
        loadComponent: () => import('./features/media/pages/galerie/galerie.component')
          .then(m => m.GalerieComponent)
      },
      { 
        path: 'sondage', 
        loadComponent: () => import('./features/engagement/pages/sondage/sondage.component')
          .then(m => m.SondageComponent)
      },
      { 
        path: 'commissions', 
        loadComponent: () => import('./features/engagement/pages/commissions/commissions.component')
          .then(m => m.CommissionsComponent)
      },
      { 
        path: 'compte-rendu', 
        loadComponent: () => import('./features/media/pages/compte-rendu/compte-rendu.component')
          .then(m => m.CompteRenduComponent)
      },
      { 
        path: 'maintenance', 
        loadComponent: () => import('./features/public/pages/maintenance/maintenance.component')
          .then(m => m.MaintenanceComponent)
      }
    ]
  },
  // --- Public Standalone Pages (No Navbar/Footer) ---
  {
    path: 'membre/:id',
    loadComponent: () => import('./features/public/pages/membre-verification/membre-verification.component')
      .then(m => m.MembreVerificationComponent)
  },
  // --- Terrain (Agents Terrain) ---
  {
    path: 'terrain/login',
    loadComponent: () => import('./features/terrain/auth/pages/terrain-login/terrain-login.component')
      .then(m => m.TerrainLoginComponent)
  },
  {
    path: 'terrain',
    component: TerrainLayoutComponent,
    canActivate: [terrainGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/terrain/adhesion/pages/terrain-adhesion/terrain-adhesion.component')
          .then(m => m.TerrainAdhesionComponent)
      }
    ]
  },
  // --- Super Admin Terrain ---
  {
    path: 'super_admin_terrain',
    loadChildren: () => import('./features/super-admin-terrain/super-admin-terrain.routes').then(m => m.SUPER_ADMIN_TERRAIN_ROUTES)
  },
  // --- Super Admin Maintenance System ---
  {
    path: 'maintenance_sat',
    loadComponent: () => import('./features/admin/maintenance/pages/maintenance-sat.component')
      .then(m => m.MaintenanceSatComponent)
  },
  // --- Fallback (404) ---
  {
    path: '**',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/pages/not-found/not-found.component')
          .then(m => m.NotFoundComponent)
      }
    ]
  }
];
