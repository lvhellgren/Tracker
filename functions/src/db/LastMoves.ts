import * as admin from 'firebase-admin';

export const LAST_MOVES = 'last-moves';
export const LAST_MOVES_COLL = admin.firestore().collection(LAST_MOVES);
