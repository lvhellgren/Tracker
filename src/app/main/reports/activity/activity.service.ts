import { Injectable } from '@angular/core';
import { ACCOUNT_CONSTRAINTS_COLL, AccountConstraint, AccountService } from '../../setup/accounts/account.service';
import * as firebase from 'firebase';
import { MatDialog } from '@angular/material';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';
import { ACCOUNT_DEVICES_COLL } from '../../setup/devices/device.service';
import { ACCOUNT_LANDMARKS } from '../../setup/landmarks/landmark.service';
import { ACCOUNT_USERS_COLL, PRINCIPAL_ACCOUNT_ID } from '../../core/auth/auth.service';
import { SUBSCRIBERS_COLL } from '../../setup/subscribers/subscriber.service';

export interface AccountTraffic {
  accountId?: string;
  year?: string;
  month?: string;
  events?: number;
  notifications?: number;
  emails?: number;
  texts?: number;
}

const ACCOUNT_TRAFFIC = 'account-traffic';

export interface ActivityReport {
  accountTraffic?: AccountTraffic;
  accountConstraint?: AccountConstraint;
  deviceCount?: number;
  landmarkCount?: number;
  userCount?: number;
  subscriberCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(private accountService: AccountService,
              private dialog: MatDialog) {
  }

  public fetchAccountActivityInfo(accountId: string) {
    const activityReport: ActivityReport = {};
    return firebase.firestore().collection(ACCOUNT_TRAFFIC).doc(this.makeRecordKey(accountId)).get()
      .then((accountTrafficSnap) => {
        if (accountTrafficSnap.exists) {
          activityReport.accountTraffic = accountTrafficSnap.data();
        } else {
          if (accountId !== PRINCIPAL_ACCOUNT_ID) {
            this.dialog.open(ErrorDlgComponent, {
              data: {msg: `Missing account traffic document for ${accountId}`}
            });
          }
          return null; // Breaks the promise chain
        }
      })
      .then(() => {
        const devices = firebase.firestore().collection(ACCOUNT_DEVICES_COLL)
          .where('accountId', '==', accountId).get()
          .then((deviceSnaps) => {
            activityReport.deviceCount = deviceSnaps.size;
          });
        const landmarks = firebase.firestore().collection(ACCOUNT_LANDMARKS)
          .where('accountId', '==', accountId).get()
          .then((userSnaps) => {
            activityReport.landmarkCount = userSnaps.size;
          });
        const users = firebase.firestore().collection(ACCOUNT_USERS_COLL)
          .where('accountId', '==', accountId).get()
          .then((userSnaps) => {
            activityReport.userCount = userSnaps.size;
          });
        const subscribers = firebase.firestore().collection(SUBSCRIBERS_COLL)
          .where('accountId', '==', accountId).get()
          .then((subscriberSnaps) => {
            activityReport.subscriberCount = subscriberSnaps.size;
          });
        return Promise.all([devices, landmarks, users, subscribers]);
      })
      .then(() => {
        return firebase.firestore().collection(ACCOUNT_CONSTRAINTS_COLL).doc(accountId).get()
          .then((accountConstraintSnap) => {
            if (accountConstraintSnap.exists) {
              activityReport.accountConstraint = accountConstraintSnap.data();
              return activityReport;
            } else {
              this.dialog.open(ErrorDlgComponent, {
                data: {msg: `Missing account constraint document for ${accountId}`}
              });
            }
          });
      });
  }

  makeRecordKey(accountId: string): string {
    const date = new Date();
    const month = (date.getMonth() + 1).toString();
    const year = date.getFullYear().toString();

    return accountId + ':' + month + ':' + year;
  }
}
