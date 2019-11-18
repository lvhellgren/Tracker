import { Component } from '@angular/core';
import { ACT_NOTIFICATION_SUBSCRIBERS } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './act-subscribers.component.html',
  styles: []
})
export class ActSubscribersComponent {
  static page;
  public classRef = ActSubscribersComponent;

  constructor() {
    ActSubscribersComponent.page = ACT_NOTIFICATION_SUBSCRIBERS;
  }
}
