import * as admin from 'firebase-admin';

export const LANDMARK_ACTIVITY = 'landmark-activity';
export const LANDMARK_ACTIVITY_COLL = admin.firestore().collection(LANDMARK_ACTIVITY);

export interface LandmarkActivityDoc {
  accountId?: string;
  landmarkId?: string;
  deviceId?: string;
  activity?: string;
  latitude?: number;
  longitude?: number;
  time?: Date;
}
