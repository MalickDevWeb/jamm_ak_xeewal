import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AdminDataService } from '../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-idees',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
  <div class="animate-fade-in-up">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-black text-gray-900">Boîte à Idées</h2>
        <p class="text-sm text-gray-500 mt-1">{{ total }} idées proposées par les citoyens.</p>
      </div>
    </div>

    <div *ngIf="isLoading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-[#022c16] mb-3"></i>
        <p class="text-gray-500 text-sm">Chargement depuis l'API...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div *ngFor="let idee of idees" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group relative overflow-hidden">
        <div class="absolute top-0 right-0 w-20 h-20 bg-[#022c16]/3 rounded-bl-full pointer-events-none"></div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs bg-[#022c16]/10 text-[#022c16] px-2.5 py-1 rounded-full font-bold">{{ idee.categorie }}</span>
          <span [class]="getStatutClass(idee.statut)" class="text-[11px] font-bold px-2.5 py-1 rounded-full">{{ idee.statut.replace('_', ' ') }}</span>
        </div>
        <h3 class="text-base font-bold text-gray-900 mb-2">{{ idee.titre }}</h3>
        <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ idee.description }}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 text-xs text-gray-400">
            <span><i class="fa-solid fa-user mr-1"></i>Anonyme</span>
            <span><i class="fa-regular fa-calendar mr-1"></i>{{ idee.createdAt | date:'dd/MM/yyyy' }}</span>
          </div>
          <div class="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full font-bold text-sm border border-amber-100">
            <i class="fa-solid fa-thumbs-up text-xs"></i>
            <span>{{ idee.votes }}</span>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-50 flex gap-2">
          <button (click)="action('Approuver', idee.id)" class="flex-1 py-1.5 text-xs font-bold text-white bg-[#022c16] hover:bg-[#022c16]/80 rounded-lg transition-colors">Approuver</button>
          <button (click)="action('Rejeter', idee.id)" class="flex-1 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">Rejeter</button>
          <button (click)="action('Supprimer', idee.id)" class="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>
  </div>
  `
})
export class AdminideesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  idees: any[] = [];
  total = 0;
  isLoading = true;

  constructor(private adminData: AdminDataService,
    private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.adminData.getIdees().subscribe({
      next: (res: any) => { this.idees = res.data; this.total = res.total; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  getStatutClass(s: string): string {
    const map: any = { 'NOUVELLE': 'bg-yellow-100 text-yellow-700', 'A_LETUDE': 'bg-blue-100 text-blue-700', 'VALIDEE': 'bg-green-100 text-green-700', 'REJETEE': 'bg-red-100 text-red-700' };
    return map[s] || 'bg-gray-100 text-gray-500';
  }

  action(type: string, id: string) {
    if (type === 'Approuver') {
      this.isLoading = true;
      this.adminData.updateEntity('idees', id, { statut: 'VALIDEE' }).subscribe(() => this.ngOnInit());
    } else if (type === 'Rejeter') {
      this.isLoading = true;
      this.adminData.updateEntity('idees', id, { statut: 'REJETEE' }).subscribe(() => this.ngOnInit());
    } else if (type === 'Supprimer') {
      if (confirm('Voulez-vous vraiment supprimer cette idée ?')) {
        this.isLoading = true;
        this.adminData.deleteEntity('idees', id).subscribe(() => this.ngOnInit());
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
