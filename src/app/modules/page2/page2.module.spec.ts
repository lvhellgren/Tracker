import { Page2Module } from './page2.module';

describe('Page2Module', () => {
  let page2Module: Page2Module;

  beforeEach(() => {
    page2Module = new Page2Module();
  });

  it('should create an instance', () => {
    expect(page2Module).toBeTruthy();
  });
});
