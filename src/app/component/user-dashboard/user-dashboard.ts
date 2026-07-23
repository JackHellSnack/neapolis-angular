import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth-service';
import { JourneyService } from '../../service/journey-service';
import { GeolocationService } from '../../service/geolocation-service';
import { RouteHighlightService } from '../../service/route-highlight-service';
import RouteLeg from '../../model/route-leg';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css'
})
export class UserDashboard implements OnInit, OnDestroy {
  authService      = inject(AuthService);
  journeyService   = inject(JourneyService);
  geolocationService = inject(GeolocationService);
  routeHighlight   = inject(RouteHighlightService);

  journeyStatus    = signal<any | null>(null);
  journeyLegs      = signal<RouteLeg[] | null>(null);
  loading          = signal(true);
  pinging          = signal(false);
  ending           = signal(false);
  statusError      = signal<string | null>(null);
  pingSuccess      = signal<string | null>(null);

  private pingInterval: any;

  ngOnInit() {
    this.loadStatus();
    const cached = this.routeHighlight.legs();
    if (cached) this.journeyLegs.set(cached);
  }

  ngOnDestroy() {
    if (this.pingInterval) clearInterval(this.pingInterval);
  }

  loadStatus() {
    this.loading.set(true);
    this.statusError.set(null);
    this.journeyService.getStatus().subscribe({
      next: status => { this.journeyStatus.set(status); this.loading.set(false); },
      error: () => { this.journeyStatus.set(null); this.loading.set(false); }
    });
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
        this.routeHighlight.clear();
        this.journeyLegs.set(null);
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
