
import { OverlayRef } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { PortalPersonUid } from 'imx-api-qer';
import { CollectionLoadParameters, EntitySchema } from 'imx-qbm-dbts';
import { IdentitiesService } from '../../identities/identities.service';
import { QerApiService } from '../../qer-api-client.service';
import { ExternalEmployeeDetailsComponent } from '../external-employee-details/external-employee-details.component';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { F } from '@angular/cdk/keycodes';



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

  search = new FormControl();
  currentSearchValue: string;

  constructor(private readonly identitiesService: IdentitiesService, 
    private readonly apiClient: QerApiService,
    private readonly busyService: EuiLoadingService,
    private readonly slideSheet: EuiSidesheetService
    ) { 
      
    }

  public async ngOnInit(): Promise<void> {
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
          console.log('triugger');
          
    
        } else {
    
          this.dataSource = originalData;
    
        }
      });
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

}
