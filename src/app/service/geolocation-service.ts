import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeolocationService {
  getCurrentPosition(): Observable<GeolocationPosition> {
    return new Observable((observer) => {
      if (!navigator.geolocation) {
        observer.error(new Error('Geolocation is not supported.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          observer.next(position);
          observer.complete();
        },
        (error) => observer.error(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    });
  }

  watchPosition(): Observable<GeolocationPosition> {
    return new Observable((observer) => {
      if (!navigator.geolocation) {
        observer.error(new Error('Geolocation is not supported.'));
        return;
      }

      const watchId = navigator.geolocation.watchPosition(
        (position) => observer.next(position),
        (error) => observer.error(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );

      return () => navigator.geolocation.clearWatch(watchId);
    });
  }
}