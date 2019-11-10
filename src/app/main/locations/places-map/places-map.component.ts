import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { google } from '@agm/core/services/google-maps-types';
import { AccountLandmarkDoc } from '../../setup/landmarks/landmark.service';
import { PlaceService } from '../places/place.service';


interface MarkerDoc extends AccountLandmarkDoc {
  icon?: string;
  animation?: string;
}

@Component({
  templateUrl: './places-map.component.html',
  styleUrls: ['./places-map.component.css']
})
export class PlacesMapComponent implements OnInit, OnDestroy {
  private markerIcon = '/assets/landmark_flag_red.png';
  private selectedMarkerIcon = '/assets/landmark_flag_blue.png';

  private markerSubscription: Subscription;
  private selectedMarkerSubscription: Subscription;

  map: google.maps.Map;
  landmarks: MarkerDoc[] = [];

  constructor(private placeService: PlaceService) {
  }

  ngOnInit() {
    // Markers to show
    this.markerSubscription = this.placeService.markers$.subscribe((docs: MarkerDoc[]) => {
      const selectedLandmarkId = this.placeService.getLandmarkId();
      docs.forEach((doc: MarkerDoc) => {
        doc.icon = doc.landmarkId === selectedLandmarkId ? this.selectedMarkerIcon : this.markerIcon;
      });
      this.landmarks = docs;
    });

    // Selected landmark marker
    this.selectedMarkerSubscription = this.placeService.selectedLandmark$.subscribe(id => {
      this.selectMarker(id);
    });
  }

  ngOnDestroy(): void {
    if (this.markerSubscription) {
      this.markerSubscription.unsubscribe();
    }
    if (this.selectedMarkerSubscription) {
      this.selectedMarkerSubscription.unsubscribe();
    }
  }

  onMapReady(map) {
    this.map = map;
  }

  onMouseOver(infoWindow) {
    infoWindow.open();
  }

  onMouseOut(infoWindow) {
    infoWindow.close();
  }

  selectMarker(id) {
    this.landmarks.forEach((doc: MarkerDoc) => {
      if (doc.landmarkId === id) {
        doc.icon = this.selectedMarkerIcon;
        doc.animation = 'BOUNCE';
        this.stopAnimation(doc);
      } else {
        doc.icon = this.markerIcon;
      }
    });
  }

  stopAnimation(item) {
    setTimeout(() => {
      item.animation = null;
    }, 1000);
  }
}
