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

@Injectable()
export class GlobalService {
  map: google.maps.Map;

  public currentWidth: string;
}
