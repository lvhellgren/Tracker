import { TestBed } from '@angular/core/testing';

import { LandmarksService } from './landmarks.service';

describe('LandmarksService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LandmarksService = TestBed.get(LandmarksService);
    expect(service).toBeTruthy();
  });
});
