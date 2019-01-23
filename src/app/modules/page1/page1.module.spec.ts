import { Page1Module } from './page1.module';

describe('Page1Module', () => {
  let page1Module: Page1Module;

  beforeEach(() => {
    page1Module = new Page1Module();
  });

  it('should create an instance', () => {
    expect(page1Module).toBeTruthy();
  });
});
