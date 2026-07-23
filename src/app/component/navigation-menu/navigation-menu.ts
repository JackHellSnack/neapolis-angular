import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth-service';

@Component({
  selector: 'app-navigation-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navigation-menu.html',
  styleUrl: './navigation-menu.css'
})
export class NavigationMenu {
  authService = inject(AuthService);
  private router = inject(Router);
  menuOpen = signal(false);

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu()  { this.menuOpen.set(false); }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
    this.closeMenu();
  }
}
