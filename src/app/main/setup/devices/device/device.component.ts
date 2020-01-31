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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { DeviceDto, DeviceService } from '../device.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmationDlgComponent } from '../../../core/confirmation-dlg/confirmation-dlg-component';
import { MatDialog } from '@angular/material';
import { ErrorDlgComponent } from '../../../core/error-dlg/error-dlg.component';
import { ACT_DEVICE, HelpService, SETUP } from '../../../../drawers/help/help.service';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent implements OnInit, OnDestroy {
  createDevice = false;
  msg: string;
  returnPath: string;

  nameValidators = [
    Validators.required
  ];

  active = new FormControl();

  deviceFormGroup: FormGroup;

  routeSubscription: Subscription;
  deviceSubscription: Subscription;
  msgSubscription: Subscription;
  deviceAccountSubscription: Subscription;

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

    this.deviceFormGroup = this.fb.group({
      active: ['', []],
      name: ['', this.nameValidators],
      deviceId: [''],
      modifiedAt: [''],
      createdAt: [''],
      comment: ['']
    });

    this.route.params.subscribe((params: Params) => {
      const deviceId = params['id'] ? params['id'] : this.deviceService.getDeviceId();

      this.deviceAccountSubscription = this.authService.userAccountSelect.subscribe((accountId: string) => {
        if (deviceId) {
          this.deviceService.fetchAccountDevice(accountId, deviceId)
            .then((deviceDto: DeviceDto) => {
              if (!!deviceDto) {
                this.deviceFormGroup.setValue(
                  {
                    name: deviceDto.name,
                    deviceId: deviceDto.deviceId,
                    modifiedAt: this.datePipe.transform(DeviceComponent.toDate(deviceDto.modifiedAt), 'long'),
                    createdAt: this.datePipe.transform(DeviceComponent.toDate(deviceDto.createdAt), 'long'),
                    comment: deviceDto.comment ? deviceDto.comment : '',
                    active: deviceDto.active
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
        } else {
          this.active.setValue(true);
        }
      });

      this.createDevice = !deviceId;
    });

    this.msgSubscription = this.deviceService.msg$.subscribe(msg => {
      this.msg = msg;
    });

    this.helpService.component$.next(ACT_DEVICE);
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
  }

  public onSubmit() {
    this.msg = '';
    const formGroup = this.deviceFormGroup;
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
    this.deviceFormGroup.reset();
    this.msg = '';
  }

  public onCancel() {
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
