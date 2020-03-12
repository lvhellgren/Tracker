import { Injectable } from '@angular/core';
import * as firebase from 'firebase';


export interface MarkerIcon {
  path?: any;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWeight?: number;
  strokeOpacity?: number;
  scale?: number;
  rotation?: number;
}

export const BASE_MARKER_ICON = {
  path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
  fillColor: 'white',
  fillOpacity: 1,
  strokeColor: 'red',
  strokeWeight: 3,
  strokeOpacity: 1,
  scale: 4,
  rotation: 0
};

export const ACCOUNT_DEVICES = 'account-devices';
export const DEVICE_DEFAULTS_KEY = 'device_defaults';

export const SHAPE_NAMES = [
  {id: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, name: 'Closed Arrow'},
  {id: google.maps.SymbolPath.FORWARD_OPEN_ARROW, name: 'Open Arrow'},
  {id: google.maps.SymbolPath.CIRCLE, name: 'Circle'}
];

@Injectable({
  providedIn: 'root'
})
export class MapmarkerService {
  map: google.maps.Map;

  private deviceId: string;
  private markerIcon;

  static makeAccountDeviceKey(accountId: String, deviceId: string): string {
    return `${accountId}:${deviceId}`;
  }

  constructor() {
  }

  getEndpointMarkerIcon(markerIcon: google.maps.Symbol) {
    let icon: google.maps.Symbol;
    if (markerIcon.path !== google.maps.SymbolPath.CIRCLE) {
      icon = {...markerIcon};
      icon.path = google.maps.SymbolPath.CIRCLE;
      icon.scale = icon.scale * 1.5;
    } else {
      icon = markerIcon;
    }
    return icon;
  }

  async getDeviceMarkerIcon(accountId: string, deviceId: string) {
    if (this.deviceId === deviceId) {
      if (!!this.markerIcon) {
        return this.markerIcon;
      }
    } else {
      this.deviceId = deviceId;
      this.markerIcon = null;
    }
    return await this.fetchDeviceMarkerIcon(accountId, deviceId);
  }

  fetchDeviceMarkerIcon(accountId: string, deviceId: string) {
    const db = firebase.firestore();
    const accountDeviceKey = MapmarkerService.makeAccountDeviceKey(accountId, deviceId);
    return db.collection(ACCOUNT_DEVICES).doc(accountDeviceKey).get()
      .then(snap => {
        let markerIcon;
        if (snap.exists) {
          markerIcon = snap.data().markerIcon;
          this.markerIcon = markerIcon;
        } else {
          markerIcon = null;
        }
        return markerIcon;
      });
  }

  fetchDefaultMapMarkerIcon(accountId: string) {
    const accountDeviceKey = MapmarkerService.makeAccountDeviceKey(accountId, DEVICE_DEFAULTS_KEY);
    const db = firebase.firestore();
    return db.collection(ACCOUNT_DEVICES).doc(accountDeviceKey).get();
  }

}
