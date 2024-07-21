import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateBackComponent } from './date-back.component';

describe('DateBackComponent', () => {
  let component: DateBackComponent;
  let fixture: ComponentFixture<DateBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateBackComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DateBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
