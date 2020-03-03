import { Injectable } from '@angular/core';


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
  path: google.maps.SymbolPath.CIRCLE,
  fillColor: 'white',
  fillOpacity: 1,
  strokeColor: '#4169E1',
  strokeWeight: 3,
  strokeOpacity: 1,
  scale: 4,
  rotation: 0
};

export const DEVICE_DEFAULTS_KEY = 'device_defaults';

export const SHAPE_NAMES = [
  {id: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, name: 'Closed Arrow'},
  {id: google.maps.SymbolPath.FORWARD_OPEN_ARROW, name: 'Open Arrow'},
  {id: google.maps.SymbolPath.CIRCLE, name: 'Circle'}
];

// iconMap = new Map([
//   [google.maps.SymbolPath.FORWARD_CLOSED_ARROW.valueOf(), google.maps.SymbolPath.FORWARD_CLOSED_ARROW],
//   [google.maps.SymbolPath.FORWARD_OPEN_ARROW.valueOf(), google.maps.SymbolPath.FORWARD_OPEN_ARROW],
//   [google.maps.SymbolPath.CIRCLE.valueOf(), google.maps.SymbolPath.CIRCLE]
// ]);

@Injectable({
  providedIn: 'root'
})
export class DeviceAccessService {
  map: google.maps.Map;
  symbolPath: google.maps.SymbolPath;

  constructor() { }
}
