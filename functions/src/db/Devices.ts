import * as functions from 'firebase-functions';
import * as Log from './Log';
import * as admin from 'firebase-admin';

export const DEVICES = 'devices';
export const DEVICES_COLL = admin.firestore().collection(DEVICES);

export const onWriteDevice = functions.firestore
  .document(DEVICES + '/{device}')
  .onWrite(async (event) => {
    return Log.log(Log.Type.INFO,'onWriteDevice', 'Test');
  });
