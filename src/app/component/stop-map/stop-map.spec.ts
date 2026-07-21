import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopMap } from './stop-map';

describe('StopMap', () => {
  let component: StopMap;
  let fixture: ComponentFixture<StopMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StopMap],
    }).compileComponents();

    fixture = TestBed.createComponent(StopMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
