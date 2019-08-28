import { TestBed } from '@angular/core/testing';

import { LandmarkService } from './landmark.service';

describe('LandmarkService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LandmarkService = TestBed.get(LandmarkService);
    expect(service).toBeTruthy();
  });
});
