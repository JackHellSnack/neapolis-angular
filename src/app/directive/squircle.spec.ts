import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SquircleDirective } from './squircle';

@Component({
  standalone: true,
  imports: [SquircleDirective],
  template: `<div squircle [cornerRadius]="16" [cornerSmoothing]="0.8" style="width:100px;height:100px"></div>`
})
class TestHostComponent {}

describe('SquircleDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const el = fixture.nativeElement.querySelector('div');
    const directive = fixture.debugElement.children[0].injector.get(SquircleDirective);
    expect(directive).toBeTruthy();
  });

  it('should apply clip-path to host element', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(el.style.clipPath).toContain('path(');
  });
});