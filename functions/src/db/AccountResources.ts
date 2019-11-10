import * as admin from 'firebase-admin';

export const ACCOUNT_RESOURCES = 'account-resources';
export const ACCOUNT_RESOURCES_COLL = admin.firestore().collection(ACCOUNT_RESOURCES);

export interface AccountResources {
  accountId?: string;
  users?: number;
  devices?: number;
  landmarks?: number;
  subscriptions?: number;
  subscribers?: number;
}

export function createAccountResource(accountId: string) {
  const accountResources: AccountResources = {
    accountId: accountId,
    users: 0,
    devices: 0,
    landmarks: 0,
    subscriptions: 0,
    subscribers: 0
  };

  return ACCOUNT_RESOURCES_COLL.doc(accountId).create(accountResources);
}
