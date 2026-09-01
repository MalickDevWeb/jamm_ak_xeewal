import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bulk-actions-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="selectedCount > 0" style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:50;background:white;border:1px solid #e5e7eb;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);border-radius:16px;padding:12px 24px;display:flex;align-items:center;gap:16px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:32px;height:32px;border-radius:50%;background:#008d36;color:white;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;">{{ selectedCount }}</div>
        <span style="font-size:14px;font-weight:600;color:#374151;">selectionne(s)</span>
      </div>
      <div style="height:24px;width:1px;background:#e5e7eb;"></div>
      <button (click)="deleteSelected.emit()" [disabled]="loading" style="background:#fef2f2;color:#dc2626;font-weight:600;font-size:14px;padding:8px 16px;border-radius:12px;border:none;cursor:pointer;display:flex;align-items:center;gap:8px;">
        <span>Supprimer</span>
      </button>
      <button (click)="deleteAll.emit()" [disabled]="loading" style="background:#dc2626;color:white;font-weight:600;font-size:14px;padding:8px 16px;border-radius:12px;border:none;cursor:pointer;display:flex;align-items:center;gap:8px;">
        <span>Tout supprimer</span>
      </button>
      <button (click)="clear.emit()" style="color:#6b7280;font-weight:600;font-size:14px;padding:8px 12px;background:none;border:none;cursor:pointer;">
        Annuler
      </button>
    </div>
  `
})
export class BulkActionsBarComponent {
  @Input() selectedCount = 0;
  @Input() loading = false;
  @Output() deleteSelected = new EventEmitter<void>();
  @Output() deleteAll = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
}
