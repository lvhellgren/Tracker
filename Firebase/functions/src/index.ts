import * as functions from 'firebase-functions';

// Setup and Deployment
// https://firebase.google.com/docs/functions/get-started
// https://www.youtube.com/watch?v=DYfP-UIKxH0
//
// 1.
// 2. CD Firestore/functions
// 3. $ firebase login
// 4. $ firebase init functions
// 5. $ firebase deploy --only functions

// Initialize the Firebase application with admin credentials
const admin = require('firebase-admin');
admin.initializeApp();

// exports.addStep = functions.firestore
//   .document('steps/{step}')
//   .onWrite((event) => {
//     const stepDoc = event.after.data();
//     const lastStepsRef = admin.firestore().collection('last-steps').doc(stepDoc.account + ':' + stepDoc.deviceId);
//     return lastStepsRef.get()
//       .then(lastStepsSnap => {
//         if (!lastStepsSnap.empty) {
//           // Update the previous step with the bearing value to this step:
//           admin.firestore().collection('steps').doc(lastStepsSnap.data().documentId).update({
//             nextBearing: lastStepsSnap.data().previousBearing
//           });
//
//           admin.firestore().collection('devices').where('deviceId', '==', stepDoc.deviceId).get()
//             .then(devicesSnap => {
//               // Create a new last-step document:
//               if (!devicesSnap.empty) {
//                 stepDoc.name = devicesSnap.docs[0].get('name');
//               } else {
//                 stepDoc.name = 'Unknown Device';
//               }
//               stepDoc.type = 'last-step';
//
//               return lastStepsRef.set(stepDoc);
//             });
//         }
//       });
//   });

exports.addStep = functions.firestore
  .document('steps/{step}')
  .onWrite((event) => {
    const stepDoc = event.after.data();
    const lastStepsRef = admin.firestore().collection('last-steps').doc(stepDoc.account + ':' + stepDoc.deviceId);
    return Promise.all([
      updatePreviousStepsDoc(stepDoc, lastStepsRef),
      writeLastStepsDoc(stepDoc, lastStepsRef)
    ])
  });

function updatePreviousStepsDoc(stepDoc, lastStepsRef) {
  return lastStepsRef.get()
    .then(snap => {
      if (!snap.empty) {
        return admin.firestore().collection('steps').doc(snap.data().documentId).update({
          bearingForward: stepDoc.previousBearing
        });
      }
    });
}

function writeLastStepsDoc(stepDoc, lastStepsRef) {
  return admin.firestore().collection('devices').where('deviceId', '==', stepDoc.deviceId).get()
    .then(snap => {
      if (!snap.empty) {
        stepDoc.name = snap.docs[0].get('name');
      } else {
        stepDoc.name = 'Unknown Device';
      }
      stepDoc.type = 'last-step';

      return lastStepsRef.set(stepDoc);
    });
}
