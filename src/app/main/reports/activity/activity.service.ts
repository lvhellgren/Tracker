import { Injectable } from '@angular/core';
import { ACCOUNT_CONSTRAINTS, AccountConstraint, AccountService } from '../../setup/accounts/account.service';
import * as firebase from 'firebase';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDlgComponent } from '../../core/error-dlg/error-dlg.component';
import { ACCOUNT_LANDMARKS } from '../../setup/landmarks/landmark.service';
import { ACCOUNT_USERS } from '../../core/auth/auth.service';
import { SUBSCRIBERS } from '../../setup/subscribers/subscriber.service';
import { ACCOUNT_DEVICES } from '../../../sevices/mapmarker.service';

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
          const accountTraffic: AccountTraffic = {
            events: 0,
            notifications: 0,
            emails: 0,
            texts: 0
          };
          activityReport.accountTraffic = accountTraffic;
        }
      })
      .then(() => {
        const devices = firebase.firestore().collection(ACCOUNT_DEVICES)
          .where('accountId', '==', accountId).get()
          .then((deviceSnaps) => {
            activityReport.deviceCount = deviceSnaps.size;
          });
        const landmarks = firebase.firestore().collection(ACCOUNT_LANDMARKS)
          .where('accountId', '==', accountId).get()
          .then((userSnaps) => {
            activityReport.landmarkCount = userSnaps.size;
          });
        const users = firebase.firestore().collection(ACCOUNT_USERS)
          .where('accountId', '==', accountId).get()
          .then((userSnaps) => {
            activityReport.userCount = userSnaps.size;
          });
        const subscribers = firebase.firestore().collection(SUBSCRIBERS)
          .where('accountId', '==', accountId).get()
          .then((subscriberSnaps) => {
            activityReport.subscriberCount = subscriberSnaps.size;
          });
        return Promise.all([devices, landmarks, users, subscribers]);
      })
      .then(() => {
        return firebase.firestore().collection(ACCOUNT_CONSTRAINTS).doc(accountId).get()
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
