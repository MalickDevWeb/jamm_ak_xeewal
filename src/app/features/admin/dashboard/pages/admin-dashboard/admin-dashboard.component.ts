import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { AdminDataService } from '../../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  showExportModal = false;
  exportFormat: 'pdf' | 'xlsx' = 'pdf';
  exportPeriod: 'day' | 'week' | 'month' | 'year' | 'custom' = 'month';
  exportFrom = this.toInputDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  exportTo = this.toInputDate(new Date());
  isExporting = false;
  exportError = '';

  private readonly reportSources = [
    { key: 'Adherents', label: 'Adhérents', load: () => this.adminData.getAdherents() },
    { key: 'Besoins', label: 'Besoins déclarés', load: () => this.adminData.getBesoins() },
    { key: 'Idees', label: 'Idées', load: () => this.adminData.getIdees() },
    { key: 'Messages', label: 'Messages', load: () => this.adminData.getMessages() },
    { key: 'Commissions', label: 'Commissions', load: () => this.adminData.getCommissions() },
    { key: 'Sondages', label: 'Sondages', load: () => this.adminData.getSondages() },
    { key: 'Activites', label: 'Activités', load: () => this.adminData.getActivites() },
    { key: 'ComptesRendus', label: 'Comptes-rendus', load: () => this.adminData.getComptesRendus() }
  ];

  constructor(private adminData: AdminDataService) {}

  openExportModal() { this.exportError = ''; this.showExportModal = true; }

  updateExportDates() {
    const today = new Date();
    let from = new Date(today);
    if (this.exportPeriod === 'day') from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (this.exportPeriod === 'week') {
      const day = today.getDay() || 7;
      from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - day + 1);
    }
    if (this.exportPeriod === 'month') from = new Date(today.getFullYear(), today.getMonth(), 1);
    if (this.exportPeriod === 'year') from = new Date(today.getFullYear(), 0, 1);
    if (this.exportPeriod !== 'custom') { this.exportFrom = this.toInputDate(from); this.exportTo = this.toInputDate(today); }
  }

  generateExport() {
    const from = new Date(`${this.exportFrom}T00:00:00`);
    const to = new Date(`${this.exportTo}T23:59:59`);
    if (!this.exportFrom || !this.exportTo || from > to) { this.exportError = 'La période sélectionnée est invalide.'; return; }
    this.isExporting = true;
    this.exportError = '';
    forkJoin(this.reportSources.map(source => source.load())).subscribe({
      next: responses => {
        const report = this.reportSources.reduce((result, source, index) => {
          const data = responses[index]?.data || responses[index] || [];
          result[source.key] = Array.isArray(data) ? data.filter(item => this.inPeriod(item, from, to)) : [];
          return result;
        }, {} as Record<string, any[]>);
        if (this.exportFormat === 'xlsx') this.downloadExcel(report, from, to);
        else this.downloadPdf(report, from, to);
        this.isExporting = false;
        this.showExportModal = false;
      },
      error: () => { this.isExporting = false; this.exportError = 'Impossible de charger les données du rapport.'; }
    });
  }

  private inPeriod(item: any, from: Date, to: Date): boolean {
    const value = item.createdAt || item.date;
    if (!value) return false;
    const date = new Date(value);
    return date >= from && date <= to;
  }

  private downloadExcel(report: Record<string, any[]>, from: Date, to: Date) {
    const workbook = XLSX.utils.book_new();
    const summary: any[][] = [['RAPPORT D’ACTIVITÉ - JÀMM AK XÉEWAL'], ['Période', `${this.formatDate(from)} au ${this.formatDate(to)}`], [], ['Rubrique', 'Nombre']];
    this.reportSources.forEach(source => summary.push([source.label, report[source.key].length]));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summary), 'Synthèse');
    this.reportSources.forEach(source => {
      const rows = report[source.key].map(item => this.flatten(item));
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows.length ? rows : [{ Information: 'Aucune donnée sur cette période' }]), source.label.slice(0, 31));
    });
    XLSX.writeFile(workbook, `rapport-jamm-${this.fileDate(from)}-${this.fileDate(to)}.xlsx`);
  }

  private downloadPdf(report: Record<string, any[]>, from: Date, to: Date) {
    const pdf = new jsPDF();
    let y = 20;
    pdf.setFontSize(18); pdf.text('Rapport d’activité', 15, y);
    pdf.setFontSize(10); pdf.text(`JÀMM AK XÉEWAL | ${this.formatDate(from)} au ${this.formatDate(to)}`, 15, y + 8); y += 24;
    this.reportSources.forEach(source => {
      if (y > 275) { pdf.addPage(); y = 20; }
      pdf.setFontSize(12); pdf.setFont('helvetica', 'bold'); pdf.text(`${source.label} (${report[source.key].length})`, 15, y);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); y += 6;
      const rows = report[source.key];
      if (!rows.length) { pdf.text('Aucune donnée sur cette période.', 20, y); y += 8; return; }
      rows.slice(0, 25).forEach(item => {
        const line = Object.entries(this.flatten(item)).map(([key, value]) => `${key}: ${value}`).join(' | ');
        const wrapped = pdf.splitTextToSize(line, 175);
        if (y + wrapped.length * 4 > 280) { pdf.addPage(); y = 20; }
        pdf.text(wrapped, 20, y); y += wrapped.length * 4 + 2;
      });
      if (rows.length > 25) { pdf.text(`... ${rows.length - 25} ligne(s) supplémentaire(s), disponibles dans l’Excel.`, 20, y); y += 6; }
      y += 5;
    });
    pdf.save(`rapport-jamm-${this.fileDate(from)}-${this.fileDate(to)}.pdf`);
  }

  private flatten(item: any): Record<string, string | number> {
    return Object.keys(item).reduce((result, key) => {
      const value = item[key];
      if (key === 'options' && Array.isArray(value)) result[key] = value.map(option => option.texte).join(', ');
      else if (value !== null && value !== undefined && typeof value !== 'object') result[key] = key.toLowerCase().includes('at') || key === 'date' ? this.formatDate(value) : value;
      return result;
    }, {} as Record<string, string | number>);
  }

  private formatDate(value: string | Date): string { return new Date(value).toLocaleDateString('fr-FR'); }
  private fileDate(value: Date): string { return value.toISOString().slice(0, 10); }
  private toInputDate(value: Date): string { return this.fileDate(value); }
}
