import { Component, OnDestroy, OnInit } from '@angular/core';
import { MapService } from './map/map.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { GlobalService } from '../../sevices/global';
import { UnitService } from './unit.service';

// const sm = '600px';
const md = '960px';
// const lg = '1280px';

@Component({
  selector: 'app-locations',
  template: '<router-outlet></router-outlet>',
  providers: [
    UnitService,
    MapService
  ]
})

export class LocationsComponent implements OnInit, OnDestroy {
  private breakpointSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private breakpointObserver: BreakpointObserver,
              private global: GlobalService) {
  }

  ngOnInit() {
    this.breakpointSubscription = this.breakpointObserver
      .observe([`(min-width: ${md}`])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.global.currentWidth = 'lg';
        } else {
          this.global.currentWidth = 'sm';
        }
        this.router.navigate([`./${this.global.currentWidth}`], {relativeTo: this.route});
      });
  }

  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }
}
