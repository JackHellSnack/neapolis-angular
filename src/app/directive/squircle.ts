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
  @Input() cornerRadius = 18;
  @Input() cornerSmoothing = 0.6;
  @Input() preserveSmoothing = false;

  private resizeObserver?: ResizeObserver;
  private wrapper?: HTMLElement;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.migrateBoxShadowToWrapper();
    this.migrateBorderToInsetShadow();

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

  // box-shadow clipped by clip-path on same element -> move to parent wrapper via filter:drop-shadow
  private migrateBoxShadowToWrapper(): void {
    const host = this.el.nativeElement;
    const style = getComputedStyle(host);
    const shadow = style.boxShadow;
    if (!shadow || shadow === 'none') return;

    const parent = host.parentElement;
    if (!parent) return;

    const wrapper = this.renderer.createElement('div') as HTMLElement;
    this.renderer.setStyle(wrapper, 'display', 'contents');
    this.renderer.setStyle(wrapper, 'filter', this.boxShadowToDropShadow(shadow));

    this.renderer.insertBefore(parent, wrapper, host);
    this.renderer.appendChild(wrapper, host);
    this.renderer.setStyle(host, 'box-shadow', 'none');
    this.wrapper = wrapper;
  }

  // border clipped too -> inset box-shadow stays inside clip path, not cut
  private migrateBorderToInsetShadow(): void {
    const host = this.el.nativeElement;
    const style = getComputedStyle(host);
    const width = parseFloat(style.borderTopWidth);
    if (!width || style.borderTopStyle === 'none') return;

    const color = style.borderTopColor;
    this.renderer.setStyle(host, 'border', 'none');
    this.renderer.setStyle(host, 'box-shadow', `inset 0 0 0 ${width}px ${color}`);
  }

  // filter:drop-shadow(rgba r g b a, x, y, blur) approx from box-shadow shorthand
  private boxShadowToDropShadow(boxShadow: string): string {
    const parts = boxShadow.match(/(-?\d+px)\s+(-?\d+px)\s+(\d+px)\s*(\d+px)?\s*(rgba?\([^)]+\)|#[0-9a-f]+)/i);
    if (!parts) return 'none';
    const [, x, y, blur, , color] = parts;
    return `drop-shadow(${x} ${y} ${blur} ${color})`;
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