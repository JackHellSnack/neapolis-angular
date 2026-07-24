import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import PointOfInterest from '../model/point-of-interest';
import { AreaSearch } from '../model/area-search';
import RouteLeg from '../model/route-leg';
import PoiSearchRequest from '../model/poi-search-request';

@Injectable({ providedIn: 'root' })
export class PointOfInterestService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/neapolis/api/poi';

  findAll(): Observable<PointOfInterest[]> {
    return this.http.get<PointOfInterest[]>(this.apiUrl);
  }

  save(poi: PointOfInterest): Observable<PointOfInterest> {
    return this.http.post<PointOfInterest>(this.apiUrl, poi);
  }

  findNearby(dto: AreaSearch): Observable<PointOfInterest[]> {
    return this.http.post<PointOfInterest[]>(`${this.apiUrl}/nearby`, dto);
  }

  findRouteToPoi(dto: PoiSearchRequest): Observable<RouteLeg[]> {
    return this.http.post<RouteLeg[]>(`${this.apiUrl}/route`, dto);
  }

  findRouteOptionsToPoi(dto: PoiSearchRequest): Observable<RouteLeg[][]> {
    return this.http.post<RouteLeg[][]>(`${this.apiUrl}/routeoptions`, dto);
  }
  
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}