import { inject, TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

class MockAuthService {
}

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: AuthService, useClass: MockAuthService}
      ]
    });
  });

  it('should create', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});
