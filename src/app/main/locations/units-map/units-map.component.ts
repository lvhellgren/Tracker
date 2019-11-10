import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UnitsMapService } from './units-map.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../../sevices/global';
import { DeviceEvent, UnitService } from '../unit.service';

interface MarkerEvent extends DeviceEvent {
  iconUrl?: {};
  animation?: string;
}

@Component({
  templateUrl: './units-map.component.html',
  styleUrls: ['./units-map.component.css']
})
export class UnitsMapComponent implements OnInit, OnDestroy {
  mapSubscription: Subscription;
  items: MarkerEvent[] = [];
  latitude = 0;
  longitude = 0;
  zoom = 4;

  colorSelected = 'red';
  colorUnselected = 'blue';

  constructor(public unitService: UnitService,
              private mapService: UnitsMapService,
              private global: GlobalService,
              private router: Router) {
  }

  ngOnInit() {
    this.mapSubscription = this.mapService.mapUpdates$.subscribe(
      items => {
        this.items = items;
        this.setMarkerIcons(true);
      });
  }

  ngOnDestroy(): void {
    if (this.mapSubscription) {
      this.mapSubscription.unsubscribe();
    }
  }

  setMarkerIcons(bounceSelected: boolean) {
    this.items.forEach((markerEvent: MarkerEvent) => {
      let icon = null;
      let animation = null;

      if ((!!markerEvent.isLastMove && this.unitService.currentDeviceEvent &&
        this.unitService.currentDeviceEvent.deviceId === markerEvent.deviceId) ||
        this.unitService.currentDeviceEvent && this.unitService.currentDeviceEvent.documentId === markerEvent.documentId) {
        icon = this.getIcon(this.colorSelected, markerEvent.bearingForward);
        if (bounceSelected) {
          animation = 'BOUNCE';
          this.stopAnimation(markerEvent);
        }
      } else {
        icon = this.getIcon(this.colorUnselected, markerEvent.bearingForward);
      }

      markerEvent.iconUrl = icon;
      markerEvent.animation = animation;

      if (!markerEvent.deviceName && this.unitService.currentDeviceEvent) {
        markerEvent.deviceName = this.unitService.currentDeviceEvent.deviceName;
      }
    });
  }

  stopAnimation(item) {
    setTimeout(() => {
      item.animation = null;
    }, 1000);
  }

  onMarkerClick(markerEvent: MarkerEvent) {
    this.unitService.currentDeviceEvent = markerEvent;
    this.setMarkerIcons(false);
  }

  // Marker dblclick is currently (v 1.0.0-beta.7) not supported by agm
  onMarkerDblClick(markerEvent: MarkerEvent) {
    let page: string;
    let id: string;
    if (!!markerEvent.isLastMove) {
      page = 'unit-history';
      id = markerEvent.deviceId;
      this.unitService.currentDeviceEvent = markerEvent;
    } else {
      page = 'unit-details';
      id = markerEvent.documentId;
      this.unitService.currentDeviceEvent = markerEvent;
    }
    this.setMarkerIcons(false);
    this.router.navigate([`/locations/${this.global.currentWidth}/${page}`, id]);
  }

  onMapClick(loc) {
    console.log('lat: ' + loc.coords.lat + ', lng: ' + loc.coords.lng);
  }

  onMouseOver(infoWindow) {
    infoWindow.open();
  }

  onMouseOut(infoWindow) {
    infoWindow.close();
  }

  bearingToIconName(bearing: number): string {
    let hour = '';
    let type = 'arrow19_';
    if (bearing) {
      let clockValue: number;
      if (bearing < 0) {
        bearing = 360 + bearing;
      }
      clockValue = Math.floor(bearing / 30);
      if (bearing % 30 >= 15) {
        clockValue++;
      }
      hour = String(clockValue).padStart(2, '0');
    } else {
      type = 'dot19';
    }
    return type + hour;
  }

  getIcon(color: string, bearing: number): any {
    const url = `/assets/${color}_${this.bearingToIconName(bearing)}.png`;
    return {url: url};
  }
}
