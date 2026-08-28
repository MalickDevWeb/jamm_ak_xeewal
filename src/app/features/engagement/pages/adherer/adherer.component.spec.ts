import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdhererComponent } from './adherer.component';

describe('AdhererComponent', () => {
  let component: AdhererComponent;
  let fixture: ComponentFixture<AdhererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdhererComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdhererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
