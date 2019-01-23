// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// export const environment = {
//   production: false,
//   firebase: {
//     apiKey: 'AIzaSyB4iwiMEnxEiQnTDvFxI7_nVdD1Ck6NtL0',
//     authDomain: 'locator-db.firebaseapp.com',
//     databaseURL: 'https://locator-db.firebaseio.com',
//     projectId: 'locator-db',
//     storageBucket: 'locator-db.appspot.com',
//     messagingSenderId: '900748631499'
//   }
// };

export const environment = {
  VERSION: require('../../package.json').version,
  production: false,
  firebase: {
    apiKey: 'AIzaSyDK0YV-6uctI4tVNTVmTcIBux6ltuZTOEw',
    authDomain: 'leapfire-9a5ec.firebaseapp.com',
    databaseURL: 'https://leapfire-9a5ec.firebaseio.com',
    projectId: 'leapfire-9a5ec',
    storageBucket: 'leapfire-9a5ec.appspot.com',
    messagingSenderId: '516525335946'
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
