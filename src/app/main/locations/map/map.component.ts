import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MapService } from './map.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../../sevices/global';
import { StepDoc, UnitService } from '../unit.service';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy {
  mapSubscription: Subscription;
  items: any[] = [];
  latitude = 0;
  longitude = 0;
  zoom = 4;

  iconDir = '../../../../assets/';
  colorSelected = 'red';
  colorUnselected = 'blue';

  constructor(public unitService: UnitService,
              private mapService: MapService,
              private global: GlobalService,
              private router: Router,
              private route: ActivatedRoute) {
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
    this.items.forEach((item: StepDoc) => {
      let icon = null;
      const selectIcon = {url: `${this.iconDir}red_dot19.png`};
      let animation = null;
      if (item.type && item.type === 'last-step') {
        if (this.unitService.currentUnit && this.unitService.currentUnit.deviceId === item.deviceId) {
          icon = this.getIcon(this.colorSelected, item.bearingForward);
          if (bounceSelected) {
            animation = 'BOUNCE';
          }
        } else {
          icon = this.getIcon(this.colorUnselected, item.bearingForward);
        }
      } else {
        if (this.unitService.currentUnitStep && this.unitService.currentUnitStep.documentId === item.documentId) {
          icon = this.getIcon(this.colorSelected, item.bearingForward);
          if (bounceSelected) {
            animation = 'BOUNCE';
          }
        } else {
          icon = this.getIcon(this.colorUnselected, item.bearingForward);
        }
      }
      item.iconUrl = icon;
      item.animation = animation;

      if (!item.name && this.unitService.currentUnit) {
        item.name = this.unitService.currentUnit.name;
      }
    });
  }

  onMarkerClick(item: StepDoc) {
    let page: string;
    let id: string;
    if (item.type && item.type === 'last-step') {
      page = 'unit-history';
      id = item.deviceId;
      this.unitService.currentUnit = item;
    } else {
      page = 'unit-details';
      id = item.documentId;
      this.unitService.currentUnitStep = item;
    }
    this.setMarkerIcons(false);
  }

  // Marker dblclick is currently (v 1.0.0-beta.7) not supported by agm
  onMarkerDblClick(item: StepDoc) {
    let page: string;
    let id: string;
    if (item.type && item.type === 'last-step') {
      page = 'unit-history';
      id = item.deviceId;
      this.unitService.currentUnit = item;
    } else {
      page = 'unit-details';
      id = item.documentId;
      this.unitService.currentUnitStep = item;
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
    const url = `${this.iconDir}${color}_${this.bearingToIconName(bearing)}.png`;
    return {url: url};
  }
}
