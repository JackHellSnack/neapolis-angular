import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router,RouterModule,RouterOutlet } from '@angular/router';
import { NavigationMenu } from './component/navigation-menu/navigation-menu';
import { Footer } from './footer/footer';
import { FloatingMenu } from './component/floating-menu/floating-menu'; 
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';


@Component({
  selector: 'app-root',
  standalone:true,
  imports: [RouterOutlet, RouterModule, NavigationMenu, FloatingMenu, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('neapolis-angular');

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  hideChrome = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.deepestRouteData()),
      startWith(this.deepestRouteData())
    ),
    { initialValue: false }
  );

  private deepestRouteData(): boolean {
    let r = this.route.firstChild;
    while (r?.firstChild) r = r.firstChild;
    return !!r?.snapshot.data['hideChrome'];
  }


}