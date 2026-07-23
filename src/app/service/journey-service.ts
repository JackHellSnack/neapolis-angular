import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import RouteLeg from '../model/route-leg';

export interface JourneyPingDto {
  lat: number;
  lon: number;
}

@Injectable({ providedIn: 'root' })
export class JourneyService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/neapolis/api/journey';

  start(legs: RouteLeg[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/start`, legs);
  }

  ping(lat: number, lon: number): Observable<any> {
    const dto: JourneyPingDto = { lat, lon };
    return this.http.post<any>(`${this.apiUrl}/ping`, dto);
  }

  getStatus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/status`);
  }

  end(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}
