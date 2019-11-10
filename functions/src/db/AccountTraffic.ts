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

export interface AccountTraffickey {
  month?: string;
  year?: string;
  key?: string;
}

export function createAccountTraffic(accountId: string) {
  const keyObj = makeRecordKey(accountId);
  const accountTraffic: AccountTraffic = {
    accountId: accountId,
    month: keyObj.month,
    year: keyObj.year,
    events: 0,
    notifications: 0,
    emails: 0,
    texts: 0
  };

  return ACCOUNT_TRAFFIC_COLL.doc(keyObj.key).set(accountTraffic);
}

export function makeRecordKey(accountId: string): AccountTraffickey {
  const accountTraffickey: AccountTraffickey = {};
  const date = new Date();
  accountTraffickey.month =  (date.getMonth() + 1).toString();
  accountTraffickey.year = date.getFullYear().toString();
  accountTraffickey.key = accountId + ':' + accountTraffickey.month + ':' + accountTraffickey.year;

  return accountTraffickey;
}
