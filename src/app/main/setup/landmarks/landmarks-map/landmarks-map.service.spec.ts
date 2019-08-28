import { TestBed } from '@angular/core/testing';

import { LandmarksMapService } from './landmarks-map.service';

describe('LandmarksMapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LandmarksMapService = TestBed.get(LandmarksMapService);
    expect(service).toBeTruthy();
  });
});
