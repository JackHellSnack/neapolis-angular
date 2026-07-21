import { Component, OnInit, inject } from '@angular/core';
import * as L from 'leaflet';
import { StopService } from '../../service/stop-service';

@Component({
  selector: 'app-stop-map',
  templateUrl: './stop-map.html',
  styleUrl: './stop-map.css'
})
export class StopMap implements OnInit {
  private stopService = inject(StopService);
  private map!: L.Map;
  
  ngOnInit() {
    this.map = L.map('map').setView([40.85, 14.26], 13); // Napoli coord default

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.stopService.findAll().subscribe(stops => {
      stops.forEach(stop => {
        L.marker([stop.lat, stop.lon])
          .addTo(this.map)
          .bindPopup(stop.name);
      });
    });
  }
}