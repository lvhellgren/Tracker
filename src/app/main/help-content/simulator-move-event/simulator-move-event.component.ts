import { Component, OnInit } from '@angular/core';
import { SIMULATOR_EVENT } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './simulator-move-event.component.html',
  styles: []
})
export class SimulatorMoveEventComponent {
  static page;
  public classRef = SimulatorMoveEventComponent;

  constructor() {
    SimulatorMoveEventComponent.page = SIMULATOR_EVENT;
  }
}
