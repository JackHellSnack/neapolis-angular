import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PoiPicker } from '../poi-picker/poi-picker';

import PointOfInterest from '../../model/point-of-interest';
import RouteLeg from '../../model/route-leg';
import { PointOfInterestService } from '../../service/point-of-interest-service';
import { GeolocationService } from '../../service/geolocation-service';
import { RouteHighlightService } from '../../service/route-highlight-service';
import PoiSearchRequest from '../../model/poi-search-request';

@Component({
  selector: 'app-poi-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule, PoiPicker],
  templateUrl: './poi-search-form.html',
  styleUrls: ['./poi-search-form.css']
})
export class PoiSearchForm {
  private poiService = inject(PointOfInterestService);
  private geolocationService = inject(GeolocationService);
  private routeHighlight = inject(RouteHighlightService);
  private router = inject(Router);

  selectedPoi = signal<PointOfInterest | null>(null);

  time = signal<string>('12:00');
  searchByArrival = signal<boolean>(false);

  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  searchResults = signal<RouteLeg[] | null>(null);

  onPoiChange(poi: PointOfInterest | null): void {
    this.selectedPoi.set(poi);
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    const poi = this.selectedPoi();

    if (!poi?.id || !this.time()) {
      this.errorMessage.set('Seleziona un punto di interesse e un orario.');
      return;
    }

    this.loading.set(true);

    this.geolocationService.getCurrentPosition().subscribe({
      next: position => {
        const payload: PoiSearchRequest = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          poiId: poi.id!,
          time: this.time(),
          searchByArrival: this.searchByArrival(),
        };

        this.poiService.findRouteToPoi(payload).subscribe({
          next: (legs) => {
            this.loading.set(false);
            this.searchResults.set(legs);

            if (legs?.length) {
              this.routeHighlight.setResult(legs);
              this.router.navigate(['/stop-map']);
            } else {
              this.errorMessage.set('Nessun percorso trovato per questo punto di interesse.');
            }
          },
          error: (err) => {
            console.error('Poi route search failed:', err);
            this.errorMessage.set('Ricerca del percorso fallita. Riprova.');
            this.loading.set(false);
          }
        });
      },
      error: err => {
        console.error('Geolocation failed:', err);
        this.errorMessage.set('Impossibile determinare la tua posizione. Attiva la geolocalizzazione e riprova.');
        this.loading.set(false);
      }
    });
  }
}
