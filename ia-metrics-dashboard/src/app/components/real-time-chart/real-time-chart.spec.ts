import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealTimeChart } from './real-time-chart';

describe('RealTimeChart', () => {
  let component: RealTimeChart;
  let fixture: ComponentFixture<RealTimeChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealTimeChart],
    }).compileComponents();

    fixture = TestBed.createComponent(RealTimeChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
