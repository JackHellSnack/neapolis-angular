import { Injectable, signal, computed } from '@angular/core';
import RouteLeg from '../model/route-leg';

@Injectable({
  providedIn: 'root'
})
export class RouteHighlightService {

  readonly routes = signal<RouteLeg[][]>([]);
  readonly selectedIndex = signal<number>(0);

  /** La route attualmente "attiva" (quella selezionata dall'utente). */
  readonly legs = computed<RouteLeg[] | null>(() => {
    const routes = this.routes();
    const idx = this.selectedIndex();
    return routes[idx] ?? null;
  });

  setResult(legs: RouteLeg[]): void {
    this.routes.set([legs]);
    this.selectedIndex.set(0);
  }

  setResults(routes: RouteLeg[][]): void {
    this.routes.set(this.dedupeRoutes(routes));
    this.selectedIndex.set(0);
  }

  private dedupeRoutes(routes: RouteLeg[][]): RouteLeg[][] {
    const seen = new Set<string>();
    const result: RouteLeg[][] = [];
    for (const route of routes) {
      const key = route
        .map(leg => `${leg.lineId}-${leg.fromStopId}-${leg.toStopId}`)
        .join('|');
      if (!seen.has(key)) {
        seen.add(key);
        result.push(route);
      }
    }
    return result;
  }
  selectRoute(index: number): void {
    if (index >= 0 && index < this.routes().length) {
      this.selectedIndex.set(index);
    }
  }

  clear(): void {
    this.routes.set([]);
    this.selectedIndex.set(0);
  }
}