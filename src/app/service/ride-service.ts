import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import RideData from '../model/ride-data';
import RideSearchRequest from '../model/ride-search-request';
import RouteLeg from '../model/route-leg';

@Injectable({
  providedIn: 'root'
})
export class RideService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/neapolis/api/ridedata';


  findAll(): Observable<RideData[]> {
    return this.http.get<RideData[]>(this.apiUrl);
  }

  findById(id: number): Observable<RideData> {
    return this.http.get<RideData>(`${this.apiUrl}/${id}`);
  }

  save(rideData: RideData): Observable<RideData> {
    return this.http.post<RideData>(this.apiUrl, rideData);
  }

  update(id: number, rideData: RideData): Observable<RideData> {
    return this.http.put<RideData>(`${this.apiUrl}/${id}`, rideData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchRideByTime(rideSearch: RideSearchRequest): Observable<RouteLeg[]> {
    return this.http.post<RouteLeg[]>(
      `${this.apiUrl}/rideinfo`,
      rideSearch
    );
  }

  searchRideOptions(rideSearch: RideSearchRequest): Observable<RouteLeg[][]> {
    return this.http.post<RouteLeg[][]>(
      `${this.apiUrl}/rideoptions`,
      rideSearch
    );
  }

}