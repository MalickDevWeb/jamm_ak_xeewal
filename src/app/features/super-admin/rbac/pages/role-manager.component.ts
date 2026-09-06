import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-role-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Gestion des Profils & Modules</h2>
          <p class="text-gray-500 text-sm mt-1">Gérez l'activation des modules et configurez les droits d'accès des différents profils.</p>
        </div>
      </div>

      <!-- Modules List -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900">Modules de l'Organisation</h3>
          <button (click)="loadModules()" class="text-sm font-medium text-[#022c16] hover:underline">Rafraîchir</button>
        </div>
        
        <div class="p-6">
          <div *ngIf="loadingModules" class="text-center py-8 text-gray-500">Chargement des modules...</div>
          
          <div *ngIf="!loadingModules" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let mod of modules" 
                 class="border rounded-xl p-4 flex flex-col items-start gap-4 transition-colors"
                 [class.border-[#022c16]]="mod.enabled"
                 [class.bg-[#f6fcf8]]="mod.enabled"
                 [class.border-gray-200]="!mod.enabled">
              
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                       [class.bg-[#022c16]]="mod.enabled" [class.text-white]="mod.enabled"
                       [class.bg-gray-100]="!mod.enabled" [class.text-gray-400]="!mod.enabled">
                    <i [class]="'fa-solid ' + mod.icon"></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-gray-900 leading-tight">{{ mod.name }}</h4>
                    <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                          [class.bg-gray-200]="mod.isSystem" [class.text-gray-600]="mod.isSystem"
                          [class.bg-blue-100]="!mod.isSystem" [class.text-blue-700]="!mod.isSystem">
                      {{ mod.isSystem ? 'Système' : 'Optionnel' }}
                    </span>
                  </div>
                </div>
                
                <!-- Toggle Switch -->
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer" [checked]="mod.enabled" (change)="toggleModule(mod)" [disabled]="mod.isSystem">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#022c16]"
                       [class.opacity-50]="mod.isSystem"></div>
                </label>
              </div>
              
              <p class="text-sm text-gray-500">{{ mod.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RoleManagerComponent implements OnInit {
  modules: any[] = [];
  loadingModules = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadModules();
  }

  loadModules() {
    this.loadingModules = true;
    this.http.get<any>(`${environment.apiUrl}/rbac/modules`).subscribe({
      next: (res) => {
        if (res.success) {
          this.modules = res.data;
        }
        this.loadingModules = false;
      },
      error: () => {
        this.loadingModules = false;
      }
    });
  }

  toggleModule(mod: any) {
    if (mod.isSystem) return; // Cannot toggle system modules
    
    const newState = !mod.enabled;
    this.http.post<any>(`${environment.apiUrl}/rbac/modules`, {
      moduleId: mod.id,
      enabled: newState
    }).subscribe({
      next: (res) => {
        if (res.success) {
          mod.enabled = newState;
        }
      },
      error: (err) => {
        console.error('Error toggling module', err);
        // Revert UI change
      }
    });
  }
}
