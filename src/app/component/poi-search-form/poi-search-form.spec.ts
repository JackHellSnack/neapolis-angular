import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoiSearchForm } from './poi-search-form';

describe('PoiSearchForm', () => {
  let component: PoiSearchForm;
  let fixture: ComponentFixture<PoiSearchForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoiSearchForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PoiSearchForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
