import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PoiPicker } from '../poi-picker/poi-picker';

import PointOfInterest from '../../model/point-of-interest';
import RouteLeg from '../../model/route-leg';
import PoiSearchRequest from '../../model/poi-search-request';

import { PointOfInterestService } from '../../service/point-of-interest-service';
import { GeolocationService } from '../../service/geolocation-service';
import { RouteHighlightService } from '../../service/route-highlight-service';

@Component({
  selector: 'app-poi-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule, PoiPicker],
  templateUrl: './poi-search-form.html',
  styleUrl: './poi-search-form.css'
})
export class PoiSearchForm {

  private poiService = inject(PointOfInterestService);
  private geolocationService = inject(GeolocationService);
  private routeHighlight = inject(RouteHighlightService);
  private router = inject(Router);

  selectedPoi = signal<PointOfInterest | null>(null);

  time = signal<string>(this.defaultTime());

  searchByArrival = signal(false);

  loading = signal(false);

  errorMessage = signal<string | null>(null);

  searchResults = signal<RouteLeg[] | null>(null);

  showAlternativePrompt = signal(false);

  lastSearch = signal<PoiSearchRequest | null>(null);

  private defaultTime(): string {

    const d = new Date();

    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  }

  onSubmit() {

    this.errorMessage.set(null);

    this.showAlternativePrompt.set(false);

    const poi = this.selectedPoi();

    if (!poi?.id) {
      this.errorMessage.set('Seleziona un punto di interesse.');
      return;
    }

    this.loading.set(true);

    this.geolocationService.getCurrentPosition().subscribe({

      next: pos => {

        const payload: PoiSearchRequest = {

          lat: pos.coords.latitude,

          lon: pos.coords.longitude,

          poiId: poi.id!,

          time: this.time(),

          searchByArrival: this.searchByArrival()

        };

        this.lastSearch.set(payload);

        this.poiService.findRouteToPoi(payload).subscribe({

          next: legs => {

            this.loading.set(false);

            if (!legs.length) {

              this.errorMessage.set(
                'Nessun percorso trovato per questo punto di interesse.'
              );

              return;

            }

            this.searchResults.set(legs);

            this.routeHighlight.setResult(legs);

            this.showAlternativePrompt.set(true);

          },

          error: () => {

            this.loading.set(false);

            this.errorMessage.set('Errore nella ricerca. Riprova.');

          }

        });

      },

      error: () => {

        this.loading.set(false);

        this.errorMessage.set(
          'Attiva la geolocalizzazione per trovare il percorso.'
        );

      }

    });

  }

  useCurrentRoute() {

    this.showAlternativePrompt.set(false);

    this.router.navigate(['/stop-map']);

  }

  searchAlternativeRoutes() {

    const request = this.lastSearch();

    if (!request) {
      return;
    }

    this.loading.set(true);

    this.showAlternativePrompt.set(false);

    this.poiService.findRouteOptionsToPoi(request).subscribe({

      next: routes => {

        this.loading.set(false);

        this.routeHighlight.setResults(routes);

        this.router.navigate(['/stop-map']);

      },

      error: () => {

        this.loading.set(false);

        this.errorMessage.set(
          'Errore durante il recupero dei percorsi alternativi.'
        );

      }

    });

  }

}