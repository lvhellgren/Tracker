import * as functions from 'firebase-functions';

// Setup and Deployment
// https://firebase.google.com/docs/functions/get-started
// https://www.youtube.com/watch?v=DYfP-UIKxH0
//
// 1. CD Tracker
// 2. $ firebase login
// 3. $ firebase init functions
// 4. $ firebase deploy --only functions

// Initialize the Firebase application with admin credentials
const admin = require('firebase-admin');
admin.initializeApp();

exports.addStep = functions.firestore
  .document('steps/{step}')
  .onCreate((change) => {
    const stepDoc = change.data();
    // @ts-ignore
    const lastStepsRef = admin.firestore().collection('last-steps').doc(stepDoc.account + ':' + stepDoc.deviceId);
    return Promise.all([
      updatePreviousStepsDoc(stepDoc, lastStepsRef)
    ])
  });

function updatePreviousStepsDoc(stepDoc: any, lastStepsRef: any) {
  return lastStepsRef.get()
    .then((snap: any) => {
      if (!snap.empty) {
        admin.firestore().collection('steps').doc(snap.data().documentId).update({
          bearingForward: stepDoc.previousBearing
        });
      }
      writeLastStepsDoc(stepDoc, lastStepsRef);
    });
}

function writeLastStepsDoc(stepDoc: any, lastStepsRef: any) {
  return admin.firestore().collection('devices').where('deviceId', '==', stepDoc.deviceId).get()
    .then((snap: any) => {
      if (!snap.empty) {
        stepDoc.name = snap.docs[0].get('name');
      } else {
        stepDoc.name = 'Unknown Device';
      }
      stepDoc.type = 'last-step';
      stepDoc.version = '3';

      return lastStepsRef.set(stepDoc);
    });
}
