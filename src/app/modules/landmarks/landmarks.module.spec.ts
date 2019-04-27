import { LandmarksModule } from './landmarks.module';

describe('LandmarksModule', () => {
  let landmarksModule: LandmarksModule;

  beforeEach(() => {
    landmarksModule = new LandmarksModule();
  });

  it('should create an instance', () => {
    expect(landmarksModule).toBeTruthy();
  });
});
