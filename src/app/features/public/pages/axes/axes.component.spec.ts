import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AxesComponent } from './axes.component';

describe('AxesComponent', () => {
  let component: AxesComponent;
  let fixture: ComponentFixture<AxesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AxesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
