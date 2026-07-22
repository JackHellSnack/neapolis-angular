import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineForm } from './line-form';

describe('LineForm', () => {
  let component: LineForm;
  let fixture: ComponentFixture<LineForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineForm],
    }).compileComponents();

    fixture = TestBed.createComponent(LineForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
