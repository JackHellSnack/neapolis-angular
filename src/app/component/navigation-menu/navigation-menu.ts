import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
}

@Component({
  selector: 'app-navigation-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation-menu.html',
  styleUrl: './navigation-menu.css',
})
export class NavigationMenu {

  readonly items: NavItem[] = [
    { path: '/stop-map', label: 'Mappa fermate' },
    { path: '/map', label: 'Mappa' },
    { path: '/stop-form', label: 'Nuova fermata' },
    { path: '/line-form', label: 'Nuova linea' },
    { path: '/ride-search', label: 'Cerca corsa' },
    { path: '/login', label: 'Login' },
  ];
}