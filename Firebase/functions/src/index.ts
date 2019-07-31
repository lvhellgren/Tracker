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

exports.addStep = functions.firestore
  .document('steps/{step}')
  .onWrite((event) => {
    const step = event.after.data();
    const lastStepsDoc = admin.firestore().collection('last-steps').doc(step.account + ':' + step.deviceId);

    return admin.firestore().collection('devices').where('deviceId', '==', step.deviceId).get()
      .then(snap => {
        if (!snap.empty) {
          step.name = snap.docs[0].get('name');
        } else {
          step.name = 'Unknown Device';
        }
        step.type = 'last-step';

        return lastStepsDoc.set(step);
      });
  });
