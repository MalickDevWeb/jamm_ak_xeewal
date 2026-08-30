import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminDataService } from '../../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  showExportModal = false;
  exportFormat: 'pdf' | 'xlsx' = 'pdf';
  exportPeriod: 'day' | 'week' | 'month' | 'year' | 'custom' = 'month';
  exportFrom = this.toInputDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  exportTo = this.toInputDate(new Date());
  isExporting = false;
  exportError = '';

  totalAdherents = 0;
  percentAdherents = 0;
  totalActifs = 0;
  percentActifs = 0;
  totalBesoins = 0;
  percentBesoins = 0;
  totalIdees = 0;
  percentIdees = 0;
  totalActivites = 0;
  percentActivites = 0;
  totalMedias = 0;
  nouvellesMedias = 0;

  ngOnInit() {
    this.adminData.getAdherents().subscribe({
      next: (res: any) => {
        if (res.data) {
          const adherents = res.data;
          this.totalAdherents = adherents.length;
          this.percentAdherents = this.calculatePercentage(adherents, 'createdAt');
          
          const actifs = adherents.filter((a: any) => a.statut === 'ACTIF');
          this.totalActifs = actifs.length;
          this.percentActifs = this.calculatePercentage(actifs, 'createdAt');
        }
      }, error: () => {}
    });

    this.adminData.getBesoins().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.totalBesoins = res.data.length;
          this.percentBesoins = this.calculatePercentage(res.data, 'createdAt');
        }
      }, error: () => {}
    });

    this.adminData.getIdees().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.totalIdees = res.data.length;
          this.percentIdees = this.calculatePercentage(res.data, 'createdAt');
        }
      }, error: () => {}
    });

    this.adminData.getActivites().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.totalActivites = res.data.length;
          this.percentActivites = this.calculatePercentage(res.data, 'createdAt');
          
          this.totalMedias = res.data.reduce((acc: number, act: any) => acc + (act.mediaCount || 0), 0);
          
          const startOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          let nouvelles = 0;
          res.data.forEach((act: any) => {
            const actDate = act.createdAt ? new Date(act.createdAt) : new Date(act.date);
            if (actDate >= startOfCurrentMonth) nouvelles += (act.mediaCount || 0);
          });
          this.nouvellesMedias = nouvelles;
        }
      }
    });
  }

  private calculatePercentage(items: any[], dateField = 'createdAt'): number {
    if (!items || items.length === 0) return 0;
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    let currentMonth = 0;
    let previousMonth = 0;

    items.forEach(item => {
      const d = new Date(item[dateField]);
      if (d >= startOfCurrentMonth) currentMonth++;
      else if (d >= startOfPreviousMonth && d < startOfCurrentMonth) previousMonth++;
    });

    if (previousMonth === 0) return currentMonth > 0 ? 100 : 0;
    return Math.round(((currentMonth - previousMonth) / previousMonth) * 100);
  }

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
    let yPos = 20;

    // Header Design
    pdf.setFillColor(2, 44, 22); // Primary Green #022c16
    pdf.rect(0, 0, 210, 30, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RAPPORT D’ACTIVITÉ', 15, 20);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('JÀMM AK XÉEWAL', 140, 16);
    pdf.text(`Période du ${this.formatDate(from)} au ${this.formatDate(to)}`, 140, 22);

    pdf.setTextColor(0, 0, 0);
    yPos = 40;

    // Iterate over sections
    this.reportSources.forEach(source => {
      const items = report[source.key];
      if (items.length === 0) return; // Skip empty sections

      // Add section title
      if (yPos > 260) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(2, 44, 22);
      pdf.text(`${source.label} (${items.length})`, 14, yPos);
      yPos += 5;

      // Extract and translate keys, filter out useless ones
      const rawRows = items.map(item => this.flatten(item));
      const firstRow = rawRows[0];
      const allKeys = Object.keys(firstRow);
      
      const filteredKeys = allKeys.filter(k => 
        !['id', 'photoUrl', 'mediaUrl', 'carteRectoUrl', 'carteVersoUrl', 'vocalUrl', 'createdAt', 'updatedAt'].includes(k)
      );

      // Prepare table data
      const head = [filteredKeys.map(k => this.translateKey(k))];
      const body = rawRows.map(row => filteredKeys.map(k => String(row[k] || '-').substring(0, 50)));

      // Draw beautiful table
      autoTable(pdf, {
        startY: yPos,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [3, 66, 86], textColor: 255, fontStyle: 'bold' }, // #034256
        alternateRowStyles: { fillColor: [249, 250, 251] },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { top: 20 },
      });

      yPos = (pdf as any).lastAutoTable.finalY + 15;
    });

    // Check if totally empty
    const totalItems = this.reportSources.reduce((acc, src) => acc + report[src.key].length, 0);
    if (totalItems === 0) {
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Aucune donnée trouvée pour cette période.', 15, 50);
    }

    pdf.save(`rapport-jamm-${this.fileDate(from)}-${this.fileDate(to)}.pdf`);
  }

  private translateKey(key: string): string {
    const translations: Record<string, string> = {
      prenom: 'Prénom',
      nom: 'Nom',
      telephone: 'Téléphone',
      quartier: 'Quartier',
      profession: 'Profession',
      competences: 'Compétences',
      statut: 'Statut',
      description: 'Description',
      contact: 'Contact',
      urgence: 'Urgence',
      titre: 'Titre',
      date: 'Date',
      categorie: 'Catégorie',
      typeMedia: 'Type Média',
      sujet: 'Sujet',
      email: 'Email',
      lieu: 'Lieu',
      auteur: 'Auteur',
      responsable: 'Responsable'
    };
    return translations[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  private flatten(item: any): Record<string, string | number> {
    return Object.keys(item).reduce((result, key) => {
      const value = item[key];
      if (key === 'options' && Array.isArray(value)) {
        result[key] = value.map(option => option.texte).join(', ');
      }
      else if (value !== null && value !== undefined && typeof value !== 'object') {
        result[key] = (key.toLowerCase().includes('at') || key === 'date') ? this.formatDate(value) : value;
      }
      return result;
    }, {} as Record<string, string | number>);
  }

  private formatDate(value: string | Date): string { return new Date(value).toLocaleDateString('fr-FR'); }
  private fileDate(value: Date): string { return value.toISOString().slice(0, 10); }
  private toInputDate(value: Date): string { return this.fileDate(value); }
}

