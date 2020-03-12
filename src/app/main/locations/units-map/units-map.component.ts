import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { UnitsMapService } from './units-map.service';
import { DeviceEvent } from '../unit.service';
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

  private accountChange: Subscription;
  private mapUpdate: Subscription;
  private markerUpdate: Subscription;
  private map;
  private markers: Map<string, any>;
  private bounds: LatLngBoundsLiteral;

  constructor(private authService: AuthService,
              private datePipe: DatePipe,
              private mapmarkerService: MapmarkerService,
              private mapService: UnitsMapService) {
  }

  ngOnInit() {
    // Get default marker icon for the current account:
    this.accountChange = this.authService.userAccountSelect.subscribe(accountId => {
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
    this.mapUpdate = this.mapService.mapUpdates$.subscribe((deviceEvents: DeviceEvent[]) => {
      if (deviceEvents.length > 0) {
        this.createMap(deviceEvents);
      }
    });

    // Identify the marker for the selected row:
    this.markerUpdate = this.mapService.tableRowSelect$.subscribe((deviceEvent: DeviceEvent) => {
      this.map.fitBounds(this.bounds);
      this.bounce(this.markers.get(deviceEvent.documentId));
    });
  }

  ngOnDestroy(): void {
    if (this.mapUpdate) {
      this.mapUpdate.unsubscribe();
    }
    if (this.markerUpdate) {
      this.markerUpdate.unsubscribe();
    }
    if (this.accountChange) {
      this.accountChange.unsubscribe();
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
          icon: icon
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
          map.setCenter(marker.getPosition());
        });

        marker.addListener('dblclick', () => {
          console.log('dblclick id: ' + marker.getTitle());
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
    marker.setAnimation(1);
    setTimeout(() => {
      marker.setAnimation(null);
    }, 2000);
  }

  timestampToDate(ts) {
    let date: Date;
    if (ts) {
      date = ts.toDate();
    }
    return date;
  }
}
