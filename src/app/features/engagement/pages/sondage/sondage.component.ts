import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicDataService } from '../../../../core/services/public-data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sondage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sondage.component.html',
  styleUrl: './sondage.component.css'
})
export class SondageComponent implements OnInit {
  sondages = signal<any[]>([]);
  isLoading = signal(true);
  
  // Track selected option per sondage: { [sondageId: string]: string (optionId) }
  selectedOptions = signal<Record<string, string>>({});
  
  // Track voted status: { [sondageId: string]: boolean }
  hasVoted = signal<Record<string, boolean>>({});

  constructor(private publicData: PublicDataService) {}

  ngOnInit() {
    this.loadSondages();
    this.loadVotedStatus();
  }

  loadSondages() {
    this.publicData.getSondages().subscribe({
      next: (res: any) => {
        if (res.data) {
          // Filter to only show active sondages
          const activeSondages = res.data.filter((s: any) => s.statut === 'ACTIF');
          this.sondages.set(activeSondages);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadVotedStatus() {
    // Check localStorage for previously voted sondages
    const votedStr = localStorage.getItem('sondages_voted');
    if (votedStr) {
      try {
        const voted = JSON.parse(votedStr);
        this.hasVoted.set(voted);
      } catch (e) {
        console.error('Erreur lecture votes');
      }
    }
  }

  saveVotedStatus(sondageId: string) {
    const current = { ...this.hasVoted(), [sondageId]: true };
    this.hasVoted.set(current);
    localStorage.setItem('sondages_voted', JSON.stringify(current));
  }

  selectOption(sondageId: string, optionId: string) {
    if (this.hasVoted()[sondageId]) return;
    this.selectedOptions.update(opts => ({ ...opts, [sondageId]: optionId }));
  }

  voter(sondageId: string) {
    const optionId = this.selectedOptions()[sondageId];
    if (!optionId || this.hasVoted()[sondageId]) return;

    this.publicData.postSondageVote(sondageId, optionId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.saveVotedStatus(sondageId);
          // Update the specific sondage in the list to reflect new data
          this.sondages.update(list => 
            list.map(s => s.id === sondageId ? res.data : s)
          );
        }
      },
      error: () => {
        alert('Une erreur est survenue lors du vote.');
      }
    });
  }

  calculatePercentage(optionVotes: number, totalParticipants: number): number {
    if (totalParticipants === 0) return 0;
    return Math.round((optionVotes / totalParticipants) * 100);
  }
}
