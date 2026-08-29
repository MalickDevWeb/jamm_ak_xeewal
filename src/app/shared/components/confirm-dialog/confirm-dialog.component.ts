import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
  <div *ngIf="visible" class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="onCancel()"></div>
    
    <!-- Modal -->
    <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up">
      
      <!-- Icon -->
      <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-triangle-exclamation text-3xl text-red-600"></i>
      </div>

      <!-- Title -->
      <h3 class="text-2xl font-black text-gray-900 text-center mb-2">{{ title }}</h3>

      <!-- Message -->
      <p class="text-gray-600 text-center mb-8">{{ message }}</p>

      <!-- Actions -->
      <div class="flex gap-3">
        <button (click)="onCancel()"
                class="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">
          Annuler
        </button>
        <button (click)="onConfirm()"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
          Supprimer
        </button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .animate-fade-in-up {
      animation: fadeInUp 0.3s ease-out;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirmer la suppression';
  @Input() message = 'Êtes-vous sûr de vouloir supprimer cet élément ?';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
