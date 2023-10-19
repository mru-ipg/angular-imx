import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExternalEmployeesComponent } from './external-employees/external-employees.component';
import { RouterModule, Routes } from '@angular/router';
import { RouteGuardService } from 'qbm';
import { RequestsFeatureGuardService } from '../requests-feature-guard.service';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { DataSourceToolbarModule, DataTableModule, QbmModule } from 'qbm';
import { ExternalEmployeeDetailsComponent } from './external-employee-details/external-employee-details.component';


const routes: Routes = [
  {
    path: 'externals',
    component: ExternalEmployeesComponent,
    canActivate: [RouteGuardService, RequestsFeatureGuardService],
    resolve: [RouteGuardService],
  }

];


@NgModule({
  declarations: [
    ExternalEmployeesComponent,
    ExternalEmployeeDetailsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatListModule,
    MatButtonModule,
    EuiCoreModule,
    EuiMaterialModule,
    DataSourceToolbarModule,
    DataTableModule,
    QbmModule
  ],
  exports: [ExternalEmployeesComponent],
})
export class CCCExternalEmployeesModule { }
