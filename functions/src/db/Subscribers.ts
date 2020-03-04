import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ACCOUNT_RESOURCES_COLL } from './AccountResources';

export const SUBSCRIBERS = 'subscribers';
export const SUBSCRIBERS_COLL = admin.firestore().collection(SUBSCRIBERS);

export const onCreateSubscriber = functions.firestore
  .document(SUBSCRIBERS + '/{subscriber}')
  .onCreate(async (event) => {
    return ACCOUNT_RESOURCES_COLL.doc(event.data().accountId).update({subscribers: admin.firestore.FieldValue.increment(1)});
  });

export const onDeleteSubscriber = functions.firestore
  .document(SUBSCRIBERS + '/{subscriber}')
  .onDelete(async (event) => {
    return ACCOUNT_RESOURCES_COLL.doc(event.data().accountId).update({subscribers: admin.firestore.FieldValue.increment(-1)});
  });
