import { Directive, ViewChild, ElementRef, TemplateRef, ViewContainerRef, effect, signal, OnDestroy, inject } from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

@Directive()
export abstract class BasePickerComponent<T> implements OnDestroy {
  protected overlay = inject(Overlay);
  protected viewContainerRef = inject(ViewContainerRef);

  @ViewChild('triggerInput', { read: ElementRef }) triggerInput!: ElementRef;
  @ViewChild('dropdownTemplate') dropdownTemplate!: TemplateRef<unknown>;

  showDropdown = signal(false);
  private overlayRef: OverlayRef | null = null;

  // ogni picker definisce quale lista filtrata mostrare
  protected abstract filteredItems(): T[];

  constructor() {
    effect(() => {
      const shouldShow = this.showDropdown() && this.filteredItems().length > 0;
      if (shouldShow && !this.overlayRef) {
        this.openOverlay();
      } else if (!shouldShow && this.overlayRef) {
        this.closeOverlay();
      }
    });
  }

  hide() { setTimeout(() => this.showDropdown.set(false), 200); }

  private openOverlay() {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.triggerInput)
      .withPositions([
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: -1, offsetX: -15 },
        { originX: 'end', originY: 'top',    overlayX: 'end', overlayY: 'bottom',     offsetX: -15 },
      ])
      .withFlexibleDimensions(true)
      .withPush(true);

    this.overlayRef = this.overlay.create(
      new OverlayConfig({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
        width: this.triggerInput.nativeElement.offsetWidth,
      })
    );

    const portal = new TemplatePortal(this.dropdownTemplate, this.viewContainerRef);
    this.overlayRef.attach(portal);
  }

  private closeOverlay() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  ngOnDestroy() {
    this.overlayRef?.dispose();
  }
}