import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PublicDataService } from '../../../../core/services/public-data.service';

@Component({
  selector: 'app-mouvement',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mouvement.component.html',
  styleUrl: './mouvement.component.css'
})
export class MouvementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  content: any = null;

  constructor(
    private publicData: PublicDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.publicData.getEditorial('mouvement').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.content = res.data;
          this.cdr.markForCheck();
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
