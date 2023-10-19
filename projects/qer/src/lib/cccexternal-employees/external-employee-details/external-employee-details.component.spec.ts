import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalEmployeeDetailsComponent } from './external-employee-details.component';

describe('ExternalEmployeeDetailsComponent', () => {
  let component: ExternalEmployeeDetailsComponent;
  let fixture: ComponentFixture<ExternalEmployeeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExternalEmployeeDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalEmployeeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
