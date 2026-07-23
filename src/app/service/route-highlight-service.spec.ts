import { TestBed } from '@angular/core/testing';

import { RouteHighlightService } from './route-highlight-service';

describe('RouteHighlightService', () => {
  let service: RouteHighlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteHighlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
