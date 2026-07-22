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

import { Component, OnInit, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { StopService } from '../../service/stop-service';
import { GeolocationService } from '../../service/geolocation-service';
import { LineService } from '../../service/line-service';
import { AreaSearch } from '../../model/area-search';
import Stop from '../../model/stop';
import Line from '../../model/line';

@Component({
  selector: 'app-stop-map',
  templateUrl: './stop-map.html',
  styleUrl: './stop-map.css'
})
export class StopMap implements OnInit {

  private stopService = inject(StopService);
  private geolocationService = inject(GeolocationService);
  private lineService = inject(LineService);

  private map!: L.Map;

  private allStopsLayer!: L.LayerGroup;
  private nearbyStopsLayer!: L.LayerGroup;
  private linesLayer!: L.LayerGroup;

  // Lookup used to resolve a stopId (from Line.stopIds) to its coordinates
  private stopsById = new Map<number, Stop>();

  ngOnInit() {

    this.map = L.map('map').setView([40.85, 14.27], 13); // fallback view (e.g. Naples) until geolocation resolves

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.allStopsLayer = L.layerGroup().addTo(this.map);
    this.nearbyStopsLayer = L.layerGroup().addTo(this.map);
    this.linesLayer = L.layerGroup().addTo(this.map);

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

        lines.forEach(line => this.drawLine(line));
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
}