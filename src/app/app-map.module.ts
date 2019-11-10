import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    AgmCoreModule.forRoot({
      // apiKey: 'AIzaSyD-LFpn2il_UILZqIXVDpU0M6gQjS_RYUQ',
      apiKey: 'AIzaSyD26vbptBZwkmN3GKnEj_srZntESG9Q_D4',
      libraries: ['places']
    })
  ],
  exports: [
    AgmCoreModule
  ]
})
export class AppMapModule {
}
