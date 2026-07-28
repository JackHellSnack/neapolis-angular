import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth-service';
import { SquircleDirective } from '../../directive/squircle';
import { ClickOutside} from '../../directive/click-outside';
import { RideSearchForm } from "../ride-search-form/ride-search-form";
import { PoiSearchForm } from "../poi-search-form/poi-search-form";

@Component({
  selector: 'app-floating-menu',
  standalone: true,
  imports: [CommonModule, SquircleDirective, ClickOutside, RideSearchForm, PoiSearchForm],
  templateUrl: './floating-menu.html',
  styleUrl: './floating-menu.css'
})
export class FloatingMenu {

  activeTab = signal<'ride' | 'poi'>('ride');
  isOpen = signal(false);

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

  setTab(tab: 'ride' | 'poi') {
    if (this.activeTab() === tab) {
      this.isOpen.update(v => !v);
    } else {
      this.activeTab.set(tab);
      this.isOpen.set(true);
    }
  }
}