import { TestBed } from '@angular/core/testing';

import { ServiceStatusService } from './service-status.service';

describe('ServiceStatusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServiceStatusService = TestBed.get(ServiceStatusService);
    expect(service).toBeTruthy();
  });
});
