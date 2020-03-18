// Copyright (c) 2020 Lars Hellgren (lars@exelor.com).
// All rights reserved.
//
// This code is licensed under the MIT License.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files(the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions :
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DeviceEvent, UnitService } from '../unit.service';
import { BASE_MARKER_ICON, MapmarkerService } from '../../../sevices/mapmarker.service';
import { AuthService } from '../../core/auth/auth.service';
import { DatePipe } from '@angular/common';
import LatLngBoundsLiteral = google.maps.LatLngBoundsLiteral;


@Component({
  templateUrl: './units-map.component.html',
  styleUrls: ['./units-map.component.css']
})
export class UnitsMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer')
  private gMap: ElementRef;

  private accountId: string;
  private defaultMarkerIcon;
  private deviceEvents: DeviceEvent[];

  private accountChangeSubscription: Subscription;
  private mapUpdateSubscription: Subscription;
  private itemSelectSubscription: Subscription;
  private map;
  private markers: Map<string, any>;
  private bounds: LatLngBoundsLiteral;

  constructor(private authService: AuthService,
              private datePipe: DatePipe,
              private unitService: UnitService,
              private mapmarkerService: MapmarkerService) {
  }

  ngOnInit() {
    // Get default marker icon for the current account:
    this.accountChangeSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      this.accountId = accountId;
      this.mapmarkerService.fetchDefaultMapMarkerIcon(accountId)
        .then((snap) => {
          if (snap.exists && !!snap.data().markerIcon) {
            this.defaultMarkerIcon = snap.data().markerIcon;
          } else {
            this.defaultMarkerIcon = BASE_MARKER_ICON;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  ngAfterViewInit() {
    // Draw the map:
    this.mapUpdateSubscription = this.unitService.mapUpdates$.subscribe((deviceEvents: DeviceEvent[]) => {
      if (deviceEvents.length > 0) {
        this.deviceEvents = deviceEvents;
        this.createMap(deviceEvents);
      }
    });

    // Emphasize selected marker icon:
    this.itemSelectSubscription = this.unitService.itemSelect$.subscribe((deviceEvent: DeviceEvent) => {
      if (!!deviceEvent) {
        this.map.fitBounds(this.bounds);
        this.bounce(this.markers.get(deviceEvent.documentId));
      }
    });
  }

  ngOnDestroy(): void {
    if (this.mapUpdateSubscription) {
      this.mapUpdateSubscription.unsubscribe();
    }
    if (this.itemSelectSubscription) {
      this.itemSelectSubscription.unsubscribe();
    }
    if (this.accountChangeSubscription) {
      this.accountChangeSubscription.unsubscribe();
    }
  }

  createMap(deviceEvents: DeviceEvent[]) {
    const mapOptions: google.maps.MapOptions = {
      center: new google.maps.LatLng(deviceEvents[0].latitude, deviceEvents[0].longitude),
    };

    this.map = new google.maps.Map(this.gMap.nativeElement, mapOptions);
    this.markers = new Map();
    this.bounds = {east: -180, north: 0, south: 90, west: 0};

    deviceEvents.forEach((deviceEvent: DeviceEvent) => {
      this.createMarker(deviceEvent, this.map);

      if (deviceEvent.longitude > this.bounds.east) {
        this.bounds.east = deviceEvent.longitude;
      }
      if (deviceEvent.longitude < this.bounds.west) {
        this.bounds.west = deviceEvent.longitude;
      }
      if (deviceEvent.latitude > this.bounds.north) {
        this.bounds.north = deviceEvent.latitude;
      }
      if (deviceEvent.latitude < this.bounds.south) {
        this.bounds.south = deviceEvent.latitude;
      }
    });

    if (deviceEvents.length > 0) {
      this.map.fitBounds(this.bounds);
    }
  }

  createMarker(deviceEvent: DeviceEvent, map: google.maps.Map) {
    const coordinates = new google.maps.LatLng(deviceEvent.latitude, deviceEvent.longitude);

    Promise.all([this.mapmarkerService.getDeviceMarkerIcon(this.accountId, deviceEvent.deviceId)])
      .then(result => {
        let icon;
        if (!!result[0]) {
          icon = result[0];
        } else {
          icon = this.defaultMarkerIcon;
        }

        if (!!deviceEvent.bearingForward) {
          icon['rotation'] = deviceEvent.bearingForward;
        } else {
          icon = this.mapmarkerService.getEndpointMarkerIcon(icon);
        }

        const marker = new google.maps.Marker({
          position: coordinates,
          icon: icon,
          title: deviceEvent.documentId
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
        <div>
          ${deviceEvent.deviceName}<br/>
          ${this.datePipe.transform(this.timestampToDate(deviceEvent.deviceTime), 'MM-dd-yyyy, HH:mm')}
        </div>
        `,
          maxWidth: 300
        });

        marker.addListener('click', () => {
          this.unitService.onItemSelect(this.getEventByDocumentId(this.deviceEvents, marker.getTitle()));
        });

        marker.addListener('dblclick', () => {
          this.unitService.onMarkerDblclick(this.getEventByDocumentId(this.deviceEvents, marker.getTitle()));
        });

        marker.addListener('mouseover', () => {
          infoWindow.open(map, marker);
        });

        marker.addListener('mouseout', () => {
          infoWindow.close();
        });

        this.markers.set(deviceEvent.documentId, marker);
        marker.setMap(this.map);
      });
  }

  bounce(marker) {
    if (!!marker) {
      marker.setAnimation(1);
      setTimeout(() => {
        marker.setAnimation(null);
      }, 2000);
    }
  }

  timestampToDate(ts) {
    let date: Date;
    if (ts) {
      date = ts.toDate();
    }
    return date;
  }

  private getEventByDocumentId(deviceEvents: DeviceEvent[], documentId: string) {
    return deviceEvents.find(event => {
      return event.documentId === documentId;
    });
  }
}
