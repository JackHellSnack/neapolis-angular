import { Injectable, signal } from '@angular/core';
import RouteLeg from '../model/route-leg';

@Injectable({
  providedIn: 'root'
})
export class RouteHighlightService {

  readonly legs = signal<RouteLeg[] | null>(null);

  readonly routes = signal<RouteLeg[][]>([]);

  setResult(legs: RouteLeg[]): void {
    this.legs.set(legs);
    this.routes.set([legs]);
  }

  setResults(routes: RouteLeg[][]): void {
    this.routes.set(routes);

    if (routes.length > 0) {
      this.legs.set(routes[0]);
    } else {
      this.legs.set(null);
    }
  }

  clear(): void {
    this.legs.set(null);
    this.routes.set([]);
  }

}