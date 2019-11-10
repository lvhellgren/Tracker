import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ACCOUNT_RESOURCES_COLL } from './AccountResources';

export const ACCOUNT_SUBSCRIPTIONS = 'account-subscriptions';
export const ACCOUNT_SUBSCRIPTIONS_COLL = admin.firestore().collection(ACCOUNT_SUBSCRIPTIONS);

export const ENTRY = 'ENTRY';
export const EXIT = 'EXIT';

export interface SubscriptionDoc {
  active?: string;
  accountId?: string;
  subscriptionId?: string;
  landmarkId?: string;
  deviceIds?: string[];
  activity?: string;
}

export const onCreateAccountSubscription = functions.firestore
  .document(ACCOUNT_SUBSCRIPTIONS + '/{subscription}')
  .onCreate(async (event) => {
    return ACCOUNT_RESOURCES_COLL.doc(event.data().accountId).update({subscriptions: admin.firestore.FieldValue.increment(1)});
  });

export const onDeleteAccountSubscription = functions.firestore
  .document(ACCOUNT_SUBSCRIPTIONS + '/{subscription}')
  .onDelete(async (event) => {
    return ACCOUNT_RESOURCES_COLL.doc(event.data().accountId).update({subscriptions: admin.firestore.FieldValue.increment(-1)});
  });
