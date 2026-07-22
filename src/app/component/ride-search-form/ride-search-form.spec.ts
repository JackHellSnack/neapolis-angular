import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideSearchForm } from './ride-search-form';

describe('RideSearchForm', () => {
  let component: RideSearchForm;
  let fixture: ComponentFixture<RideSearchForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RideSearchForm],
    }).compileComponents();

    fixture = TestBed.createComponent(RideSearchForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
