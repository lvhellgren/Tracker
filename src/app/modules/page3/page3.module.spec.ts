import { Page3Module } from './page3.module';

describe('Page3Module', () => {
  let page3Module: Page3Module;

  beforeEach(() => {
    page3Module = new Page3Module();
  });

  it('should create an instance', () => {
    expect(page3Module).toBeTruthy();
  });
});
