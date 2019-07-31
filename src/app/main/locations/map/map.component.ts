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

  iconUrl = {url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|ff6347'};

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
        this.setMarkerIcons();
      });
  }

  ngOnDestroy(): void {
    if (this.mapSubscription) {
      this.mapSubscription.unsubscribe();
    }
  }

  setMarkerIcons() {
    this.items.forEach((item: StepDoc) => {
      let icon = {url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|ff6347'};
      const selectIcon = {url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|3f51b5'};
      if (item.type && item.type === 'last-step') {
        if (this.unitService.currentUnit && this.unitService.currentUnit.deviceId === item.deviceId) {
          icon = selectIcon;
        }
      } else {
        if (this.unitService.currentUnitStep && this.unitService.currentUnitStep.documentId === item.documentId) {
          icon = selectIcon;
        }
      }
      item.iconUrl = icon;

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
    this.setMarkerIcons();
  }

  // Marker dblclick is currently not supported by agm
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
    this.setMarkerIcons();
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
}
