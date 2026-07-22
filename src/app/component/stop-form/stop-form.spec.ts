import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopForm } from './stop-form';

describe('StopForm', () => {
  let component: StopForm;
  let fixture: ComponentFixture<StopForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopForm],
    }).compileComponents();

    fixture = TestBed.createComponent(StopForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
