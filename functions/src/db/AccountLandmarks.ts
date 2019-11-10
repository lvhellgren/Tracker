import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ACCOUNT_RESOURCES_COLL } from './AccountResources';

export const ACCOUNT_LANDMARKS = 'account-landmarks';
export const ACCOUNT_LANDMARKS_COLL = admin.firestore().collection(ACCOUNT_LANDMARKS);

export interface Landmark {
  landmarkId?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  color?: string;
}

export const onCreateAccountLandmark = functions.firestore
  .document(ACCOUNT_LANDMARKS + '/{landmark}')
  .onCreate(async (event) => {
    return ACCOUNT_RESOURCES_COLL.doc(event.data().accountId).update({landmarks: admin.firestore.FieldValue.increment(1)});
  });

export const onDeleteAccountLandmark = functions.firestore
  .document(ACCOUNT_LANDMARKS + '/{landmark}')
  .onDelete(async (event) => {
    return ACCOUNT_RESOURCES_COLL.doc(event.data().accountId).update({landmarks: admin.firestore.FieldValue.increment(-1)});
  });
