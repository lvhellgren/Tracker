import { TestBed } from '@angular/core/testing';

import { SubscriberService } from './subscriber.service';

describe('SubscriberService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SubscriberService = TestBed.get(SubscriberService);
    expect(service).toBeTruthy();
  });
});
