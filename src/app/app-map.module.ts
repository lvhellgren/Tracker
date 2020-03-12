import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    AgmCoreModule.forRoot({
      libraries: ['places']
    })
  ],
  exports: [
    AgmCoreModule
  ]
})
export class AppMapModule {
}
