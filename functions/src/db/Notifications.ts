import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as sgMail from '@sendgrid/mail';
import * as moment from 'moment';

import { SUBSCRIBERS_COLL } from './Subscribers';
import * as Log from './Log';
import { ENTRY, EXIT } from './AccountSubscriptions';
import * as firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import { ACCOUNT_TRAFFIC_COLL, makeRecordKey } from './AccountTraffic';

export const NOTIFICATIONS = 'notifications';
export const NOTIFICATIONS_COLL = admin.firestore().collection(NOTIFICATIONS);

export interface Notification {
  activity?: string;
  accountId?: string;
  subscriptionId?: string;
  deviceName?: string;
  deviceId?: string;
  landmarkId?: string;
  documentId?: string;
  deviceTime?: Timestamp;
}

export interface Subscriber {
  active?: boolean;
  accountId?: string;
  subscriber?: string;
  emailNotification?: boolean;
  textNotification?: boolean;
}

const API_KEY = functions.config().sendgrid.key;
const TEMPLATE_ID = functions.config().sendgrid.template;
sgMail.setApiKey(API_KEY);

export const onCreateNotification = functions.firestore
  .document(NOTIFICATIONS + '/{notification}')
  .onCreate((change) => {
    const notification: Notification = <Notification>change.data();
    notification.documentId = change.id;

    const notificationPromise = change.ref.set(notification)
      .then(() => {
        const keyObj = makeRecordKey(notification.accountId);
        return ACCOUNT_TRAFFIC_COLL.doc(keyObj.key)
          .update({notifications: admin.firestore.FieldValue.increment(1)});
      });

    const subscriberPromise = SUBSCRIBERS_COLL
      .where('active', '==', true)
      .where('accountId', '==', notification.accountId)
      .where('subscriptionId', '==', notification.subscriptionId)
      .get()
      .then((snapshots) => {
        const msgPromises: Promise<any>[] = [];
        if (!snapshots.empty) {
          snapshots.forEach((snapshot) => {
            const subscriber: Subscriber = snapshot.data();
            msgPromises.push(notifyByEmail(subscriber, notification));
            msgPromises.push(notifyByText(subscriber, notification));
          });
        }
        return Promise.all(msgPromises);
      });
    return Promise.all([notificationPromise, subscriberPromise]);
  });

async function notifyByEmail(subscriber: Subscriber, notification: Notification) {
  if (subscriber.emailNotification) {
    const email = subscriber.subscriber;
    let action: string;
    if (notification.activity === ENTRY) {
      action = ' arrived at ';
    } else if (notification.activity === EXIT) {
      action = ' departed from ';
    }

    // TODO: Use deviceTime?
    const msg = {
      to: email,
      from: 'lars@exelor.com',
      templateId: TEMPLATE_ID,
      dynamic_template_data: {
        name: email,
        text: `
        Unit ${notification.deviceName}${action}${notification.landmarkId} around ${moment().format('HH:mm [on] MM/DD/YYYY')}`
      }
    };

    const keyObj = makeRecordKey(subscriber.accountId);
    await ACCOUNT_TRAFFIC_COLL.doc(keyObj.key)
      .update({emails: admin.firestore.FieldValue.increment(1)});

    return sgMail.send(msg)
      .catch((error) => {
        return Log.log(Log.Type.ERR, 'notifyByEmail', `Error: ${error.toString()}`);
      });
  } else {
    return Promise.resolve();
  }
}

async function notifyByText(subscriber: Subscriber, notification: Notification) {
  if (subscriber.emailNotification) {
    // TODO: Implement
    const keyObj = makeRecordKey(subscriber.accountId);
    await ACCOUNT_TRAFFIC_COLL.doc(keyObj.key)
      .update({texts: admin.firestore.FieldValue.increment(1)});
    return Promise.resolve();
  } else {
    return Promise.resolve();
  }
}

