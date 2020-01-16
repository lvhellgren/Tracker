import * as admin from 'firebase-admin';

export const ACCOUNT_TRAFFIC = 'account-traffic';
export const ACCOUNT_TRAFFIC_COLL = admin.firestore().collection(ACCOUNT_TRAFFIC);

export interface AccountTraffic {
  accountId?: string;
  year?: string;
  month?: string;
  events?: number;
  notifications?: number;
  emails?: number;
  texts?: number;
}

export interface AccountTrafficKey {
  month?: string;
  year?: string;
  key?: string;
}

export async function updateAccountTraffic(accountId: string) {
  const keyObj = makeRecordKey(accountId);
  // @ts-ignore
  return ACCOUNT_TRAFFIC_COLL.doc(keyObj.key).get().then( doc => {
    if (!doc.exists) {
      return createAccountTraffic(keyObj, accountId)
    }
    return Promise.resolve();
  })
  .then( () => {
    return ACCOUNT_TRAFFIC_COLL.doc(keyObj.key).update({events: admin.firestore.FieldValue.increment(1)});
  })
}

export function createAccountTraffic(keyObj: AccountTrafficKey, accountId: string) {
  let accountTraffic: AccountTraffic;
  accountTraffic = {
    accountId: accountId,
    year: keyObj.year,
    month: keyObj.month,
    events: 0,
    emails: 0,
    notifications: 0,
    texts: 0
  };

  return ACCOUNT_TRAFFIC_COLL.doc(keyObj.key).set(accountTraffic);
}

export function makeRecordKey(accountId: string): AccountTrafficKey {
  const accountTrafficKey: AccountTrafficKey = {};
  const date = new Date();
  accountTrafficKey.month =  (date.getMonth() + 1).toString();
  accountTrafficKey.year = date.getFullYear().toString();
  accountTrafficKey.key = accountId + ':' + accountTrafficKey.month + ':' + accountTrafficKey.year;

  return accountTrafficKey;
}
