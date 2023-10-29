import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewEmployeeSiteComponent } from './new-employee-site.component';

describe('NewEmployeeSiteComponent', () => {
  let component: NewEmployeeSiteComponent;
  let fixture: ComponentFixture<NewEmployeeSiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewEmployeeSiteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewEmployeeSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
