import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import RouteLeg from '../model/route-leg';
import JourneyStatus from '../model/journey-status';

export interface JourneyPingDto {
  lat: number;
  lon: number;
}

@Injectable({ providedIn: 'root' })
export class JourneyService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/neapolis/api/journey';

  start(legs: RouteLeg[]): Observable<JourneyStatus> {
    return this.http.post<JourneyStatus>(`${this.apiUrl}/start`, legs);
  }

  ping(lat: number, lon: number): Observable<JourneyStatus> {
    const dto: JourneyPingDto = { lat, lon };
    return this.http.post<JourneyStatus>(`${this.apiUrl}/ping`, dto);
  }

  getStatus(): Observable<JourneyStatus> {
    return this.http.get<JourneyStatus>(`${this.apiUrl}/status`);
  }

  end(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}