import { Injectable } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';

@Injectable({
  providedIn: 'root'
})

export class SetupService {
  smallView = false;

  constructor(private mediaObserver: MediaObserver) {
    this.smallView = this.mediaObserver.isActive('lt-sm') ? true : false;
  }
}
