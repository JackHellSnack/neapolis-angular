import * as L from 'leaflet';

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;background:#2C8FBF;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});

const poiIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

import { Component, OnInit, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { StopService } from '../../service/stop-service';
import { GeolocationService } from '../../service/geolocation-service';
import { LineService } from '../../service/line-service';
import { PointOfInterestService } from '../../service/point-of-interest-service';
import { RouteHighlightService } from '../../service/route-highlight-service';
import { AreaSearch } from '../../model/area-search';
import Stop from '../../model/stop';
import Line from '../../model/line';
import PointOfInterest from '../../model/point-of-interest';
import RouteLeg from '../../model/route-leg';
import PoiSearchRequest from '../../model/poi-search-request';

@Component({
  selector: 'app-stop-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stop-map.html',
  styleUrl: './stop-map.css'
})
export class StopMap implements OnInit {
  private stopService     = inject(StopService);
  private geolocationService = inject(GeolocationService);
  private lineService     = inject(LineService);
  private poiService      = inject(PointOfInterestService);
  private routeHighlight  = inject(RouteHighlightService);

  private map!: L.Map;
  private allStopsLayer!: L.LayerGroup;
  private nearbyStopsLayer!: L.LayerGroup;
  private linesLayer!: L.LayerGroup;
  private poiLayer!: L.LayerGroup;
  private highlightLayer!: L.LayerGroup;

  private stopsById = new Map<number, Stop>();
  private linesById = new Map<number, Line>();
  private dataReady = false;

  routeActive = signal(false);
  searching   = signal(false);
  searchError = signal<string | null>(null);

  private readonly ROUTE_COLORS = [
  '#B00020', // best route
  '#C62828',
  '#D84343',
  '#f15a5a',
  '#f76161',
  '#e73749'
];
  private readonly DEFAULT_STOP_COLOR = '#2C8FBF';

  constructor() {
    effect(() => {
      const routes = this.routeHighlight.routes();

      if (!this.dataReady) {
        return;
      }

      if (routes.length > 0) {
        if (routes.length === 1) {
          this.renderHighlightedRoute(routes[0]);
        } else {
          this.renderHighlightedRoutes(routes);
        }

        this.routeActive.set(true);
      } else {
        this.clearHighlight();
        this.routeActive.set(false);
      }
    });
  }

  ngOnInit() {
    this.map = L.map('stop-map-container').setView([40.85, 14.27], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.allStopsLayer   = L.layerGroup().addTo(this.map);
    this.nearbyStopsLayer = L.layerGroup().addTo(this.map);
    this.linesLayer       = L.layerGroup().addTo(this.map);
    this.poiLayer         = L.layerGroup().addTo(this.map);
    this.highlightLayer   = L.layerGroup().addTo(this.map);

    forkJoin({
      stops: this.stopService.findAll(),
      lines: this.lineService.findAll(),
      pois:  this.poiService.findAll()
    }).subscribe({
      next: ({ stops, lines, pois }) => {
        lines.forEach(line => this.linesById.set(line.id!, line));
        stops.forEach(stop => {
          this.stopsById.set(stop.id!, stop);
          this.addStopMarker(stop, this.allStopsLayer);
        });
        lines.forEach(line => this.drawLine(line));
        pois.forEach(poi => this.addPoiMarker(poi));
        this.dataReady = true;
        const pending = this.routeHighlight.routes();

        if (pending.length > 0) {

            if (pending.length === 1) {
                this.renderHighlightedRoute(pending[0]);
            } else {
                this.renderHighlightedRoutes(pending);
            }

            this.routeActive.set(true);
        }
      },
      error: err => console.error(err)
    });

    this.geolocationService.getCurrentPosition().subscribe({
      next: pos => {
        this.map.setView([pos.coords.latitude, pos.coords.longitude], 15);
        L.marker([pos.coords.latitude, pos.coords.longitude], { icon: userIcon })
          .addTo(this.map).bindPopup('Sei qui');
        const search: AreaSearch = { lat: pos.coords.latitude, lon: pos.coords.longitude, area: 500 };
        this.stopService.findNearbyStops(search).subscribe(stops => {
          stops.forEach(stop => this.addStopMarker(stop, this.nearbyStopsLayer));
        });
      },
      error: () => {} // geolocation might be denied — silent fail
    });
  }

  /**
   * Regular stop markers: small, unobtrusive circle markers (same style as
   * the highlighted-route stops) tinted with the color of the first line
   * serving that stop, instead of the big default Leaflet pin.
   */
  private addStopMarker(stop: Stop, layer: L.LayerGroup) {
    const color = this.colorForStop(stop);
    L.circleMarker([stop.lat, stop.lon], {
      radius: 5,
      color,
      weight: 2,
      fillColor: '#fff',
      fillOpacity: 1,
    }).addTo(layer).bindPopup(
      `<strong>${stop.name}</strong>${stop.road ? '<br>' + stop.road : ''}${stop.city ? '<br>' + stop.city : ''}`
    );
  }

  private colorForStop(stop: Stop): string {
    const firstLineId = stop.lineIds?.[0]?.id;
    return firstLineId != null ? this.colorForLine(firstLineId) : this.DEFAULT_STOP_COLOR;
  }

  private addPoiMarker(poi: PointOfInterest) {
    const marker = L.marker([poi.lat, poi.lon], { icon: poiIcon }).addTo(this.poiLayer);
    const category = poi.category ? `<br><small>${poi.category}</small>` : '';
    marker.bindPopup(`<strong>${poi.name}</strong>${category}<br><button class="lf-btn" onclick="window.neapolisPoiClick(${poi.id})">📍 Vedi percorso</button>`);
    marker.on('click', () => this.onPoiClick(poi));
  }

  private onPoiClick(poi: PointOfInterest) {
    this.searchError.set(null);
    this.searching.set(true);
    this.geolocationService.getCurrentPosition().subscribe({
      next: pos => {
        const req: PoiSearchRequest = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          poiId: poi.id!,
          searchByArrival: false,
        };
        this.poiService.findRouteToPoi(req).subscribe({
          next: legs => {
            this.searching.set(false);
            if (legs?.length) {
              this.routeHighlight.setResult(legs);
            } else {
              this.searchError.set('Nessun percorso trovato per questo POI.');
            }
          },
          error: () => {
            this.searching.set(false);
            this.searchError.set('Errore nella ricerca del percorso.');
          }
        });
      },
      error: () => {
        this.searching.set(false);
        this.searchError.set('Attiva la geolocalizzazione per trovare il percorso.');
      }
    });
  }

  clearRoute() {
    this.routeHighlight.clear();
    this.searchError.set(null);
  }

  private drawLine(line: Line) {
    if (!line.stopIds || line.stopIds.length < 2) return;
    const ordered = [...line.stopIds].sort((a, b) => a.delta - b.delta)
      .map(e => this.stopsById.get(e.id)).filter((s): s is Stop => !!s);
    if (ordered.length < 2) return;
    L.polyline(ordered.map(s => [s.lat, s.lon] as L.LatLngExpression), {
      color: this.colorForLine(line.id!), weight: 3, opacity: 0.6
    }).addTo(this.linesLayer).bindPopup(line.name);
  }

  private colorForLine(id: number): string {
    return `hsl(${(id * 47) % 360}, 65%, 45%)`;
  }

  private renderHighlightedRoute(legs: RouteLeg[]) {
    this.highlightLayer.clearLayers();
    // Hide all stops — only show route stops
    this.map.removeLayer(this.allStopsLayer);
    this.map.removeLayer(this.nearbyStopsLayer);

    const highlightedIds = new Set<number>();
    const bounds: L.LatLngExpression[] = [];

    legs.forEach(leg => {
      const line = this.linesById.get(leg.lineId);
      if (!line?.stopIds?.length) return;
      const orderedIds = [...line.stopIds].sort((a, b) => a.delta - b.delta).map(e => e.id);
      const fromIdx = orderedIds.indexOf(leg.fromStopId);
      const toIdx   = orderedIds.indexOf(leg.toStopId);
      if (fromIdx === -1 || toIdx === -1) return;
      const [start, end] = fromIdx <= toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
      const segIds = orderedIds.slice(start, end + 1);
      const path: L.LatLngExpression[] = [];
      segIds.forEach(id => {
        const s = this.stopsById.get(id);
        if (!s) return;
        highlightedIds.add(id);
        path.push([s.lat, s.lon]);
      });
      if (path.length >= 2) {
        L.polyline(path, { color: this.ROUTE_COLORS[0], weight: 6, opacity: 0.9 })
          .addTo(this.highlightLayer).bindPopup(`<strong>${leg.lineName}</strong><br>${leg.fromStopName} → ${leg.toStopName}`);
        bounds.push(...path);
      }
    });

    highlightedIds.forEach(id => {
      const s = this.stopsById.get(id);
      if (!s) return;
      L.circleMarker([s.lat, s.lon], {
        radius: 8, color: this.ROUTE_COLORS[0],
        fillColor: '#fff', fillOpacity: 1, weight: 3
      }).addTo(this.highlightLayer).bindPopup(s.name);
    });

    if (bounds.length) this.map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
  }

  private renderHighlightedRoutes(routes: RouteLeg[][]) {

    this.highlightLayer.clearLayers();

    this.map.removeLayer(this.allStopsLayer);
    this.map.removeLayer(this.nearbyStopsLayer);

    const highlightedStops = new Set<number>();
    const bounds: L.LatLngExpression[] = [];

    routes.forEach((legs, routeIndex) => {

      const color =
        this.ROUTE_COLORS[
          Math.min(routeIndex, this.ROUTE_COLORS.length - 1)
        ];

      const weight = routeIndex === 0 ? 7 : 5;

      legs.forEach(leg => {

        const line = this.linesById.get(leg.lineId);

        if (!line?.stopIds?.length) {
          return;
        }

        const orderedIds = [...line.stopIds]
          .sort((a, b) => a.delta - b.delta)
          .map(e => e.id);

        const from = orderedIds.indexOf(leg.fromStopId);
        const to = orderedIds.indexOf(leg.toStopId);

        if (from === -1 || to === -1) {
          return;
        }

        const start = Math.min(from, to);
        const end = Math.max(from, to);

        const path: L.LatLngExpression[] = [];

        orderedIds
          .slice(start, end + 1)
          .forEach(id => {

            const stop = this.stopsById.get(id);

            if (!stop) {
              return;
            }

            highlightedStops.add(id);

            path.push([stop.lat, stop.lon]);
          });

        if (path.length >= 2) {

          L.polyline(path, {
            color,
            weight,
            opacity: 0.9
          })
          .addTo(this.highlightLayer)
          .bindPopup(
            `<strong>Option ${routeIndex + 1}</strong><br>${leg.lineName}<br>${leg.fromStopName} → ${leg.toStopName}`
          );

          bounds.push(...path);
        }

      });

    });

    highlightedStops.forEach(id => {

      const stop = this.stopsById.get(id);

      if (!stop) {
        return;
      }

      L.circleMarker([stop.lat, stop.lon], {
        radius: 8,
        color: '#333',
        fillColor: '#fff',
        fillOpacity: 1,
        weight: 2
      })
      .addTo(this.highlightLayer)
      .bindPopup(stop.name);

    });

    if (bounds.length) {
      this.map.fitBounds(
        L.latLngBounds(bounds),
        { padding: [40, 40] }
      );
    }

  }

  private clearHighlight() {
    this.highlightLayer.clearLayers();
    if (!this.map.hasLayer(this.allStopsLayer))   this.map.addLayer(this.allStopsLayer);
    if (!this.map.hasLayer(this.nearbyStopsLayer)) this.map.addLayer(this.nearbyStopsLayer);
  }
}
