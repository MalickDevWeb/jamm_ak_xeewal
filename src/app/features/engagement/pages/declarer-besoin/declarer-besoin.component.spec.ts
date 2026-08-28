import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarerBesoinComponent } from './declarer-besoin.component';

describe('DeclarerBesoinComponent', () => {
  let component: DeclarerBesoinComponent;
  let fixture: ComponentFixture<DeclarerBesoinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeclarerBesoinComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeclarerBesoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
