import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import RideSearchRequest from '../model/ride-search-request';
import RouteLeg from '../model/route-leg';


@Injectable({
  providedIn: 'root'
})
export class RideService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/neapolis/api/ridedata';



  searchRideByTime(rideSearch: RideSearchRequest): Observable<RouteLeg[]> {
  return this.http.post<RouteLeg[]>(`${this.apiUrl}/rideinfo`, rideSearch);
}

}