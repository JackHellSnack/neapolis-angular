import { TestBed } from '@angular/core/testing';

import { PointOfInterestService } from './point-of-interest-service';

describe('PointOfInterestService', () => {
  let service: PointOfInterestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PointOfInterestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
