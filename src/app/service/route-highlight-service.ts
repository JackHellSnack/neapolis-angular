import { Injectable, signal } from '@angular/core';
import RouteLeg from '../model/route-leg';

@Injectable({ providedIn: 'root' })
export class RouteHighlightService {
  readonly legs = signal<RouteLeg[] | null>(null);

  setResult(legs: RouteLeg[]): void {
    this.legs.set(legs);
  }

  clear(): void {
    this.legs.set(null);
  }
}