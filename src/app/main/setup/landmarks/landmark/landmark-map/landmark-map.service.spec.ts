import { TestBed } from '@angular/core/testing';

import { LandmarkMapService } from './landmark-map.service';

describe('LandmarkMapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LandmarkMapService = TestBed.get(LandmarkMapService);
    expect(service).toBeTruthy();
  });
});
