import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoiPicker } from './poi-picker';

describe('PoiPicker', () => {
  let component: PoiPicker;
  let fixture: ComponentFixture<PoiPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoiPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(PoiPicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
