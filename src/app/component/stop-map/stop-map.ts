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
import { StopService } from '../../service/stop-service';
import { GeolocationService } from '../../service/geolocation-service';
import { AreaSearch } from '../../model/area-search';
import Stop from '../../model/stop';

@Component({
  selector: 'app-stop-map',
  templateUrl: './stop-map.html',
  styleUrl: './stop-map.css'
})
export class StopMap implements OnInit {
  private stopService = inject(StopService);
  private geolocationService = inject(GeolocationService);
  private map!: L.Map;

  private allStopsLayer!: L.LayerGroup;
  private nearbyStopsLayer!: L.LayerGroup;

  ngOnInit() {

    this.map = L.map('map').setView([40.85, 14.27], 13); // fallback view (e.g. Naples) until geolocation resolves

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.allStopsLayer = L.layerGroup().addTo(this.map);
    this.nearbyStopsLayer = L.layerGroup().addTo(this.map);

    // Plot every stop, regardless of geolocation
    this.stopService.findAll().subscribe({
      next: stops => stops.forEach(stop => this.addStopMarker(stop, this.allStopsLayer)),
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
}