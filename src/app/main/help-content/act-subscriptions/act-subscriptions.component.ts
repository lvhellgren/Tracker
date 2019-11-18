import { Component, OnInit } from '@angular/core';
import { ACT_NOTIFICATION_SUBSCRIPTIONS } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './act-subscriptions.component.html',
  styles: []
})
export class ActSubscriptionsComponent {
  static page;
  public classRef = ActSubscriptionsComponent;

  constructor() {
    ActSubscriptionsComponent.page = ACT_NOTIFICATION_SUBSCRIPTIONS;
  }
}
