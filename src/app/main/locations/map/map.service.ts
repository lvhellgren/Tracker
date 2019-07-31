import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Address } from '../unit.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  /**
   * A Subject acts as both observable and observer (consumer).
   * @type {Subject<any[]>}
   */
  private source = new BehaviorSubject<any[]>([]);

  /**
   * Subscribe to mapUpdates$ to process notifications of when to update the map view.
   * Note that, when a Subject acts as an observer all subscribers get the same data multicasted.
   * @type {Observable<any[]>}
   */
  mapUpdates$ = this.source.asObservable();

  /**
   * Makes the subject deliver notifications to the observers.
   * @param {T[]} markers
   */
  setMarkers<T>(markers: T[]) {
    this.source.next(markers);
  }
}
