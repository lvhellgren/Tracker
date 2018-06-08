import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AppAngularFireModule} from './app-angular-fire.module';
import {MainModule} from './modules/main/main.module';
import {CoreModule} from './modules/core/core.module';
import {AppMaterialModule} from './app-material.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CoreModule,
    MainModule,
    BrowserModule,
    AppRoutingModule,
    AppAngularFireModule,
    AppMaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
