
import { Component, OnDestroy, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { Router, ActivatedRoute } from '@angular/router';
import { EuiLoadingService, EuiSidesheetService } from '@elemental-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { MatSelectChange } from '@angular/material/select';
import { Subscription } from 'rxjs';

import { IWriteValue, EntityValue, LocalProperty, ValueStruct, MultiValue, EntityData, IEntity } from 'imx-qbm-dbts';
import {
  PortalShopServiceitems,
  PortalShopCategories,
  PortalItshopPeergroupMemberships,
  RequestableProductForPerson,
  QerProjectConfig,
  PortalItshopPatternRequestable,
} from 'imx-api-qer';

import {
  ColumnDependentReference,
  FkAdvancedPickerComponent,
  EntityService,
  BaseReadonlyCdr,
  BaseCdr,
  AuthenticationService,
  LdsReplacePipe,
  DataTileMenuItem,
  SnackBarService,
} from 'qbm';
import { ProjectConfigurationService } from '../../project-configuration/project-configuration.service';
import { UserModelService } from '../../user/user-model.service';
import { PersonService } from '../../person/person.service';
import { ServiceItemsService } from '../../service-items/service-items.service';
import { ServiceCategoryListComponent } from '../../product-selection/servicecategory-list/servicecategory-list.component';
import { ServiceitemListComponent } from '../../service-items/serviceitem-list/serviceitem-list.component';
import { CategoryTreeComponent } from '../servicecategory-list/category-tree.component';
import { RoleMembershipsComponent } from '../role-memberships/role-memberships.component';
import { RecipientsWrapper } from '../recipients-wrapper';
import { ShelfService } from '../../itshop/shelf.service';
import { ProductDetailsSidesheetComponent } from '../product-details-sidesheet/product-details-sidesheet.component';
import { PatternDetailsSidesheetComponent } from '../pattern-details-sidesheet/pattern-details-sidesheet.component';
import { PatternItemService } from '../../pattern-item-list/pattern-item.service';
import { PatternItemListComponent } from '../../pattern-item-list/pattern-item-list.component';
import { OptionalItemsSidesheetComponent } from '../optional-items-sidesheet/optional-items-sidesheet.component';
import { ServiceItemOrder } from '../service-item-order.interface';
import { ProductSelectionService } from '../product-selection.service';
import { CartItemsService } from '../../shopping-cart/cart-items.service';
import { DependencyService } from '../optional-items-sidesheet/dependency.service';
import { QerApiService } from '../../qer-api-client.service';

@Component({
  selector: 'imx-service-items',
  templateUrl: './service-items.component.html',
  styleUrls: ['./service-items.component.scss']
})
export class ServiceItemsComponent implements OnInit {
   
  /**
   * If set to false the css class for the fullscreen view will be deactivated
   */
  public showFullscreen = true;

  @Output() public serviceCategorySelected = new EventEmitter<PortalShopCategories | IEntity>();

  public readonly dataSourceView = { selected: 'cardlist' };
  public includeChildCategories: boolean;
  public cartItemRecipients: ColumnDependentReference;
  public cartItemRecipientsReadonly: ColumnDependentReference;
  public canRequestForSomebodyElse: boolean;
  public recipients: IWriteValue<string>;
  public recipientsWrapper: RecipientsWrapper;
  public uidaccproduct: string;
  public searchString: string;
  public selectedItems: PortalShopServiceitems[] = [];
  public selectedTemplates: PortalItshopPatternRequestable[] = [];
  public selectedRoles: PortalItshopPeergroupMemberships[] = [];
  public employeePreselected: boolean;
  public canSelectFromTemplate: boolean;
  public canSelectByRefUser: boolean;
  public selectedCategory: PortalShopCategories;
  public categoryBoxes: PortalShopCategories[] | any[];
  public referenceUser: ValueStruct<string>;
  public uidPersonPeerGroup: string;
  public displayProducts = true;
  public recipientType: 'self' | 'others' = 'self';
  public showTemplates = false;
  public infoboxVisible = false;
  public infoboxTooltip = '';
  public projectConfig: QerProjectConfig;

  public serviceItemActions: DataTileMenuItem[] = [
    {
      name: 'details',
      description: '#LDS#Details',
      useOnDisabledTile: true,
    },
    {
      name: 'addToCart',
      description: '#LDS#Add to cart',
    },
  ];

  public patternItemActions: DataTileMenuItem[] = [
    {
      name: 'details',
      description: '#LDS#Details',
    },
    {
      name: 'addTemplateToCart',
      description: '#LDS#Add to cart',
    },
  ];

  selectedProduct: any;
  private authSubscription: Subscription;
  private userUid: string;
  

  constructor(
    private readonly selectionService: ProductSelectionService,
    private readonly translate: TranslateService,
    private readonly qerClient: QerApiService,
    private router: Router,
    private dialogService: MatDialog,
    public projectConfigService: ProjectConfigurationService,
    private userModelSvc: UserModelService,
    private activatedRoute: ActivatedRoute,
    private readonly personProvider: PersonService,
    private readonly busyIndicator: EuiLoadingService,
    private readonly serviceItemsProvider: ServiceItemsService,
    private readonly patternItemsService: PatternItemService,
    private readonly optionalItemsService: DependencyService,
    private readonly cartItemsProvider: CartItemsService,
    private readonly shelfService: ShelfService,
    private readonly sideSheetService: EuiSidesheetService,
    private readonly productSelectionService: ProductSelectionService,
    private readonly entityService: EntityService,
    private readonly ldsReplace: LdsReplacePipe,
    private readonly snackbar: SnackBarService,
    authentication: AuthenticationService) {
      this.authSubscription = authentication.onSessionResponse.subscribe((elem) => {
        this.userUid = elem.UserUid;
      });
     }


  public async ngOnInit(): Promise<void> {

       
    this.selectionService.selectedProduct$.subscribe((value) => {
      this.selectedProduct = value;
    });
    
    let response: PortalShopCategories[];

    try {
       response = await (await this.productSelectionService.getServiceCategories({ UID_Person: this.userUid})).Data;
    } catch (error) {
      
    } finally {
        this.categoryBoxes = response;
    }
  
    // define the recipients as a multi-valued property
    const recipientsProperty = new LocalProperty();
    recipientsProperty.IsMultiValued = true;
    recipientsProperty.ColumnName = 'UID_PersonOrdered';
    recipientsProperty.MinLen = 1;
    recipientsProperty.FkRelation = this.qerClient.typedClient.PortalCartitem.GetSchema().Columns.UID_PersonOrdered.FkRelation;

    const dummyCartItemEntity = this.qerClient.typedClient.PortalCartitem.createEntity().GetEntity();
    const fkProviderItems = this.qerClient.client.getFkProviderItems('portal/cartitem').map((item) => ({
      ...item,
      load: (_, parameters = {}) => item.load(dummyCartItemEntity, parameters),
      getDataModel: async (entity) => item.getDataModel(entity),
      getFilterTree: async (entity, parentKey) => item.getFilterTree(entity, parentKey),
    }));

    const column = this.entityService.createLocalEntityColumn(recipientsProperty, fkProviderItems, { Value: this.userUid });
    this.recipients = new EntityValue(column);

    this.recipientsWrapper = new RecipientsWrapper(this.recipients);

    this.canRequestForSomebodyElse = (await this.userModelSvc.getUserConfig()).CanRequestForSomebodyElse;

    // TODO activatedRoute parameters may change, must subscribe to changes

    this.uidaccproduct = this.activatedRoute.snapshot.paramMap.get('UID_AccProduct');
    if (this.uidaccproduct) {
      // TODO load all according to this.categoryModel.SelectedCategory
    }

    this.searchString = this.activatedRoute.snapshot.paramMap.get('ProductSearchString');

    if (this.searchString) {
      /* user can pass product search string by URL parameter -> load the data with this search string
       */
    }

    // preset recipient to the current user
    await this.recipients.Column.PutValueStruct({
      DataValue: this.userUid,
      DisplayValue: await this.getPersonDisplay(this.userUid),
    });

    const uidPerson = this.activatedRoute.snapshot.paramMap.get('UID_Person');

    if (uidPerson) {
      await this.recipients.Column.PutValueStruct({
        DataValue: uidPerson,
        DisplayValue: await this.getPersonDisplay(uidPerson),
      });
      // TODO in this case, CanRequestForSomebodyElse is false
    }

    // apply project configuration
    this.projectConfig = await this.projectConfigService.getConfig();
    this.employeePreselected = this.projectConfig.ITShopConfig.VI_ITShop_Employee_Preselected;
    this.canSelectFromTemplate = this.projectConfig.ITShopConfig.VI_ITShop_ProductSelectionFromTemplate;
    this.canSelectByRefUser = this.projectConfig.ITShopConfig.VI_ITShop_ProductSelectionByReferenceUser;

    this.cartItemRecipients = new BaseCdr(this.recipients.Column, '#LDS#Recipients');

    this.cartItemRecipientsReadonly = new BaseReadonlyCdr(this.recipients.Column, '#LDS#Target identities');
  }


  

  public async handleServiceItemAction(action: { name: string; item: PortalShopServiceitems }): Promise<void> {
    console.log(action.name)
    if (action.name === 'addToCart') {
      this.addItemToCart(action.item);
    }
    if (action.name === 'details') {
      this.requestDetails(action.item);
    }
  }

  public async onAddItemsToCart(): Promise<void> {
    const outgoingOrder: ServiceItemOrder = {
      serviceItems: this.selectedItems,
    };
    this.projectConfig.ITShopConfig.VI_ITShop_AddOptionalProductsOnInsert
    ? await this.openOptionalSideSheet(outgoingOrder)
    : await this.orderSelected(outgoingOrder, this.selectedTemplates, this.selectedRoles);
  }

  public async addItemToCart(serviceItem: PortalShopServiceitems): Promise<void> {
    console.log(serviceItem)
    const outgoingOrder: ServiceItemOrder = {
      serviceItems: [serviceItem],
    };
    this.projectConfig?.ITShopConfig?.VI_ITShop_AddOptionalProductsOnInsert
    ? await this.openOptionalSideSheet(outgoingOrder)
    : await this.orderSelected(outgoingOrder, this.selectedTemplates, this.selectedRoles);
  }


  private async requestDetails(item: PortalShopServiceitems): Promise<void> {
    await this.sideSheetService
      .open(ProductDetailsSidesheetComponent, {
        title: this.translate.instant('#LDS#Heading View Product Details'),
        padding: '0px',
        width: 'max(700px, 60%)',
        headerColour: 'iris-blue',
        bodyColour: 'asher-gray',
        testId: 'product-details-sidesheet',
        data: {
          item,
          projectConfig: this.projectConfig,
        },
      })
      .afterClosed()
      .toPromise();
  }


  public async openOptionalSideSheet(outgoingOrder: ServiceItemOrder): Promise<void> {
    const serviceItemTree = await this.optionalItemsService.checkForOptionalTree(outgoingOrder.serviceItems, this.recipients);
    if (serviceItemTree?.totalOptional && serviceItemTree?.totalOptional > 0) {
      const selectedOptionalOrder: ServiceItemOrder = await this.sideSheetService
        .open(OptionalItemsSidesheetComponent, {
          title: this.translate.instant('#LDS#Heading Optional Products'),
          padding: '0px',
          width: 'max(700px, 60%)',
          headerColour: 'iris-blue',
          bodyColour: 'asher-gray',
          testId: 'optional-items-sidesheet',
          disableClose: true,
          data: {
            serviceItemTree,
            projectConfig: this.projectConfig,
          },
        })
        .afterClosed()
        .toPromise();
      // OptionalItemsSidesheet: If the user click on the AddToCart button add the selected items to the cart, otherwise do nothing
      if (selectedOptionalOrder) {
        outgoingOrder.requestables = selectedOptionalOrder.requestables;
        await this.orderSelected(outgoingOrder, this.selectedTemplates, this.selectedRoles);
      }
    } else {
      // if there are no optional items go ahead with the order
      await this.orderSelected(outgoingOrder, this.selectedTemplates, this.selectedRoles);
    }
  }

  

  private async orderSelected(
    outgoingOrder: ServiceItemOrder,
    templateItems: PortalItshopPatternRequestable[],
    roles?: PortalItshopPeergroupMemberships[]
  ): Promise<void> {
    if (!this.recipients) {
      // We need recipients to continue, return early no dialog due to 91 release
      return;
    }
    const recipientsUids = MultiValue.FromString(this.recipients.value).GetValues();
    const recipientsDisplays = MultiValue.FromString(this.recipients.Column.GetDisplayValue()).GetValues();

    let savedItems = 0;
    let possibleItems = 0;

    if (outgoingOrder?.serviceItems && outgoingOrder.serviceItems.length > 0) {
      this.busyIndicator.show();
      let serviceItemsForPersons: RequestableProductForPerson[];
      try {
        serviceItemsForPersons = this.serviceItemsProvider.getServiceItemsForPersons(
          outgoingOrder.serviceItems,
          recipientsUids.map((uid, index) => ({
            DataValue: uid,
            DisplayValue: recipientsDisplays[index],
          }))
        );
        if (outgoingOrder?.requestables) {
          serviceItemsForPersons.push(...outgoingOrder.requestables);
        }
      } finally {
        this.busyIndicator.hide();
      }
      if (serviceItemsForPersons && serviceItemsForPersons.length > 0) {
        const hasItems = await this.shelfService.setShops(serviceItemsForPersons);
        if (hasItems) {
          setTimeout(() => this.busyIndicator.show());
          try {

            //this.copyShopInfoForDups(serviceItemsForPersons);
            const items = serviceItemsForPersons.filter((item) => item.UidITShopOrg?.length > 0);
            possibleItems = items.length;
            savedItems = await this.cartItemsProvider.addItems(items);
          } finally {
            setTimeout(() => this.busyIndicator.hide());
          }
        }
      }
    }

    if (templateItems && templateItems.length > 0) {
      let templateItemsForPersons: RequestableProductForPerson[];
      try {
        templateItemsForPersons = await this.patternItemsService.getPatternItemsForPersons(
          templateItems,
          recipientsUids.map((uid, index) => ({
            DataValue: uid,
            DisplayValue: recipientsDisplays[index],
          }))
        );
      } finally {
        setTimeout(() => this.busyIndicator.hide());
      }
      if (templateItemsForPersons && templateItemsForPersons.length > 0) {
        const hasItems = await this.shelfService.setShops(templateItemsForPersons);
        if (hasItems) {
          setTimeout(() => this.busyIndicator.show());
          try {
            const items = templateItemsForPersons.filter((item) => item.UidITShopOrg?.length > 0);
            possibleItems = items.length;
            savedItems = await this.cartItemsProvider.addItems(items);
          } finally {
            setTimeout(() => this.busyIndicator.hide());
          }
        }
      }
    }

    if (roles && roles.length > 0) {
      setTimeout(() => this.busyIndicator.show());
      try {
        await this.cartItemsProvider.addItemsFromRoles(
          roles.map((item) => item.XObjectKey.value),
          this.recipientsWrapper?.uids
        );
        possibleItems = roles.length;
        savedItems = roles.length;
      } finally {
        setTimeout(() => this.busyIndicator.hide());
      }
    }

    if (savedItems !== possibleItems) {
      this.snackbar.open({
        key: savedItems === 0 ? '#LDS#No item was added to your shopping cart' : '#LDS#{0} of {1} items could not be added to your shopping cart',
        parameters: [possibleItems - savedItems, possibleItems],
      });
    }
    if (savedItems > 0) {
      this.router.navigate(['shoppingcart']);
    } else {
      //this.onDeselectAll();
    }
  }

  private async getPersonDisplay(uid: string): Promise<string> {
    const person = await this.personProvider.get(uid);
    if (person && person.Data.length) {
      return person.Data[0].GetEntity().GetDisplay();
    }

    return uid;
  }


}
