import { Component, OnInit } from '@angular/core';
import { REPORTS, SIMULATOR_EVENTS } from '../../../drawers/help/help.service';

@Component({
  templateUrl: './simulator-events.component.html',
  styles: []
})
export class SimulatorEventsComponent {
static page;
public classRef = SimulatorEventsComponent;

  constructor() {
  SimulatorEventsComponent.page = SIMULATOR_EVENTS;
}
}
