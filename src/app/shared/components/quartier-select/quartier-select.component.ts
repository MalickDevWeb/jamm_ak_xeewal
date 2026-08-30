import { Component, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Utilisation d'une interface générique car Option peut avoir 'id' ou 'value' selon le contexte
export interface QuartierOption {
  id?: string;
  value?: string;
  label: string;
  [key: string]: any;
}

@Component({
  selector: 'app-quartier-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quartier-select.component.html'
})
export class QuartierSelectComponent implements OnChanges {
  @Input() quartiers: QuartierOption[] = [];
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  @Input() placeholder: string = 'Rechercher ou sélectionner un quartier...';

  isOpen = false;
  searchQuery = '';

  get filteredQuartiers(): QuartierOption[] {
    if (!this.searchQuery) return this.quartiers;
    const lowerQuery = this.searchQuery.toLowerCase();
    return this.quartiers.filter(q => q.label.toLowerCase().includes(lowerQuery));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      this.updateSearchQueryFromValue();
    }
  }

  private updateSearchQueryFromValue() {
    if (!this.value) {
      this.searchQuery = '';
    } else {
      const selected = this.quartiers.find(q => this.getOptionValue(q) === this.value);
      if (selected && this.searchQuery !== selected.label) {
        this.searchQuery = selected.label;
      }
    }
  }

  getOptionValue(q: QuartierOption): string {
    return (q.value !== undefined ? q.value : q.id) || '';
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
       // if we want to let them see full list, maybe leave searchQuery as is
    }
  }

  onFocus() {
    this.isOpen = true;
  }

  onInput() {
    this.isOpen = true;
    this.value = '';
    this.valueChange.emit(this.value);
  }

  selectOption(q: QuartierOption) {
    const val = this.getOptionValue(q);
    this.value = val;
    this.searchQuery = q.label;
    this.isOpen = false;
    this.valueChange.emit(this.value);
  }

  @HostListener('document:click', ['$event'])
  closeDropdown() {
    if (this.isOpen) {
      this.isOpen = false;
      // Revert search query to selected value label if they clicked outside without selecting
      this.updateSearchQueryFromValue();
    }
  }
}
