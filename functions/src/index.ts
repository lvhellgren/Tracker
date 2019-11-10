
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Cloud Function Deployment:
// 1. CD Tracker
// 2. $ [firebase login]
// 3. $ [firebase init functions]
// 4. $ firebase deploy --only functions
//
// Config SendGrid Setup:
// firebase functions:config:set sendgrid.key=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
// firebase functions:config:set sendgrid.template=d-a218ee7fd41b4ccaa1c19719e9fcaaf3
//
// View Config:
// firebase functions:config:get
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const functions = require('firebase-functions');
import * as admin from 'firebase-admin';
admin.initializeApp();

//
// Cloud functions organized by collection name
//

import * as AccountDevices from './db/AccountDevices';
import * as AccountLandmarks from './db/AccountLandmarks';
import * as Accounts from './db/Accounts';
import * as AccountSubscriptions from './db/AccountSubscriptions';
import * as AccountUsers from './db/AccountUsers';
import * as DeviceEvents from './db/DeviceEvents';
import * as Devices from './db/Devices';
import * as Notifications from './db/Notifications';
import * as Subscribers from './db/Subscribers';

export const onCreateAccount = Accounts.onCreateAccount;
export const onCreateAccountDevice = AccountDevices.onCreateAccountDevice;
export const onCreateAccountLandmark = AccountLandmarks.onCreateAccountLandmark;
export const onCreateAccountSubscription = AccountSubscriptions.onCreateAccountSubscription;
export const onCreateAccountUser = AccountUsers.onCreateAccountUser;
export const onCreateDeviceEvent = DeviceEvents.onCreateDeviceEvent;
export const onCreateNotification = Notifications.onCreateNotification;
export const onCreateSubscriber = Subscribers.onCreateSubscriber;


export const onDeleteAccountLandmark = AccountLandmarks.onDeleteAccountLandmark;
export const onDeleteAccountSubscription = AccountSubscriptions.onDeleteAccountSubscription;
export const onDeleteSubscriber = Subscribers.onDeleteSubscriber;

export const onWriteDevice = Devices.onWriteDevice;

//
// Schedule functions
//

// Maintains month-year for use in database rules
export const setMonthYear = functions.pubsub.schedule('0 0 1 * *').onRun(async () => {
  const date = new Date();
  const month =  (date.getMonth() + 1).toString();
  const year = date.getFullYear().toString();
  console.log('Updating current-month-year: ' + date.toString());
  return admin.firestore().collection('current-month-year').doc('mmyyyy')
    .set({month: month, year: year, key: month + ':' + year});
});
