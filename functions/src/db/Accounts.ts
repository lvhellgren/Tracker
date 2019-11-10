import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { createAccountResource } from './AccountResources';
import { createAccountTraffic } from './AccountTraffic';

export const ACCOUNTS = 'accounts';
export const ACCOUNTS_COLL = admin.firestore().collection(ACCOUNTS);

export const onCreateAccount = functions.firestore
  .document(ACCOUNTS + '/{account}')
  .onCreate((event) => {
    const accountId = event.data().accountId;
    return Promise.all([createAccountTraffic(accountId), createAccountResource(accountId)])
  });
