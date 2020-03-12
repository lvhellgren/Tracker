import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { google } from '@agm/core/services/google-maps-types';
import { PlaceDoc, PlaceService } from '../../place.service';


@Component({
  selector: 'app-place-map',
  templateUrl: './place-map.component.html',
  styleUrls: ['./place-map.component.css']
})
export class PlaceMapComponent implements OnInit, OnDestroy {
  map: google.maps.Map;
  placeDoc: PlaceDoc;

  private markerSubscription: Subscription;

  constructor(private placeService: PlaceService) {
  }

  ngOnInit() {
    this.markerSubscription = this.placeService.markers$.subscribe((docs: PlaceDoc[]) => {
      this.placeDoc = docs[0];
    });
  }

  ngOnDestroy() {
    if (this.markerSubscription != null) {
      this.markerSubscription.unsubscribe();
    }
  }

  onMapReady(map) {
    this.map = map;
  }

  getZoom(radius: number) {
    let zoom: number;
    if (radius < 50) {
      zoom = 20;
    } else if (radius < 200) {
      zoom = 18;
    } else {
      zoom = 16;
    }
    return zoom;
  }
}
