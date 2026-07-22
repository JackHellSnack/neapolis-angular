import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import Line from '../model/line';

@Injectable({
  providedIn: 'root'
})
export class LineService {

  // Modern Angular dependency injection
  private http = inject(HttpClient);

  // Spring Boot backend endpoint
  private apiUrl = 'http://localhost:8080/neapolis/api/lines';

  /**
   * Retrieves all lines (GET)
   */
  findAll(): Observable<Line[]> {
    return this.http.get<Line[]>(this.apiUrl);
  }

  /**
   * Retrieves a single line by ID (GET)
   */
  findById(id: number): Observable<Line> {
    return this.http.get<Line>(`${this.apiUrl}/${id}`);
  }

  /**
   * Creates a new line (POST)
   */
  save(line: Line): Observable<Line> {
    return this.http.post<Line>(this.apiUrl, line);
  }

  /**
   * Updates an existing line by ID (PUT)
   */
  update(id: number, line: Line): Observable<Line> {
    return this.http.put<Line>(`${this.apiUrl}/${id}`, line);
  }

  /**
   * Deletes a line by ID (DELETE)
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}