import { Component } from '@angular/core';
import {
  HelpService,
  ACT_DEVICE,
  ACT_LANDMARK,
  ACT_NOTIFICATION_SUBSCRIPTION,
  ACT_NOTIFICATION_SUBSCRIBER,
  ACT_USER,
  ACT_LANDMARKS,
  ACT_DEVICES,
  ACT_NOTIFICATION_SUBSCRIPTIONS,
  ACT_NOTIFICATION_SUBSCRIBERS,
  ACT_USER_ACCOUNTS,
  ACT_USERS,
  HELP_CENTER,
  LOC_LANDMARK,
  LOC_LANDMARKS,
  LOC_UNIT,
  LOC_UNIT_DETAILS,
  LOC_UNITS,
  NOTIFICATIONS,
  NOTIFICATION,
  PRINC_ACCOUNT,
  PRINC_ACCOUNT_CONSTRAINTS,
  PRINC_ACCOUNTS,
  PRINC_DEVICES,
  PRINC_USERS,
  REPORTS,
  ACT_ACTIVITY_REPORT,
  SETUP,
  SIMULATOR_EVENTS,
  SIMULATOR_EVENT
} from '../../../drawers/help/help.service';

@Component({
  templateUrl: './center.component.html',
  styles: ['.margin { margin-top: 8px; }']
})
export class CenterComponent {
  static helpCenter;
  static locUnits;
  static locUnit;
  static locUnitDetails;
  static locLandmarks;
  static locLandmark;
  static notifications;
  static notification;
  static reports;
  static actActivityReport;
  static setup;
  static princAccounts;
  static princAccount;
  static princAccountConstraints;
  static princUsers;
  static princDevices;
  static actUserAccounts;
  static actUsers;
  static actUser;
  static actDevices;
  static actDevice;
  static actLandmarks;
  static actLandmark;
  static actNotificationSubscriptions;
  static actNotificationSubscription;
  static actNotificationSubscribers;
  static actNotificationSubscriber;
  static simulatorEvents;
  static simulatorMoveEvent;

  public ref = CenterComponent;

  constructor(public helpService: HelpService) {
    CenterComponent.helpCenter = HELP_CENTER;
    CenterComponent.locUnits = LOC_UNITS;
    CenterComponent.locUnit = LOC_UNIT;
    CenterComponent.locUnitDetails = LOC_UNIT_DETAILS;
    CenterComponent.locLandmarks = LOC_LANDMARKS;
    CenterComponent.locLandmark = LOC_LANDMARK;
    CenterComponent.notifications = NOTIFICATIONS;
    CenterComponent.notification = NOTIFICATION;
    CenterComponent.reports = REPORTS;
    CenterComponent.actActivityReport = ACT_ACTIVITY_REPORT;
    CenterComponent.setup = SETUP;
    CenterComponent.princAccounts = PRINC_ACCOUNTS;
    CenterComponent.princAccount = PRINC_ACCOUNT;
    CenterComponent.princAccountConstraints = PRINC_ACCOUNT_CONSTRAINTS;
    CenterComponent.princUsers = PRINC_USERS;
    CenterComponent.princDevices = PRINC_DEVICES;
    CenterComponent.actUserAccounts = ACT_USER_ACCOUNTS;
    CenterComponent.actUsers = ACT_USERS;
    CenterComponent.actUser = ACT_USER;
    CenterComponent.actDevices = ACT_DEVICES;
    CenterComponent.actDevice = ACT_DEVICE;
    CenterComponent.actLandmarks = ACT_LANDMARKS;
    CenterComponent.actLandmark = ACT_LANDMARK;
    CenterComponent.actNotificationSubscriptions = ACT_NOTIFICATION_SUBSCRIPTIONS;
    CenterComponent.actNotificationSubscription = ACT_NOTIFICATION_SUBSCRIPTION;
    CenterComponent.actNotificationSubscribers = ACT_NOTIFICATION_SUBSCRIBERS;
    CenterComponent.actNotificationSubscriber = ACT_NOTIFICATION_SUBSCRIBER;
    CenterComponent.simulatorEvents = SIMULATOR_EVENTS;
    CenterComponent.simulatorMoveEvent = SIMULATOR_EVENT;
  }

  onItemClick(item: string) {
    this.helpService.component$.next(item);
  }
}
