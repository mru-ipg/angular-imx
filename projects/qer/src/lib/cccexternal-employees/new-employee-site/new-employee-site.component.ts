import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EuiLoadingService } from '@elemental-ui/core';
import { BaseCdr, ColumnDependentReference, ConfirmationService, SnackBarService } from 'qbm';
import { IdentitiesService } from '../../identities/identities.service';
//import { DuplicateCheckParameter } from './duplicate-check-parameter.interface';
//import { DuplicatesSidesheetComponent } from './duplicates-sidesheet/duplicates-sidesheet.component';
import { TranslateService } from '@ngx-translate/core';

import { PortalPersonReportsInteractive, QerProjectConfig } from 'imx-api-qer';
import { Subscription } from 'rxjs';
import { ProjectConfig } from 'imx-api-qbm';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';

@Component({
  selector: 'imx-new-employee-site',
  templateUrl: './new-employee-site.component.html',
  styleUrls: ['./new-employee-site.component.scss']
})
export class NewEmployeeSiteComponent implements OnDestroy {

  public identityForm = new FormGroup({});
  public cdrListPersonal: ColumnDependentReference[] = [];
  public cdrListOrganizational: ColumnDependentReference[] = [];
  public cdrListLocality: ColumnDependentReference[] = [];
  public cdrListIdentifier: ColumnDependentReference[] = [];
  public nameIsOff = 0;
  public accountIsOff = 0;
  public mailIsOff = 0;
  public isExternal = false;

  private subscriptions: Subscription[] = [];

  public selectIdentity: PortalPersonReportsInteractive;
  private projectConfig: QerProjectConfig


  constructor(

    private readonly busyService: EuiLoadingService,
    private readonly configService: ProjectConfigurationService,
    private readonly snackbar: SnackBarService,
    private readonly translate: TranslateService,
    private readonly confirm: ConfirmationService,
    private readonly identityService: IdentitiesService) {
    this.setup()
  }


  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  async ngOnInit(): Promise<void> {
    try {
      this.busyService.show();
      this.projectConfig = await this.configService.getConfig();
      
    } catch (error) {
      console.error(error);
      
    } finally {
      this.busyService.hide();
    }
    
  
  
  }


  public async submit(): Promise<void> {
    if (this.identityForm.valid) {


      let canSubmit = true;
      if (this.mailIsOff || this.nameIsOff) {
        canSubmit = await this.confirm.confirm({
          Title: '#LDS#Heading Create Identity With Same Properties',
          Message: this.mailIsOff && this.nameIsOff ?
            '#LDS#There is at least one identity with the same properties. Are you sure you want to create the identity?'
            : this.mailIsOff ?
              '#LDS#There is at least one identity with the same email address. Are you sure you want to create the identity?' :
              '#LDS#There is at least one identity with the same first and last name. Are you sure you want to create the identity?',
          identifier: 'create-new-identity-confirm-saving'
        });
      }

      if (!canSubmit) {
        return;
      }

      const overlayRef = this.busyService.show();
      try {
        await this.selectIdentity.GetEntity().Commit(true);
        this.snackbar.open({ key: '#LDS#The identity has been successfully created.' });
      } finally {
        this.busyService.hide(overlayRef);
      }
    }
  }


  public update(cdr: ColumnDependentReference, list: ColumnDependentReference[]): void {
    const index = list.findIndex(elem => elem.column.ColumnName === cdr.column.ColumnName);
    if (index === -1) { return; }

    this.identityForm.removeControl(cdr.column.ColumnName);
    list.splice(index, 1, new BaseCdr(cdr.column));
  }

  public async checkValues(name: string): Promise<void> {
    switch (name) {
      case 'FirstName':
      case 'LastName':
        this.nameIsOff = (await this.identityService.getDuplicates(
          {
            filter: this.identityService.buildFilterForduplicates(
              {
                firstName: this.selectIdentity.GetEntity().GetColumn('FirstName').GetValue(),
                lastName: this.selectIdentity.GetEntity().GetColumn('LastName').GetValue(),
              }
            ), PageSize: -1
          }
        )).totalCount;
        break;
      case 'CentralAccount':
        this.accountIsOff = (await this.identityService.getDuplicates(
          {
            filter: this.identityService.buildFilterForduplicates(
              {
                centralAccount: this.selectIdentity.GetEntity().GetColumn('CentralAccount').GetValue()
              }
            ), PageSize: -1
          }
        )).totalCount;
        break;
      case 'DefaultEmailAddress':
        this.mailIsOff = (await this.identityService.getDuplicates(
          {
            filter: this.identityService.buildFilterForduplicates(
              {
                defaultEmailAddress: this.selectIdentity.GetEntity().GetColumn('DefaultEmailAddress').GetValue()
              }
            ), PageSize: -1
          }
        )).totalCount;
        break;
    }
  }

  private async setup(): Promise<void> {

    this.selectIdentity = await this.identityService.createEmptyEntity();
    
    this.selectIdentity.GetEntity().GetColumn('IsExternal').PutValue(true);

    const identifierColumns = ['FirstName', 'LastName', 'CentralAccount', 'DefaultEmailAddress'];
    this.cdrListIdentifier = identifierColumns.map(col => new BaseCdr(this.selectIdentity.GetEntity().GetColumn(col)));

   const personalColumns = this.projectConfig.PersonConfig.VI_Employee_MasterData_Attributes.filter(personal => !identifierColumns.includes(personal));
    this.cdrListPersonal = personalColumns.map(col => new BaseCdr(this.selectIdentity.GetEntity().GetColumn(col)));

    const organizationalColumns = this.projectConfig.PersonConfig.VI_Employee_MasterData_OrganizationalAttributes;
    this.cdrListOrganizational = organizationalColumns.map(col => new BaseCdr(this.selectIdentity.GetEntity().GetColumn(col)));

   /* const localityColumns = this.data.projectConfig.PersonConfig.VI_Employee_MasterData_LocalityAttributes;
    this.cdrListLocality = localityColumns.map(col => new BaseCdr(this.data.selectedIdentity.GetEntity().GetColumn(col))); */
  }



}
