import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopPicker } from './stop-picker';

describe('StopPicker', () => {
  let component: StopPicker;
  let fixture: ComponentFixture<StopPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(StopPicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
