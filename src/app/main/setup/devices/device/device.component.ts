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

import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DeviceDto, DeviceService } from '../device.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmationDlgComponent } from '../../../core/confirmation-dlg/confirmation-dlg-component';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDlgComponent } from '../../../core/error-dlg/error-dlg.component';
import { ACT_DEVICE, HelpService } from '../../../../drawers/help/help.service';
import { GlobalService } from '../../../../sevices/global';
import { BASE_MARKER_ICON } from '../../../../sevices/device-access.service';


@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent implements OnInit, AfterViewInit, OnDestroy {
  static markerLat = 33.7;
  static markerLng = -117.7;
  static coordinates = new google.maps.LatLng(DeviceComponent.markerLat, DeviceComponent.markerLng);

  static mapOptions: google.maps.MapOptions = {
    center: new google.maps.LatLng(DeviceComponent.markerLat, DeviceComponent.markerLng),
    clickableIcons: false,
    draggable: false,
    controlSize: 1,
    disableDoubleClickZoom: true,
    keyboardShortcuts: false,
    mapTypeControl: false,
    panControl: false,
    rotateControl: false,
    scaleControl: false,
    scrollwheel: false,
    streetViewControl: false,
    zoom: 10
  };

  shapeNames = [
    {id: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, name: 'Closed Arrow'},
    {id: google.maps.SymbolPath.FORWARD_OPEN_ARROW, name: 'Open Arrow'},
    {id: google.maps.SymbolPath.CIRCLE, name: 'Circle'}
  ];

  iconMap = new Map([
    [google.maps.SymbolPath.FORWARD_CLOSED_ARROW.valueOf(), google.maps.SymbolPath.FORWARD_CLOSED_ARROW],
    [google.maps.SymbolPath.FORWARD_OPEN_ARROW.valueOf(), google.maps.SymbolPath.FORWARD_OPEN_ARROW],
    [google.maps.SymbolPath.CIRCLE.valueOf(), google.maps.SymbolPath.CIRCLE]
  ]);

  @ViewChild('mapContainer') gmap: ElementRef;

  createDevice = false;
  msg: string;
  returnPath: string;

  deviceForm: FormGroup;
  active = new FormControl();

  nameValidators = [
    Validators.required
  ];

  map: google.maps.Map;
  icon;
  deviceId: string;
  accountId: string;
  disableIconButtons = true;

  routeSubscription: Subscription;
  deviceSubscription: Subscription;
  msgSubscription: Subscription;
  deviceAccountSubscription: Subscription;
  defaultDeviceMarkerIcon: Subscription;

  static toDate(ts: any) {
    let date: Date;
    if (ts) {
      date = ts.toDate();
    }
    return date;
  }

  constructor(private fb: FormBuilder,
              private deviceService: DeviceService,
              private datePipe: DatePipe,
              private router: Router,
              private route: ActivatedRoute,
              private location: Location,
              private authService: AuthService,
              private globalService: GlobalService,
              private dialog: MatDialog,
              private helpService: HelpService) {
  }

  ngOnInit() {
    this.routeSubscription = this.route.url.subscribe(segment => {
      const path = segment[0].path;
      if (path === 'principal-device-details') {
        this.returnPath = 'principal-devices-list';
      } else if (path === 'account-device-add') {
        this.createDevice = true;
        this.deviceService.clearDevice();
        this.active.reset();
        this.returnPath = 'account-devices-list';
      } else if (path === 'account-device-details') {
        this.returnPath = 'account-devices-list';
      }
    });

    this.deviceForm = this.fb.group({
      active: ['', []],
      name: ['', this.nameValidators],
      deviceId: [''],
      modifiedAt: [''],
      createdAt: [''],
      markerIconForm: this.fb.group({
        path: [''],
        scale: [0],
        fillColor: [''],
        fillOpacity: [0],
        strokeColor: [''],
        strokeWeight: [0],
        strokeOpacity: [0],
        rotation: [0]
      }),
      comment: ['']
    });

    this.route.params.subscribe((params: Params) => {
      this.deviceId = params['id'] ? params['id'] : this.deviceService.getDeviceId();

      this.deviceAccountSubscription = this.authService.userAccountSelect.subscribe((accountId: string) => {
        if (!!accountId) {
          this.accountId = accountId;
          this.deviceService.fetchDefaultMapMarkerIcon(accountId);
        }
      });

      this.createDevice = !!!this.deviceId;
    });

    this.defaultDeviceMarkerIcon = this.deviceService.defaultDeviceMarkerIcon$.subscribe(icon => {
      this.icon = icon;
      if (this.deviceId) {
        this.buildDeviceForm(this.deviceId, this.accountId);
      } else {
        this.buildEmptyForm();
      }
      this.displayMapMarker();
    });

    this.msgSubscription = this.deviceService.msg$.subscribe(msg => {
      this.msg = msg;
    });

    this.helpService.component$.next(ACT_DEVICE);
  }

  ngAfterViewInit() {
    this.deviceForm.get('markerIconForm').valueChanges.subscribe(icon => {
      this.icon = icon;
      this.displayMapMarker();
      this.disableIconButtons = false;
    });

    if (!!this.icon) {
      this.displayMapMarker();
    }
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.deviceSubscription) {
      this.deviceSubscription.unsubscribe();
    }
    if (this.deviceAccountSubscription) {
      this.deviceAccountSubscription.unsubscribe();
    }
    if (this.msgSubscription) {
      this.msgSubscription.unsubscribe();
    }
    if (this.defaultDeviceMarkerIcon) {
      this.defaultDeviceMarkerIcon.unsubscribe();
    }
  }

  buildDeviceForm(deviceId: string, accountId: string) {
    this.deviceService.fetchAccountDevice(accountId, deviceId)
      .then((deviceDto: DeviceDto) => {
        if (!!deviceDto) {
          if (!!!deviceDto.markerIcon) {
            deviceDto.markerIcon = this.getDefaultMarkerIcon();
          }
          this.icon = deviceDto.markerIcon;
          this.deviceForm.setValue(
            {
              active: deviceDto.active,
              name: deviceDto.name,
              deviceId: deviceDto.deviceId,
              markerIconForm: {
                path: this.iconMap.get(deviceDto.markerIcon.path),
                scale: deviceDto.markerIcon.scale,
                fillColor: deviceDto.markerIcon.fillColor,
                fillOpacity: deviceDto.markerIcon.fillOpacity,
                strokeColor: deviceDto.markerIcon.strokeColor,
                strokeWeight: deviceDto.markerIcon.strokeWeight,
                strokeOpacity: deviceDto.markerIcon.strokeOpacity,
                rotation: 0
              },
              modifiedAt: this.datePipe.transform(DeviceComponent.toDate(deviceDto.modifiedAt), 'long'),
              createdAt: this.datePipe.transform(DeviceComponent.toDate(deviceDto.createdAt), 'long'),
              comment: deviceDto.comment ? deviceDto.comment : '',
            },
            {
              emitEvent: false
            });

          this.active.setValue(deviceDto.active);
        } else {
          this.router.navigate([`./setup/${this.returnPath}`]);
        }
      })
      .catch(error => {
        this.dialog.open(ErrorDlgComponent, {
          data: {msg: error}
        });
      });
  }

  buildEmptyForm() {
    this.active.setValue(true);
    this.deviceForm.setValue(
      {
        active: true,
        name: '',
        deviceId: '',
        markerIconForm: this.icon,
        modifiedAt: null,
        createdAt: null,
        comment: ''
      },
      {
        emitEvent: false
      });
  }

  getByValue(map, searchValue) {
    for (const [key, value] of map.entries()) {
      if (value === searchValue) {
        return key;
      }
    }
  }

  displayMapMarker() {
    this.map = new google.maps.Map(this.gmap.nativeElement, DeviceComponent.mapOptions);
    const marker = new google.maps.Marker({
      position: DeviceComponent.coordinates,
      icon: this.icon,
      draggable: true
    });
    marker.setMap(this.map);
  }

  getDefaultMarkerIcon() {
    this.icon = Object.assign({}, BASE_MARKER_ICON);  // TODO: Use default markerIconForm when available
    return this.icon;
  }

  onUseDefaultMarkerIconClick() {
    this.msg = '';
    const obj = this.deviceForm.getRawValue();
    obj.markerIconForm = this.getDefaultMarkerIcon();
    this.deviceForm.setValue(obj, {emitEvent: false});
    this.displayMapMarker();
    this.disableIconButtons = true;
  }

  onMakeDefaultMarkerIconClick() {
    this.msg = '';
    this.deviceService.saveDeviceDefaultMarkerIcon(this.icon);
    this.disableIconButtons = true;
  }

  public onSubmit() {
    this.msg = '';
    const formGroup = this.deviceForm;
    const deviceDto = <DeviceDto>{
      name: formGroup.get('name').value,
      deviceId: formGroup.get('deviceId').value,
      comment: formGroup.get('comment').value,
      active: this.active.value
    };

    if (this.createDevice) {
      this.confirmAddDevice(deviceDto);
    } else {
      this.deviceService.saveDevice(deviceDto, this.returnPath);
    }
  }

  public onClear() {
    this.deviceService.clearDevice();
    this.active.setValue(true);
    this.deviceForm.reset();
    this.msg = '';
  }

  public onCancel() {
    this.msg = '';
    this.location.back();
  }

  confirmAddDevice(deviceDto: DeviceDto) {
    const dlg = this.dialog.open(ConfirmationDlgComponent, {
      data: {
        title: 'Confirm Add Device',
        msg: `Add device to ${this.authService.currentUserAccountId} account?`,
        no: 'Cancel',
        yes: 'Add'
      },
      disableClose: true
    });

    dlg.afterClosed().subscribe((add: boolean) => {
      if (add) {
        this.deviceService.saveDevice(deviceDto, this.returnPath);
      }
    });
  }
}
