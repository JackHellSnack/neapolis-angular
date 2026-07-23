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
  styleUrl: './poi-search-form.css'
})
export class PoiSearchForm {
  private poiService         = inject(PointOfInterestService);
  private geolocationService = inject(GeolocationService);
  private routeHighlight     = inject(RouteHighlightService);
  private router             = inject(Router);

  selectedPoi    = signal<PointOfInterest | null>(null);
  time           = signal<string>(this.defaultTime());
  searchByArrival = signal(false);
  loading        = signal(false);
  errorMessage   = signal<string | null>(null);
  searchResults  = signal<RouteLeg[] | null>(null);

  private defaultTime(): string {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  onSubmit() {
    this.errorMessage.set(null);
    const poi = this.selectedPoi();
    if (!poi?.id) { this.errorMessage.set('Seleziona un punto di interesse.'); return; }
    this.loading.set(true);
    this.geolocationService.getCurrentPosition().subscribe({
      next: pos => {
        const payload: PoiSearchRequest = {
          lat: pos.coords.latitude, lon: pos.coords.longitude,
          poiId: poi.id!, time: this.time(), searchByArrival: this.searchByArrival()
        };
        this.poiService.findRouteToPoi(payload).subscribe({
          next: legs => {
            this.loading.set(false);
            this.searchResults.set(legs);
            if (legs?.length) { this.routeHighlight.setResult(legs); this.router.navigate(['/stop-map']); }
            else { this.errorMessage.set('Nessun percorso trovato per questo punto di interesse.'); }
          },
          error: () => { this.errorMessage.set('Errore nella ricerca. Riprova.'); this.loading.set(false); }
        });
      },
      error: () => { this.errorMessage.set('Attiva la geolocalizzazione per trovare il percorso.'); this.loading.set(false); }
    });
  }
}
