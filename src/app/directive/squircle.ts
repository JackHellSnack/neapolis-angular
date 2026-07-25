// squircle.directive.ts
import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { getSvgPath } from 'figma-squircle';

@Directive({
  selector: '[squircle]',
  standalone: true,
})
export class SquircleDirective implements OnInit, OnChanges, OnDestroy {
  @Input() cornerRadius = 16;
  @Input() cornerSmoothing = 0.8; // 0.6 = iOS7
  @Input() preserveSmoothing = false;

  private resizeObserver?: ResizeObserver;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.applyPath());
    this.resizeObserver.observe(this.el.nativeElement);
    this.applyPath();
  }

  ngOnChanges(): void {
    this.applyPath();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private applyPath(): void {
    const { width, height } = this.el.nativeElement.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    const path = getSvgPath({
      width,
      height,
      cornerRadius: this.cornerRadius,
      cornerSmoothing: this.cornerSmoothing,
      preserveSmoothing: this.preserveSmoothing,
    });

    this.renderer.setStyle(
      this.el.nativeElement,
      'clip-path',
      `path('${path}')`,
    );
  }
}