
import { DOCUMENT } from '@angular/common';
import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { PortalPersonUid } from 'imx-api-qer';
import { CollectionLoadParameters, EntityData, EntitySchema } from 'imx-qbm-dbts';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IdentitiesService } from '../../identities/identities.service';
import { QerApiService } from '../../qer-api-client.service';
import { CreateNewEmployeeComponent } from '../create-new-employee/create-new-employee.component';
import { ExternalEmployeeDetailsComponent } from '../external-employee-details/external-employee-details.component';
import { ProjectConfig } from 'imx-api-qbm';



@Component({
  selector: 'imx-external-employees',
  templateUrl: './external-employees.component.html',
  styleUrls: ['./external-employees.component.scss']
})
export class ExternalEmployeesComponent implements OnInit {

  public readonly schema: EntitySchema;
  public navigationState: CollectionLoadParameters = { PageSize: 500, withProperties: 'IsExternal' };
  private projectConfig: ProjectConfig;

  public checked = false;
  public disabled = false;
  public hasSelectedRows = false;
  public showCustomCsvExporter: boolean = false;

  public displayedColumns: string[] = ['Select','Person_UID', 'Name', 'Default Email Address', 'actions'];

  dataSource: any[];
  selectedRows: any[] = [];

  search = new FormControl();
  currentSearchValue: string;

  constructor(private readonly identitiesService: IdentitiesService,
    @Inject(DOCUMENT) private document: Document, 
    private readonly apiClient: QerApiService,
    private readonly busyService: EuiLoadingService,
    private readonly slideSheet: EuiSidesheetService,
    private readonly configService: ProjectConfigurationService,
    ) { 
      
    }

   async ngOnInit(): Promise<void> {
    this.projectConfig = await this.configService.getConfig();
    const response = await this.identitiesService.getAllPerson(this.navigationState);
    const externalEmployee = response.Data.map((c: any) => c.entity.entityData);
    const data = externalEmployee.filter(ex => ex.Columns.IsExternal.Value === true);
    this.dataSource = data;
    
    const originalData = [...data];

    this.search.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(250))
      .subscribe(() => {
        this.currentSearchValue =  this.search.value;
        if (this.currentSearchValue && this.currentSearchValue.trim() !== '') {
          const filteredExternalsWithValue = originalData.filter(f =>
            f.Display.toLowerCase().startsWith(this.currentSearchValue.toLowerCase())
          );
    
          this.dataSource = filteredExternalsWithValue;
        } else {
    
          this.dataSource = originalData;
        }
      });
  }

  public async createNewIdentity(): Promise<void> {
    let overlayRef: OverlayRef;
    let request: EntityData
    setTimeout(() => (overlayRef = this.busyService.show()));


    this.slideSheet.open( CreateNewEmployeeComponent, { 
      title: 'Create new External Identity',
      headerColour: 'green',
      padding: '0',
      width:' 600px',
      data: {
        selectedIdentity: await this.identitiesService.createEmptyEntity(),
        projectConfig: this.projectConfig
      }
      }).afterClosed().toPromise();
  
      this.busyService.hide()
  }


  public async navigateToDetails(person_UID:string):Promise<void> { 
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    let response: PortalPersonUid;
    let firstName: string;
    try {
       response = (await this.apiClient.typedClient.PortalPersonUid.Get(person_UID)).Data[0];
      
    } catch (error) {

    
    } finally { 
      this.busyService.hide();
      firstName = response.GetEntity().GetDisplay()
  
    }

    this.slideSheet.open(ExternalEmployeeDetailsComponent, { 
      title: firstName,
      headerColour: 'green',
      padding: '0',
      width:' 600px',
      data: response
    })

  }

  onSlideToggle(): void {
    this.showCustomCsvExporter = !this.showCustomCsvExporter;
  }

  onCheckboxChange(event: any, row: any) {
      if (event.checked) {
        this.hasSelectedRows = true;
        this.selectedRows.push(row);
      } else {
        const index = this.selectedRows.indexOf(row);
        if (index >= 0) {
          this.selectedRows.splice(index, 1);
        }
      }

      this.hasSelectedRows = this.selectedRows.length > 0 ? true : false;
  }

  exportCSV(): void {

    const filteredColumns = this.displayedColumns.filter((col) => !['Select', 'actions'].includes(col));
    const headers = filteredColumns.join(',') + '\n';

    const csvRows = this.selectedRows.map((item) => {
     const rowValues =  filteredColumns.map((column) => {
        if (column === 'Name') {
          return item.Display;
        } else if (column === 'Default Email Address') {
          return item.Columns.DefaultEmailAddress.Value;
        } else if (column === 'Person_UID') {
          return item.Keys[0]
        }
      });

      return rowValues;

    }).join('\n');

    const csvData = headers + csvRows;
    const blob = new Blob([csvData], {type: 'text/csv'});
    const url =  window.URL.createObjectURL(blob);

    const a = this.document.createElement('a');
    a.setAttribute('style', 'display:none');
    this.document.body.appendChild(a);
    a.download = 'data_' + this.getCurrentData() +'.csv';
    a.href= url;
    a.click();
    this.document.body.removeChild(a);
  }


  getCurrentData(): string {
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    return  `${day}_${month}_${year}`;
  }

}
