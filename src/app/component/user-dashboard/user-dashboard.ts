import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth-service';
import { JourneyService } from '../../service/journey-service';
import { GeolocationService } from '../../service/geolocation-service';
import { RouteHighlightService } from '../../service/route-highlight-service';

import RouteLeg from '../../model/route-leg';
import { UserService } from '../../service/user-service';
import { UserUpdateForm } from '../user-update-form/user-update-form';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,UserUpdateForm],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboard implements OnInit, OnDestroy {
  authService      = inject(AuthService);
  journeyService   = inject(JourneyService);
  geolocationService = inject(GeolocationService);
  routeHighlight   = inject(RouteHighlightService);
  private userService = inject(UserService);

  journeyStatus    = signal<any | null>(null);
  journeyLegs      = computed(() => this.routeHighlight.legs());
  loading          = signal(true);
  pinging          = signal(false);
  ending           = signal(false);
  statusError      = signal<string | null>(null);
  pingSuccess      = signal<string | null>(null);

  // --- Profile / account settings ---
  editingProfile   = signal(false);
  profileUsername  = signal('');
  profileEmail     = signal('');
  oldPassword      = signal('');
  newPassword      = signal('');
  confirmPassword  = signal('');
  profileLoading   = signal(false);
  profileError     = signal<string | null>(null);
  profileSuccess   = signal<string | null>(null);

  private pingInterval: any;

  ngOnInit() {

    this.journeyService.getStatus().subscribe({
      next: status => {
        if (status && status.active !== false) {
          this.journeyStatus.set(status);
          this.startPingLoop();
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  ngOnDestroy() {
    if (this.pingInterval) clearInterval(this.pingInterval);
  }
  startJourney() {
    const legs = this.journeyLegs();
    if (!legs?.length) { this.statusError.set('Cerca prima un percorso dalla home.'); return; }
    this.journeyService.start(legs).subscribe({
      next: status => {
        this.journeyStatus.set(status);
        this.startPingLoop();
      },
      error: () => this.statusError.set('Errore nell\'avvio del viaggio.')
    });
  }

    endJourney() {
    this.ending.set(true);
    this.journeyService.end().subscribe({
      next: () => {
        this.ending.set(false);
        this.journeyStatus.set(null);
        this.routeHighlight.clear();   // this alone clears journeyLegs() too, since it's derived
        if (this.pingInterval) { clearInterval(this.pingInterval); this.pingInterval = null; }
      },
      error: () => this.ending.set(false)
    });
  }

  pingNow() {
    this.pinging.set(true);
    this.pingSuccess.set(null);
    this.geolocationService.getCurrentPosition().subscribe({
      next: pos => {
        this.journeyService.ping(pos.coords.latitude, pos.coords.longitude).subscribe({
          next: status => {
            this.pinging.set(false);
            this.journeyStatus.set(status);
            this.pingSuccess.set('Posizione aggiornata!');
            setTimeout(() => this.pingSuccess.set(null), 2500);
          },
          error: () => this.pinging.set(false)
        });
      },
      error: () => { this.pinging.set(false); this.statusError.set('Geolocalizzazione non disponibile.'); }
    });
  }

  private startPingLoop() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => this.pingNow(), 30000);
  }

  isJourneyActive(): boolean {
    return !!this.journeyStatus() && this.journeyStatus().active !== false;
  }
}