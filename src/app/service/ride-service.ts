import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RideData } from '../model/ride-data';

@Service()
export class RideService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080//neapolis/api/lines';

  searchByDepartureTime(time: string, stopId: number): Observable<RideData[]> {
    return this.http.get<RideData[]>(`${this.apiUrl}/rideinfo`, {
      params: { departureTime: time, stopId: stopId.toString() }
    });
  }

  searchByArrivalTime(time: string, stopId: number): Observable<RideData[]> {
    return this.http.get<RideData[]>(`${this.apiUrl}/rideinfo`, {
      params: { arrivalTime: time, stopId: stopId.toString() }
    });
  }
}