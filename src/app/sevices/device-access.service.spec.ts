import { TestBed } from '@angular/core/testing';

import { DeviceAccessService } from './device-access.service';

describe('DeviceAccessService', () => {
  let service: DeviceAccessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
