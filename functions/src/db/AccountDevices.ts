import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ACCOUNT_RESOURCES_COLL } from './AccountResources';

export const ACCOUNT_DEVICES = 'account-devices';
export const ACCOUNT_DEVICES_COLL = admin.firestore().collection(ACCOUNT_DEVICES);

export const onCreateAccountDevice = functions.firestore
  .document(ACCOUNT_DEVICES + '/{device}')
  .onCreate(async (event) => {
    return ACCOUNT_RESOURCES_COLL.doc(event.data().accountId).update({devices: admin.firestore.FieldValue.increment(1)});
  });
