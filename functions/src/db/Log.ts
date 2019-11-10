import * as admin from 'firebase-admin';

const LOG_COLL = admin.firestore().collection('log');

export const enum Type {
  INFO = 'INFO',
  ERR = 'ERR',
}

export const log = function (type: Type, func: string, msg: string) {
  return LOG_COLL.doc().set({
    time: new Date(),
    type: type.toString(),
    function: func,
    msg: msg
  });
}
