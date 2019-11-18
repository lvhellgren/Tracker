import { Component } from '@angular/core';
import { NOTIFICATION } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './notification.component.html',
  styles: []
})
export class NotificationComponent {
  static page;
  public classRef = NotificationComponent;

  constructor() {
    NotificationComponent.page = NOTIFICATION;
  }
}
