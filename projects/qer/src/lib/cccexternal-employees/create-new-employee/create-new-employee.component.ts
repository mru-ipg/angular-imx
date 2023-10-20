import { Component, Inject, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EuiLoadingService, EuiSidesheetRef, EuiSidesheetService, EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { ColumnDependentReference, ConfirmationService, SnackBarService } from 'qbm';
import { IdentitiesService } from '../../identities/identities.service';
//import { DuplicateCheckParameter } from './duplicate-check-parameter.interface';
//import { DuplicatesSidesheetComponent } from './duplicates-sidesheet/duplicates-sidesheet.component';
import { TranslateService } from '@ngx-translate/core';

import { PortalPersonReportsInteractive, QerProjectConfig } from 'imx-api-qer';


@Component({
  selector: 'imx-create-new-employee',
  templateUrl: './create-new-employee.component.html',
  styleUrls: ['./create-new-employee.component.scss']
})
export class CreateNewEmployeeComponent implements OnDestroy {

  public identityForm = new FormGroup({});
  public cdrListPersonal: ColumnDependentReference[] = [];
  public cdrListOrganizational: ColumnDependentReference[] = [];
  public cdrListLocality: ColumnDependentReference[] = [];
  public cdrListIdentifier: ColumnDependentReference[] = [];
  public nameIsOff = 0;
  public accountIsOff = 0;
  public mailIsOff = 0;

  
  constructor(
    @Inject(EUI_SIDESHEET_DATA) public data: {
      selectedIdentity: PortalPersonReportsInteractive,
      projectConfig: QerProjectConfig,
    },
    private readonly busyService: EuiLoadingService,
    private readonly snackbar: SnackBarService,
    private readonly sidesheetRef: EuiSidesheetRef,
    private readonly sidesheetService: EuiSidesheetService,
    private readonly translate: TranslateService,
    private readonly confirm: ConfirmationService,
    private readonly identityService: IdentitiesService) {
  }

  ngOnInit(): void {
  }

}
