import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoiForm } from './poi-form';

describe('PoiForm', () => {
  let component: PoiForm;
  let fixture: ComponentFixture<PoiForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoiForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PoiForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
