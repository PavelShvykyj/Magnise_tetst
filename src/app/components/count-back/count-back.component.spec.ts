import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountBackComponent } from './count-back.component';

describe('CountBackComponent', () => {
  let component: CountBackComponent;
  let fixture: ComponentFixture<CountBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountBackComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CountBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
