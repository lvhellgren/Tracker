import { Component } from '@angular/core';
import { NOTIFICATIONS } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './notifications.component.html',
  styles: []
})
export class NotificationsComponent {
  static page;
  public classRef = NotificationsComponent;

  constructor() {
    NotificationsComponent.page = NOTIFICATIONS;
  }
}
