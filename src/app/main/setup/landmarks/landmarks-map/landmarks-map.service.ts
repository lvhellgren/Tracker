import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LandmarksMapService {

  // Landmarks to be shown on the map
  private landmarks = new Subject<any>();
  landmarks$ = this.landmarks.asObservable();

  setLandmarks<T>(landmarks: T[]) {
    this.landmarks.next(landmarks);
  }
}
