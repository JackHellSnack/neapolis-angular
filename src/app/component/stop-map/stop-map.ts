import * as L from 'leaflet';

// Fix default marker icon paths broken by Angular's bundler
const iconDefault = L.icon({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

import { Component, OnInit, inject, effect } from '@angular/core';
import { forkJoin } from 'rxjs';
import { StopService } from '../../service/stop-service';
import { GeolocationService } from '../../service/geolocation-service';
import { LineService } from '../../service/line-service';
import { RouteHighlightService } from '../../service/route-highlight-service';
import { AreaSearch } from '../../model/area-search';
import Stop from '../../model/stop';
import Line from '../../model/line';
import RouteLeg from '../../model/route-leg';

@Component({
  selector: 'app-stop-map',
  templateUrl: './stop-map.html',
  styleUrl: './stop-map.css'
})
export class StopMap implements OnInit {

  private stopService = inject(StopService);
  private geolocationService = inject(GeolocationService);
  private lineService = inject(LineService);
  private routeHighlight = inject(RouteHighlightService);

  private map!: L.Map;

  private allStopsLayer!: L.LayerGroup;
  private nearbyStopsLayer!: L.LayerGroup;
  private linesLayer!: L.LayerGroup;
  private highlightLayer!: L.LayerGroup;

  // Lookup used to resolve a stopId (from Line.stopIds) to its coordinates
  private stopsById = new Map<number, Stop>();
  private linesById = new Map<number, Line>();
  private dataReady = false;

  private readonly HIGHLIGHT_COLOR = '#E4703A'; // brand "maiolica" orange

  constructor() {
    // Reacts if a search result arrives/changes while this component is already mounted
    effect(() => {
      const legs = this.routeHighlight.legs();
      if (legs && this.dataReady) {
        this.renderHighlightedRoute(legs);
      }
    });
  }

  ngOnInit() {

    this.map = L.map('map').setView([40.85, 14.27], 13); // fallback view (e.g. Naples) until geolocation resolves

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.allStopsLayer = L.layerGroup().addTo(this.map);
    this.nearbyStopsLayer = L.layerGroup().addTo(this.map);
    this.linesLayer = L.layerGroup().addTo(this.map);
    this.highlightLayer = L.layerGroup().addTo(this.map);

    // Fetch stops and lines together: we need every stop's coordinates
    // resolved BEFORE we try to draw any line, otherwise stopsById lookups
    // inside drawLine() would fail.
    forkJoin({
      stops: this.stopService.findAll(),
      lines: this.lineService.findAll()
    }).subscribe({
      next: ({ stops, lines }) => {
        stops.forEach(stop => {
          this.stopsById.set(stop.id!, stop);
          this.addStopMarker(stop, this.allStopsLayer);
        });

        lines.forEach(line => {
          this.linesById.set(line.id!, line);
          this.drawLine(line);
        });

        this.dataReady = true;

        // If a search happened before the map finished loading its base data,
        // render it now that we have everything we need.
        const pendingLegs = this.routeHighlight.legs();
        if (pendingLegs) {
          this.renderHighlightedRoute(pendingLegs);
        }
      },
      error: err => console.error(err)
    });

    this.geolocationService.getCurrentPosition().subscribe({
      next: position => {

        this.map.setView(
          [position.coords.latitude, position.coords.longitude],
          15
        );

        L.marker([position.coords.latitude, position.coords.longitude])
          .addTo(this.map)
          .bindPopup('You are here');

        const search: AreaSearch = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          area: 500
        };

        this.stopService.findNearbyStops(search).subscribe(stops => {
          stops.forEach(stop => this.addStopMarker(stop, this.nearbyStopsLayer));
        });

      },
      error: err => console.error(err)
    });
  }

  private addStopMarker(stop: Stop, layer: L.LayerGroup) {
    L.marker([stop.lat, stop.lon])
      .addTo(layer)
      .bindPopup(this.buildStopPopup(stop));
  }

  private buildStopPopup(stop: Stop): string {
    const lines = [`<strong>${stop.name}</strong>`];

    if (stop.road) {
      lines.push(stop.road);
    }
    if (stop.city) {
      lines.push(stop.city);
    }

    return lines.join('<br>');
  }

  /**
   * Draws a single polyline connecting the stops of a line, in order.
   *
   * Line.stopIds is a MapIdDelta[]: { id: stopId, delta: distance from origin }.
   * Sorting by delta reconstructs the correct order of stops along the line
   * (assumes a simple, non-branching line). Leaflet's polyline then connects
   * each consecutive pair only — stop[i] to stop[i+1] and stop[i] to stop[i-1] —
   * so no stop ends up connected to anything other than its immediate neighbors.
   */
  private drawLine(line: Line) {
    if (!line.stopIds || line.stopIds.length < 2) {
      return; // nothing to connect
    }

    const orderedStops = [...line.stopIds]
      .sort((a, b) => a.delta - b.delta)
      .map(entry => this.stopsById.get(entry.id))
      .filter((s): s is Stop => !!s); // drop any stopId we couldn't resolve

    if (orderedStops.length < 2) {
      return;
    }

    const path: L.LatLngExpression[] = orderedStops.map(s => [s.lat, s.lon]);

    L.polyline(path, {
      color: this.colorForLine(line.id!),
      weight: 4,
      opacity: 0.7
    })
      .addTo(this.linesLayer)
      .bindPopup(line.name);
  }

  /**
   * Deterministic, distinct-ish color per line id, so different lines
   * are visually distinguishable without needing a color field from the backend.
   */
  private colorForLine(id: number): string {
    const hue = (id * 47) % 360;
    return `hsl(${hue}, 70%, 45%)`;
  }

  /**
   * Draws the searched route: every leg's line segment (sliced between
   * fromStopId and toStopId, following the line's actual stop order) in one
   * highlight color, plus circle markers on every stop the route passes through.
   */
  private renderHighlightedRoute(legs: RouteLeg[]): void {
    this.highlightLayer.clearLayers();

    const highlightedStopIds = new Set<number>();
    const bounds: L.LatLngExpression[] = [];

    legs.forEach(leg => {
      const line = this.linesById.get(leg.lineId);
      if (!line?.stopIds?.length) return;

      const orderedIds = [...line.stopIds]
        .sort((a, b) => a.delta - b.delta)
        .map(entry => entry.id);

      const fromIdx = orderedIds.indexOf(leg.fromStopId);
      const toIdx = orderedIds.indexOf(leg.toStopId);
      if (fromIdx === -1 || toIdx === -1) return;

      const [start, end] = fromIdx <= toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
      const segmentIds = orderedIds.slice(start, end + 1);

      const path: L.LatLngExpression[] = [];
      segmentIds.forEach(id => {
        const stop = this.stopsById.get(id);
        if (!stop) return;
        highlightedStopIds.add(id);
        path.push([stop.lat, stop.lon]);
      });

      if (path.length >= 2) {
        L.polyline(path, {
          color: this.HIGHLIGHT_COLOR,
          weight: 6,
          opacity: 0.9
        })
          .addTo(this.highlightLayer)
          .bindPopup(leg.lineName);

        bounds.push(...path);
      }
    });

    highlightedStopIds.forEach(id => {
      const stop = this.stopsById.get(id);
      if (!stop) return;

      L.circleMarker([stop.lat, stop.lon], {
        radius: 9,
        color: this.HIGHLIGHT_COLOR,
        fillColor: this.HIGHLIGHT_COLOR,
        fillOpacity: 0.9,
        weight: 2
      })
        .addTo(this.highlightLayer)
        .bindPopup(stop.name);
    });

    if (bounds.length) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
    }
  }
}