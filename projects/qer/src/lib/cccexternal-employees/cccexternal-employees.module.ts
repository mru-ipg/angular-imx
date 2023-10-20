import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExternalEmployeesComponent } from './external-employees/external-employees.component';
import { RouterModule, Routes } from '@angular/router';
import { CdrModule, RouteGuardService } from 'qbm';
import { RequestsFeatureGuardService } from '../requests-feature-guard.service';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { DataSourceToolbarModule, DataTableModule, QbmModule } from 'qbm';
import { ExternalEmployeeDetailsComponent } from './external-employee-details/external-employee-details.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LdsReplaceModule } from 'qbm';



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
    CdrModule,
    MatInputModule,
    MatFormFieldModule,
    RouterModule.forChild(routes),
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    LdsReplaceModule,
    EuiCoreModule,
    EuiMaterialModule,
    DataSourceToolbarModule,
    DataTableModule,
    QbmModule
  ],
  exports: [ExternalEmployeesComponent, ExternalEmployeeDetailsComponent],
})
export class CCCExternalEmployeesModule { }
