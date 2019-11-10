import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Subscription } from 'rxjs';
import { SimulatorService } from '../../simulator.service';
import { DeviceEvent } from '../../../locations/unit.service';

@Component({
  selector: 'app-move-event',
  templateUrl: './move-event.component.html',
  styleUrls: ['./move-event.component.css']
})
export class MoveEventComponent implements OnInit, OnDestroy {

  msg: string;
  createEvent: boolean;
  returnPath: string;
  eventForm: FormGroup;
  accountId: string;

  accountSubscription: Subscription;
  routeSubscription: Subscription;
  paramSubscription: Subscription;
  eventSubscription: Subscription;
  msgSubscription: Subscription;

  constructor(private fb: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private authService: AuthService,
              private simulatorService: SimulatorService) {
  }

  ngOnInit() {
    this.routeSubscription = this.route.url.subscribe(segment => {
      if (segment[0].path === 'move-event-add') {
        this.createEvent = true;
        this.simulatorService.clearCurrentEvent();
      } else {
        this.paramSubscription = this.route.params.subscribe((params: Params) => {
          let docId = params['id'];
          if (!docId && this.simulatorService.currentEvent) {
            docId = this.simulatorService.currentEvent.documentId;
          }
          if (docId) {
            this.simulatorService.fetchEventDoc(docId);
          }
        });
      }
    });

    this.accountSubscription = this.authService.userAccountSelect.subscribe(accountId => {
      this.accountId = accountId;

      this.eventForm = this.fb.group({
        accountId: [{value: accountId, disabled: true}],
        accuracy: [50],
        address: this.fb.group({
          subThoroughfare: [''],
          thoroughfare: [''],
          locality: [''],
          area: [''],
          postalCode: [''],
          subAdminArea: [''],
          countryName: ['']
        }),
        altitude: [0],
        bearing: [0],
        bearingForward: [''],
        deviceId: ['simulator:device:01'],
        email: [''],
        eventType: [{value: 'MOVE', disabled: true}],
        hasAccuracy: [true],
        hasAltitude: [false],
        hasBearing: [false],
        hasSpeed: [false],
        latitude: [{value: '', disabled: true}],
        longitude: [{value: '', disabled: true}],
        deviceName: [{value: '', disabled: true}],
        documentId: [{value: '', disabled: true}],
        previousEventBearing: [0],
        speed: [0],
        stepLength: ['']
      });
    });

    // Handle response to event fetch request
    this.eventSubscription = this.simulatorService.fetchedEvent$.subscribe((deviceEvent: DeviceEvent) => {
      this.eventForm.patchValue({
        accountId: deviceEvent.accountId,
        accuracy: deviceEvent.accuracy,
        address: deviceEvent.address,
        altitude: deviceEvent.altitude,
        bearing: deviceEvent.bearing,
        bearingForward: deviceEvent.bearingForward,
        deviceId: deviceEvent.deviceId,
        email: deviceEvent.email,
        eventType: 'MOVE',
        hasAccuracy: deviceEvent.hasAccuracy,
        hasAltitude: deviceEvent.hasAltitude,
        hasBearing: deviceEvent.hasBearing,
        hasSpeed: deviceEvent.hasSpeed,
        latitude: deviceEvent.latitude,
        longitude: deviceEvent.longitude,
        deviceName: deviceEvent.deviceName,
        documentId: deviceEvent.documentId,
        previousEventBearing: deviceEvent.previousEventBearing,
        speed: deviceEvent.speed,
        stepLength: deviceEvent.stepLength
      });
    });

    this.msgSubscription = this.simulatorService.msg$.subscribe(msg => {
      this.msg = msg;
    });
  }

  public ngOnDestroy() {
    if (this.accountSubscription) {
      this.accountSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe();
    }
    if (this.eventSubscription) {
      this.eventSubscription.unsubscribe();
    }
    if (this.msgSubscription) {
      this.msgSubscription.unsubscribe();
    }
  }

  public onSubmit() {
    this.msg = '';
    const deviceEvent: DeviceEvent = this.eventForm.getRawValue();
    deviceEvent.deviceName = '';
    this.simulatorService.saveMoveEvent(deviceEvent, 'events-list');
  }

  public onCancel() {
    this.msg = '';
    this.router.navigate([`./simulator/events-list`])
      .catch((error) => {
        this.msg = error.toString();
      });
  }

  public onClear() {
    this.eventForm.reset();
    this.simulatorService.clearCurrentEvent();
    this.msg = '';
  }
}
