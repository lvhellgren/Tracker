import { TestBed } from '@angular/core/testing';

import { MapmarkerService } from './mapmarker.service';

describe('DeviceAccessService', () => {
  let service: MapmarkerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapmarkerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
