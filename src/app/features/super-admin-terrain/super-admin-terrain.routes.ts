import { Routes } from '@angular/router';
import { SuperAdminTerrainLayoutComponent } from './layouts/super-admin-terrain-layout/super-admin-terrain-layout.component';
import { SuperAdminTerrainLoginComponent } from './pages/login/super-admin-terrain-login.component';
import { SuperAdminTerrainAgentsComponent } from './pages/agents/super-admin-terrain-agents.component';
import { SuperAdminTerrainAdherentsComponent } from './pages/adherents/super-admin-terrain-adherents.component';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

const satAuthGuard = () => {
  const token = localStorage.getItem('sat_token');
  if (!token) {
    inject(Router).navigate(['/super_admin_terrain/login']);
    return false;
  }
  return true;
};

export const SUPER_ADMIN_TERRAIN_ROUTES: Routes = [
  { path: 'login', component: SuperAdminTerrainLoginComponent },
  {
    path: '',
    component: SuperAdminTerrainLayoutComponent,
    canActivate: [satAuthGuard],
    children: [
      { path: '', redirectTo: 'adherents', pathMatch: 'full' },
      { path: 'adherents', component: SuperAdminTerrainAdherentsComponent },
      { path: 'agents', component: SuperAdminTerrainAgentsComponent },
    ]
  }
];
