import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DeviceEvent } from '../unit.service';

@Injectable({
  providedIn: 'root'
})
export class UnitsMapService {
  /**
   * A Subject acts as both observable and observer (consumer).
   * @type {Subject<DeviceEvent[]>}
   */
  private source = new BehaviorSubject<DeviceEvent[]>([]);

  /**
   * Subscribe to mapUpdates$ to process notifications of when to update the map view.
   * Note that, when a Subject acts as an observer all subscribers get the same data multicast.
   * @type {Observable<any[]>}
   */
  mapUpdates$ = this.source.asObservable();

  /**
   * Makes the subject deliver notifications to the observers.
   */
  setMarkers<T>(markers: DeviceEvent[]) {
    this.source.next(markers);
  }
}
