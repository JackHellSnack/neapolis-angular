import { Component, inject, signal, output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StopPicker } from '../stop-picker/stop-picker';

import Line from '../../model/line';
import Stop from '../../model/stop';
import RideSearchRequest from '../../model/ride-search-request';

import { RideService } from '../../service/ride-service';
import { RouteHighlightService } from '../../service/route-highlight-service';

@Component({
  selector: 'app-ride-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule, StopPicker],
  templateUrl: './ride-search-form.html',
  styleUrl: './ride-search-form.css'
})
export class RideSearchForm {

  searchSubmit = output<void>();

  private rideService = inject(RideService);
  private routeHighlight = inject(RouteHighlightService);
  private router = inject(Router);

  selectedLine = signal<Line | null>(null);
  startStop = signal<Stop | null>(null);
  arrivalStop = signal<Stop | null>(null);
  time = signal<string>(this.defaultTime());
  searchByArrival = signal(false);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  private defaultTime(): string {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  onSubmit() {

    this.errorMessage.set(null);

    const start = this.startStop();
    const arrival = this.arrivalStop();

    if (!start?.id || !arrival?.id || !this.time()) {
      this.errorMessage.set('Seleziona fermata di partenza, arrivo e orario.');
      return;
    }

    if (start.id === arrival.id) {
      this.errorMessage.set('La fermata di partenza e arrivo non possono coincidere.');
      return;
    }

    const payload: RideSearchRequest = {
      time: this.time(),
      searchByArrival: this.searchByArrival(),
      startStopId: start.id,
      arrivalStopId: arrival.id
    };

    this.loading.set(true);

    this.rideService.searchRideOptions(payload).subscribe({
      next: routes => {
        this.loading.set(false);
        if (!routes.length) {
          this.errorMessage.set('Nessuna corsa trovata per questo percorso/orario.');
          return;
        }
        this.routeHighlight.setResults(routes);
        this.searchSubmit.emit();
        this.router.navigate(['/home-map']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Errore nella ricerca. Riprova.');
      }
    });
  }

  swapStops() {
    const start = this.startStop();
    const arrival = this.arrivalStop();
    this.startStop.set(arrival);
    this.arrivalStop.set(start);
  }
}