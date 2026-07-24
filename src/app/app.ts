import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationMenu } from './component/navigation-menu/navigation-menu';
import { Footer } from './footer/footer';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavigationMenu,Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('neapolis-angular');
}