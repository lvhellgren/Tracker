import { DevEnvGuard } from './dev-env-guard';

describe('DevEnvGuard', () => {
  it('should create an instance', () => {
    expect(new DevEnvGuard()).toBeTruthy();
  });
});
