import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalEmployeesComponent } from './external-employees.component';

describe('ExternalEmployeesComponent', () => {
  let component: ExternalEmployeesComponent;
  let fixture: ComponentFixture<ExternalEmployeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExternalEmployeesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
