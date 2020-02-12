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

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MapsAPILoader } from '@agm/core';
import GeocoderResult = google.maps.GeocoderResult;


export interface GeoAddress {
  // Street Number
  subThoroughfare?: string;
  // Street
  thoroughfare?: string;
  // Locality/City
  locality?: string;
  // State
  area?: string;
  // ZIP
  postalCode?: string;
  // County
  subAdminArea?: string;
  // Country
  countryName?: string;
}

export interface GeoLocation {
  addressLine?: string;
  latitude?: number;
  longitude?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeoService {

  geoCoder: google.maps.Geocoder;

  constructor(private mapsApiLoader: MapsAPILoader,
              private dialog: MatDialog) {
    this.mapsApiLoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();
    });
  }

  /**
   * Calculates geo coordinates for a given address.
   * @param geoAddress A GeoAddress object.
   * @return A Promise for returning the result in a GeoLocation object.
   */
  getGeolocation(geoAddress: GeoAddress): Promise<GeoLocation> {
    return this.geocodeAddress(geoAddress)
      .then((results) => {
        if (!!results && !!results[0]) {
          const result = results[0];
          const geoLocation: GeoLocation = {
            latitude: result.geometry.location.lat(),
            longitude: result.geometry.location.lng(),
            addressLine: result.formatted_address
          };
          return geoLocation;
        } else {
          return null;
        }
      });
  }

  private geocodeAddress(geoAddress: GeoAddress) {
    const geolocation: GeoLocation = {};

    const request: google.maps.GeocoderRequest = {
      address: this.buildAddressLine(geoAddress)
    };

    return new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      this.geoCoder.geocode(request, (results: GeocoderResult[], status) => {
        resolve(results);
      });
    });
  }

  buildAddressLine(geoAddress: GeoAddress): string {
    let addressLine = '';
    if (!!geoAddress) {
      if (!!geoAddress.subThoroughfare) {
        addressLine += ' ' + geoAddress.subThoroughfare;
      }
      if (!!geoAddress.thoroughfare) {
        addressLine += ' ' + geoAddress.thoroughfare;
      }
      if (!!geoAddress.locality) {
        addressLine += ' ' + geoAddress.locality;
      }
      if (!!geoAddress.area) {
        addressLine += ' ' + geoAddress.area;
      }
      if (!!geoAddress.postalCode) {
        addressLine += ' ' + geoAddress.postalCode;
      }
      if (!!geoAddress.countryName) {
        addressLine += ' ' + geoAddress.countryName;
      }
    }
    return addressLine;
  }
}
