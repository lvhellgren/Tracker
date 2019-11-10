import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ACCOUNT_RESOURCES_COLL } from './AccountResources';

export const ACCOUNT_USERS = 'account-users';
export const ACCOUNT_USERS_COLL = admin.firestore().collection(ACCOUNT_USERS);

export const onCreateAccountUser = functions.firestore
  .document(ACCOUNT_USERS + '/{user}')
  .onCreate(async (event) => {
    return ACCOUNT_RESOURCES_COLL.doc(event.data().accountId).update({users: admin.firestore.FieldValue.increment(1)});
  });
