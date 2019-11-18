import { Component } from '@angular/core';
import { ACT_NOTIFICATION_SUBSCRIBER } from '../../../drawers/help/help.service';

@Component({
  selector: 'app-act-subscribers-add',
  templateUrl: './act-subscriber.component.html',
  styles: []
})
export class ActSubscriberComponent {
  static page;
  public classRef = ActSubscriberComponent;

  constructor() {
    ActSubscriberComponent.page = ACT_NOTIFICATION_SUBSCRIBER;
  }
}
