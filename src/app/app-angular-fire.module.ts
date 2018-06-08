import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {environment} from '../environments/environment';
import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {AngularFireStorageModule} from 'angularfire2/storage';
import {AngularFirestoreModule} from 'angularfire2/firestore';

@NgModule({
   imports: [
      CommonModule,
      AngularFireModule.initializeApp(environment.firebase),
      AngularFireDatabaseModule,
      AngularFireAuthModule,
      AngularFirestoreModule
         // .enablePersistence() // Enables local caching
   ],
   declarations: []
})
export class AppAngularFireModule {
}
