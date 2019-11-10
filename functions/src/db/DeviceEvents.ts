import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DEVICES_COLL } from './Devices';
import { LAST_MOVES_COLL } from './LastMoves';
import { Landmark, ACCOUNT_LANDMARKS_COLL } from './AccountLandmarks';
import * as Log from './Log';
import { ENTRY, EXIT, SubscriptionDoc, ACCOUNT_SUBSCRIPTIONS_COLL } from './AccountSubscriptions';
import { Notification, NOTIFICATIONS_COLL } from './Notifications';
import { LANDMARK_ACTIVITY_COLL, LandmarkActivityDoc } from './LandmarkActivity';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';
import * as firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;
import FieldValue = admin.firestore.FieldValue;
import { ACCOUNT_TRAFFIC_COLL, makeRecordKey } from './AccountTraffic';

export interface DeviceEvent {
  accountId?: string;
  previousEventBearing?: number;
  deviceId?: string;
  documentId?: string;
  latitude?: number;
  longitude?: number;
  landmarks?: Landmark[];
  deviceName?: string;
  isLastMove?: boolean;
  deviceTime?: Timestamp;
  serverTime?: FieldValue;
  month?: string;
  year?: string;
}

export const DEVICE_EVENTS = 'device-events';
export const DEVICE_EVENTS_COLL = admin.firestore().collection(DEVICE_EVENTS);

// Called after the insertion of a new document in the device-events collection.
export const onCreateDeviceEvent = functions.firestore
  .document(DEVICE_EVENTS + '/{event}')
  .onCreate(async (deviceEventSnap) => {
    const deviceEvent: DeviceEvent = deviceEventSnap.data();
    deviceEvent.serverTime = FieldValue.serverTimestamp();

    await incrementEventCount(deviceEvent);

    return handleNewDeviceEvent(deviceEventSnap, deviceEvent);
  });

function incrementEventCount(deviceEvent) {
  const keyObj = makeRecordKey(deviceEvent.accountId);
  return ACCOUNT_TRAFFIC_COLL.doc(keyObj.key).update({events: admin.firestore.FieldValue.increment(1)});
}

function handleNewDeviceEvent(deviceEventSnap: DocumentSnapshot, deviceEvent: DeviceEvent) {
  return DEVICES_COLL.where('deviceId', '==', deviceEvent.deviceId).get()
    .then((deviceSnapshot) => {
      // Insert the device name into tha data object
      if (deviceSnapshot) {
        deviceEvent.deviceName = deviceSnapshot.docs[0].get('name');
      } else {
        deviceEvent.deviceName = 'Unknown Device';
      }
      return Promise.resolve();
    })
    .then(() => {
      // Get the previous device-events document ID from the last-moves document
      return LAST_MOVES_COLL.doc(deviceEvent.accountId + ':' + deviceEvent.deviceId).get()
        .then(lastMoveSnap => {
          const lastMove = lastMoveSnap.data();
          if (!!lastMove) {
            return DEVICE_EVENTS_COLL.doc(lastMove.documentId).update({
              bearingForward: deviceEvent.previousEventBearing
            })
              .then(() => {
                return lastMoveSnap;
              })
              .catch(error => {
                return Promise.reject(`Error updating ${DEVICE_EVENTS_COLL}: ${error.toString()}`);
              });
          } else {
            // Handle first event of a new device
            return deviceEventSnap;
          }
        })
        .catch(error => Promise.reject(`Error getting ${LAST_MOVES_COLL}: ${error.toString()}`));
    })
    .then((lastMoveSnap) => {
      // Find any landmarks that the device is inside
      return ACCOUNT_LANDMARKS_COLL.where('accountId', '==', deviceEvent.accountId)
        .get()
        .then((landmarksSnap) => {
          const currentLandmarks: Landmark[] = [];
          landmarksSnap.forEach((doc: any) => {
            const landmark: any = doc.data();
            // @ts-ignore
            const distance = distanceBetweenMapPoints(deviceEvent.latitude, deviceEvent.longitude, landmark.latitude, landmark.longitude);
            if (distance <= landmark.radius) {
              const currentLandmark: Landmark = {
                landmarkId: landmark.landmarkId,
                latitude: landmark.latitude,
                longitude: landmark.longitude,
                radius: landmark.radius,
                color: landmark.color
              };
              currentLandmarks.push(currentLandmark);
            }
          });
          deviceEvent.landmarks = Array.from(currentLandmarks);
          // Insert any current landmarks in both device-events and last-moves documents
          return Promise.all([
            writeLastMove(deviceEvent),
            deviceEventSnap.ref.set(deviceEvent),
            determineLandmarkActivity(currentLandmarks, lastMoveSnap.data().landmarks, deviceEvent)
          ]);
        })
        .catch(error => Promise.reject(`Error getting ${ACCOUNT_LANDMARKS_COLL}: ${error.toString()}`));
    })
    .catch((error) => {
      return Log.log(Log.Type.ERR, 'handleNewDeviceEvent', error.toString());
    });
}

function distanceBetweenMapPoints(latitude1: number, longitude1: number, latitude2: number, longitude2: number) {
  const earthRadiusMeters = 6371000;

  const dLat: number = degreesToRadians(latitude2 - latitude1);
  const dLon: number = degreesToRadians(longitude2 - longitude1);

  const lat1: number = degreesToRadians(latitude1);
  const lat2: number = degreesToRadians(latitude2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
}

function degreesToRadians(degrees: number) {
  return degrees * Math.PI / 180;
}

function writeLastMove(data: DeviceEvent) {
  const lastMove: DeviceEvent = {...data};
  lastMove.isLastMove = true;

  return LAST_MOVES_COLL.doc(lastMove.accountId + ':' + lastMove.deviceId).set(lastMove)
    .then(() => {
      // return Log.log(Log.Type.INFO, 'writeLastMove', 'Document saved');
    })
    .catch((error) => {
      return Log.log(Log.Type.ERR, 'writeLastMove', error.toString());
    });
}


async function determineLandmarkActivity(current: Landmark[], previous: Landmark[], deviceEvent: DeviceEvent) {
  let entries: string[];
  let exits: string[];

  const currentLandmarks: Landmark[] = !!current ? current : [];
  const previousLandmarks: Landmark[] = !!previous ? previous : [];
  const currentIds: string[] = [];
  const previousIds: string[] = [];

  if (currentLandmarks.length === 0 && previousLandmarks.length === 0) {
    // No landmark entry/exit
    return Promise.resolve();
  }

  currentLandmarks.forEach(landmark => {
    currentIds.push(landmark.landmarkId);
  });

  previousLandmarks.forEach(landmark => {
    previousIds.push(landmark.landmarkId);
  });

  if (currentIds.length === 0) {
    entries = [];
    exits = previousIds;
  } else if (previousIds.length === 0) {
    exits = [];
    entries = currentIds;
  } else {
    entries = landmarkDiffs(currentIds, previousIds);
    exits = landmarkDiffs(previousIds, currentIds);
    if (entries.length === 0 && exits.length === 0) {
      return Promise.resolve();
    }
  }
  return handleActivity(entries, exits, deviceEvent);
}

function landmarkDiffs(landmarks1: string[], landmarks2: string[]) {
  const diffs = new Set<string>([]);
  landmarks1.forEach((landmark1: string) => {
    if (!landmarks2.includes(landmark1)) {
      diffs.add(landmark1);
    }
  });
  return Array.from(diffs);
}

async function handleActivity(entries: string[], exits: string[], deviceEvent: DeviceEvent) {
  let entryNotificationsPromise: Promise<any> = Promise.resolve();
  let exitNotificationsPromise: Promise<any> = Promise.resolve();
  let landmarksSetPromise: Promise<any> = Promise.resolve();
  let landmarksDelePromise: Promise<any> = Promise.resolve();

  if (entries.length > 0) {
    entryNotificationsPromise = processNotifications(entries, deviceEvent, ENTRY);
    landmarksSetPromise = setLandmarkEntries(entries, deviceEvent);
  }
  if (exits.length > 0) {
    exitNotificationsPromise = processNotifications(exits, deviceEvent, EXIT);
    landmarksDelePromise = deleteLandmarkEntries(exits, deviceEvent);
  }
  return Promise.all([
    entryNotificationsPromise,
    exitNotificationsPromise,
    landmarksSetPromise,
    landmarksDelePromise
  ]);
}

function processNotifications(landmarks: string[], deviceEvent: DeviceEvent, activity) {
  const subscriptionsPromises: Promise<any>[] = [];
  landmarks.forEach((landmarkId: string) => {
    subscriptionsPromises.push(findSubscriptions(landmarkId, deviceEvent, activity));
  });
  return Promise.all([
    subscriptionsPromises
  ]);
}

function findSubscriptions(landmarkId: string, deviceEvent: DeviceEvent, activity: string) {
  const promises: Promise<any>[] = [];
  return ACCOUNT_SUBSCRIPTIONS_COLL
    .where('active', '==', true)
    .where('accountId', '==', deviceEvent.accountId)
    .where('landmarkId', '==', landmarkId)
    .where('activity', '==', activity)
    .where('deviceIds', 'array-contains', deviceEvent.deviceId)
    .get()
    .then(async (snapshot) => {
      if (!snapshot.empty) {
        snapshot.docs.map((doc) => {
          const subscriptionDoc: SubscriptionDoc = doc.data();
          const notification: Notification = buildNotification(subscriptionDoc, deviceEvent);
          promises.push(NOTIFICATIONS_COLL.doc().set(notification));
        });
      }
      return Promise.all(promises);
    })
    .catch((error) => {
      return Log.log(Log.Type.ERR, 'findSubscriptions', error.toString());
    });
}

function buildNotification(subscriptionDoc: SubscriptionDoc, deviceEvent: DeviceEvent) {
  return <Notification>{
    activity: subscriptionDoc.activity,
    accountId: subscriptionDoc.accountId,
    subscriptionId: subscriptionDoc.subscriptionId,
    deviceName: deviceEvent.deviceName,
    deviceId: deviceEvent.deviceId,
    landmarkId: subscriptionDoc.landmarkId,
    deviceTime: deviceEvent.deviceTime
  };
}

function setLandmarkEntries(landmarkIds: string[], deviceEvent: DeviceEvent) {
  const promises: Promise<any>[] = [];
  landmarkIds.forEach((landmarkId) => {
    const doc: LandmarkActivityDoc = buildLandmarkActivity(landmarkId, deviceEvent);
    const key = buildLandmarkActivityKey(landmarkId, deviceEvent);
    promises.push(LANDMARK_ACTIVITY_COLL.doc(key).set(doc));
  });
  return Promise.all(promises);
}

function deleteLandmarkEntries(landmarkIds: string[], data: DeviceEvent) {
  const promises: Promise<any>[] = [];
  landmarkIds.forEach((landmarkId) => {
    const key = buildLandmarkActivityKey(landmarkId, data);
    promises.push(LANDMARK_ACTIVITY_COLL.doc(key).delete()
      .catch(async error => {
        await Log.log(Log.Type.ERR, 'deleteLandmarkEntries', error.toString());
      }));
  });
  return Promise.all(promises);
}

function buildLandmarkActivity(landmarkId: string, deviceEvent: DeviceEvent) {
  return <LandmarkActivityDoc>{
    accountId: deviceEvent.accountId,
    landmarkId: landmarkId,
    deviceId: deviceEvent.deviceId,
    latitude: deviceEvent.latitude,
    longitude: deviceEvent.longitude,
    time: new Date()
  };
}

function buildLandmarkActivityKey(landmarkId: string, deviceEvent: DeviceEvent) {
  return `${deviceEvent.accountId}:${landmarkId}:${deviceEvent.deviceId}`;
}
