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
    this.routes.set(routes);
    this.selectedIndex.set(0);
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