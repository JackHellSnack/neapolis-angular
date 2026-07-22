import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinePicker } from './line-picker';

describe('LinePicker', () => {
  let component: LinePicker;
  let fixture: ComponentFixture<LinePicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinePicker],
    }).compileComponents();

    fixture = TestBed.createComponent(LinePicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
