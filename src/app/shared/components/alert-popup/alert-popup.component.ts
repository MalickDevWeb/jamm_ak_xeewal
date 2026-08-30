import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert-popup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
  <div *ngIf="visible" class="fixed inset-0 z-[99999] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="onClose()"></div>
    <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-in-up">
      <div class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" [ngClass]="iconBgClass">
        <i [class]="iconClass" [ngClass]="iconTextClass" class="text-3xl"></i>
      </div>
      <h3 class="text-2xl font-black text-gray-900 text-center mb-2">{{ title }}</h3>
      <p class="text-gray-600 text-center mb-8">{{ message }}</p>
      <div class="flex gap-3">
        <button (click)="onClose()" class="flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all" [ngClass]="buttonClass">Fermer</button>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .animate-fade-in-up { animation: fadeInUp 0.3s ease-out; }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class AlertPopupComponent {
  @Input() visible = false;
  @Input() type: AlertType = 'info';
  @Input() title = 'Information';
  @Input() message = '';
  @Output() close = new EventEmitter<void>();

  get iconClass(): string {
    const map: Record<AlertType, string> = { success: 'fa-solid fa-check', error: 'fa-solid fa-circle-exclamation', warning: 'fa-solid fa-triangle-exclamation', info: 'fa-solid fa-circle-info' };
    return map[this.type];
  }
  get iconBgClass(): string {
    const map: Record<AlertType, string> = { success: 'bg-green-100', error: 'bg-red-100', warning: 'bg-yellow-100', info: 'bg-blue-100' };
    return map[this.type];
  }
  get iconTextClass(): string {
    const map: Record<AlertType, string> = { success: 'text-green-600', error: 'text-red-600', warning: 'text-yellow-600', info: 'text-blue-600' };
    return map[this.type];
  }
  get buttonClass(): string {
    const map: Record<AlertType, string> = { success: 'bg-gray-100 text-gray-700 hover:bg-gray-200', error: 'bg-red-50 text-red-700 hover:bg-red-100', warning: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100', info: 'bg-gray-100 text-gray-700 hover:bg-gray-200' };
    return map[this.type];
  }
  onClose() { this.close.emit(); }
}
