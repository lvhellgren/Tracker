import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DeviceEvent } from '../unit.service';

@Injectable({
  providedIn: 'root'
})
export class UnitsMapService {
  private mapUpdates = new BehaviorSubject<DeviceEvent[]>([]);
  public mapUpdates$ = this.mapUpdates.asObservable();

  private tableRowSelect = new Subject<DeviceEvent>();
  public tableRowSelect$ = this.tableRowSelect.asObservable();

  /**
   * Issues map update notifications to observers of tableRowSelect$.
   */
  public updateMap<T>(deviceEvents: DeviceEvent[]) {
    this.mapUpdates.next(deviceEvents);
  }

  /**
   * Issues table row selected notifications to observers of tableRowSelect$.
   */
  public tableRowSelected<T>(deviceEvent: DeviceEvent) {
    this.tableRowSelect.next(deviceEvent);
  }
}
