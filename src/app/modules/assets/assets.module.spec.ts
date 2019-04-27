import { AssetsModule } from './Assets.module';

describe('AssetsModule', () => {
  let assetsModule: AssetsModule;

  beforeEach(() => {
    assetsModule = new AssetsModule();
  });

  it('should create an instance', () => {
    expect(AssetsModule).toBeTruthy();
  });
});
