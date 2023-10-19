import { E } from '@angular/cdk/keycodes';
import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { EuiLoadingComponent, EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { PortalPersonAll, PortalPersonAllWrapper, PortalPersonUid } from 'imx-api-qer';
import { CollectionLoadParameters, EntitySchema, IClientProperty, TypedEntityCollectionData } from 'imx-qbm-dbts';
import { IdentitiesService } from '../../identities/identities.service';
import { QerApiService } from '../../qer-api-client.service';
import { ExternalEmployeeDetailsComponent } from '../external-employee-details/external-employee-details.component';



@Component({
  selector: 'imx-external-employees',
  templateUrl: './external-employees.component.html',
  styleUrls: ['./external-employees.component.scss']
})
export class ExternalEmployeesComponent implements OnInit {

  public readonly schema: EntitySchema;
  public navigationState: CollectionLoadParameters = { PageSize: 500, withProperties: 'IsExternal' };

  public displayedColumns: string[] = ['Person_UID', 'Name', 'Default Email Address', 'actions'];
  dataSource: any[];

  constructor(private readonly identitiesService: IdentitiesService, 
    private readonly apiClient: QerApiService,
    private readonly busyService: EuiLoadingService,
    private readonly slideSheet: EuiSidesheetService
    ) { }

  public async ngOnInit(): Promise<void> {
    const response = await this.identitiesService.getAllPerson(this.navigationState);
    const externalEmployee = response.Data.map((c: any) => c.entity.entityData);
    const data = externalEmployee.filter(ex => ex.Columns.IsExternal.Value === true);
    this.dataSource = data;
  }
 
  public async navigateToDetails(person_UID:string):Promise<void> { 
    let overlayRef: OverlayRef;
    setTimeout(() => (overlayRef = this.busyService.show()));
    let response: any;
    let data: any[];
    try {
       response = await this.apiClient.typedClient.PortalPersonUid.Get(person_UID);
       data = response.Data[0];
    
    } catch (error) {
  
      console.error(e => error)
    
    } finally { 
      this.busyService.hide();
  
    }

    this.slideSheet.open(ExternalEmployeeDetailsComponent, { 
      title: 'External Person',
      headerColour: 'green',
      padding: '0',
      width:' 600px',
      data: data
    })

    
  }

}
