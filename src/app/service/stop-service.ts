
// src/app/service/stop-service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import Stop from '../model/stop';
import { AreaSearch } from '../model/area-search';

@Injectable({ providedIn: 'root' })
export class StopService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/neapolis/api';

    findNearbyStops(dto: AreaSearch): Observable<Stop[]> {
        return this.http.post<Stop[]>(`${this.apiUrl}/stops/nearby`, dto);
    }

    findAll(): Observable<Stop[]> {
        return this.http.get<Stop[]>(`${this.apiUrl}/stops`);
    }

    save(stop: Partial<Stop>): Observable<Stop> {
        return this.http.post<Stop>(`${this.apiUrl}/stops`, stop);
    }
}