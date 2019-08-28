import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD-LFpn2il_UILZqIXVDpU0M6gQjS_RYUQ',
      libraries: ['places']
    })
  ],
  exports: [
    AgmCoreModule
  ]
})
export class AppMapModule {
}
