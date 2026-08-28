import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposerIdeeComponent } from './proposer-idee.component';

describe('ProposerIdeeComponent', () => {
  let component: ProposerIdeeComponent;
  let fixture: ComponentFixture<ProposerIdeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposerIdeeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProposerIdeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
