import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { RouterModule, Routes } from '@angular/router';
import { EuiCoreModule, EuiMaterialModule } from '@elemental-ui/core';
import { TranslateModule } from '@ngx-translate/core';
import { CdrModule, DataSourceToolbarModule, DataTableModule, LdsReplaceModule, QbmModule, RouteGuardService } from 'qbm';
import { RequestsFeatureGuardService } from '../requests-feature-guard.service';
import { CreateNewEmployeeComponent } from './create-new-employee/create-new-employee.component';
import { ExternalEmployeeDetailsComponent } from './external-employee-details/external-employee-details.component';
import { ExternalEmployeesComponent } from './external-employees/external-employees.component';



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
    ExternalEmployeeDetailsComponent,
    CreateNewEmployeeComponent
  ],
  imports: [
    CommonModule,
    CdrModule,
    MatInputModule,
    MatFormFieldModule,
    RouterModule.forChild(routes),
    MatListModule,
    MatButtonModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    LdsReplaceModule,
    EuiCoreModule,
    EuiMaterialModule,
    DataSourceToolbarModule,
    FormsModule,
    ReactiveFormsModule,
    DataTableModule,
    QbmModule
  ],
  exports: [ExternalEmployeesComponent, ExternalEmployeeDetailsComponent, CreateNewEmployeeComponent],
})
export class CCCExternalEmployeesModule { }
