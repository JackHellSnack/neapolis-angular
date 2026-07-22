import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import  RideData  from '../model/ride-data';
import RideSearch from '../model/ride-search';

@Service()
export class RideService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/neapolis/api/ridedata';

  searchRideByTime(rideSearch: RideSearch): Observable<RideData[]> {
    return this.http.post<RideData[]>(
      `${this.apiUrl}/rideinfo`,
      rideSearch
    );
  }
}