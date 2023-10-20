import { Component, Inject, OnInit } from '@angular/core';
import { EUI_SIDESHEET_DATA } from '@elemental-ui/core';
import { PortalPersonUid } from 'imx-api-qer';
import { EntitySchema, IEntityColumn } from 'imx-qbm-dbts';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';


@Component({
  selector: 'imx-external-employee-details',
  templateUrl: './external-employee-details.component.html',
  styleUrls: ['./external-employee-details.component.scss']
})
export class ExternalEmployeeDetailsComponent implements OnInit {

  public columns: IEntityColumn[]

  private schema: EntitySchema

  constructor(

    @Inject(EUI_SIDESHEET_DATA)
    private readonly data: PortalPersonUid,
    private readonly configService:  ProjectConfigurationService
  ) { 

    this.schema = data.GetEntity().GetSchema();

  }

  public async ngOnInit(): Promise<void> {
    let personConfig = (await this.configService.getConfig()).PersonConfig;
    let colNames = personConfig.VI_MyData_WhitePages_DetailAttributes;
    this.columns = colNames.filter(colName => this.schema.Columns[colName]).map(colName => this.data.GetEntity().GetColumn(colName));
  }

}
