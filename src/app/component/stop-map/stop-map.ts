import { Component, OnInit, inject } from '@angular/core';
import * as L from 'leaflet';
import { StopService } from '../../service/stop-service';
import { GeolocationService } from '../../service/geolocation-service';
import { AreaSearch } from '../../model/area-search';

@Component({
  selector: 'app-stop-map',
  templateUrl: './stop-map.html',
  styleUrl: './stop-map.css'
})
export class StopMap implements OnInit {
  private stopService = inject(StopService);
  private geolocationService = inject(GeolocationService);
  private map!: L.Map;

  ngOnInit() {

  this.map = L.map('map');

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(this.map);

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
        stops.forEach(stop => {
          L.marker([stop.lat, stop.lon])
            .addTo(this.map)
            .bindPopup(stop.name);
        });
      });

    },
    error: err => console.error(err)
  });
}
}