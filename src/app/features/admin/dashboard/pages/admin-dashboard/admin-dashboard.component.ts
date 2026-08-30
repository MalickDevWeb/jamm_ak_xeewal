import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminDataService } from '../../../../../core/services/admin-data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  totalAdherents = 0;
  percentAdherents = 0;
  totalIdees = 0;
  percentIdees = 0;
  totalActivites = 0;
  percentActivites = 0;
  totalMessages = 0;
  percentMessages = 0;
  totalSondages = 0;
  percentSondages = 0;

  recentActivities: any[] = [];
  recentAdherents: any[] = [];
  
  quartierStats = [
    { name: 'Nguinth', percent: 35, count: 436, color: 'bg-[#008d36]' },
    { name: 'Bambilor', percent: 25, count: 312, color: 'bg-[#10b981]' },
    { name: 'Yaraté', percent: 20, count: 250, color: 'bg-[#6ee7b7]' },
    { name: 'Autres', percent: 20, count: 250, color: 'bg-[#d1fae5]' },
  ];

  constructor(private adminData: AdminDataService) {}

  ngOnInit() {
    this.adminData.getAdherents().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.totalAdherents = res.data.length;
          this.percentAdherents = this.calculatePercentage(res.data, 'createdAt');
          // Sort by newest
          this.recentAdherents = [...res.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
        }
      }
    });

    this.adminData.getIdees().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.totalIdees = res.data.length;
          this.percentIdees = this.calculatePercentage(res.data, 'createdAt');
        }
      }
    });

    this.adminData.getActivites().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.totalActivites = res.data.length;
          this.percentActivites = this.calculatePercentage(res.data, 'createdAt' || 'date');
          this.recentActivities = [...res.data].sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()).slice(0, 3);
        }
      }
    });
    
    this.adminData.getMessages().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.totalMessages = res.data.length;
          this.percentMessages = this.calculatePercentage(res.data, 'createdAt');
        }
      }
    });
    
    this.adminData.getSondages().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.totalSondages = res.data.length;
          this.percentSondages = this.calculatePercentage(res.data, 'createdAt');
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

    if (previousMonth === 0) return currentMonth > 0 ? currentMonth : 0;
    return Math.round(((currentMonth - previousMonth) / previousMonth) * 100);
  }
}
