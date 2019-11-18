import { Component, OnInit } from '@angular/core';
import { ACT_NOTIFICATION_SUBSCRIPTION } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './act-subscription.component.html',
  styles: []
})
export class ActSubscriptionComponent {
  static page;
  public classRef = ActSubscriptionComponent;

  constructor() {
    ActSubscriptionComponent.page = ACT_NOTIFICATION_SUBSCRIPTION;
  }
}
