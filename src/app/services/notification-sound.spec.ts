import { TestBed } from '@angular/core/testing';

import { NotificationSound } from './notification-sound';

describe('NotificationSound', () => {
  let service: NotificationSound;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationSound);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
