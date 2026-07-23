import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleGuide } from './style-guide';

describe('StyleGuide', () => {
  let component: StyleGuide;
  let fixture: ComponentFixture<StyleGuide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StyleGuide],
    }).compileComponents();

    fixture = TestBed.createComponent(StyleGuide);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
