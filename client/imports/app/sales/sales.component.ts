// angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, CanActivate } from '@angular/router';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';

// reactiveX
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/domain/search-options';

// collections
import { UserStores } from '../../../../both/collections/user-stores.collection';
import { ProductSales } from '../../../../both/collections/product-sales.collection';
import { Sales, salesStatusMapping, salePaymentMapping, workShiftMapping } from '../../../../both/collections/sales.collection';
import { Stores } from '../../../../both/collections/stores.collection';
import { Users } from '../../../../both/collections/users.collection';

// model 
import { UserStore } from '../../../../both/models/user-store.model';
import { ProductSale } from '../../../../both/models/product-sale.model';
import { Sale } from '../../../../both/models/sale.model';
import { Store } from '../../../../both/models/store.model';
import { User } from '../../../../both/models/user.model';

// domain
import { Dictionary } from '../../../../both/domain/dictionary';
import { Filter, Filters } from '../../../../both/domain/filter';
import * as _ from 'underscore';
import { Bert } from 'meteor/themeteorchef:bert';

import * as moment from 'moment';
import 'moment/locale/es';

import template from "./sales.component.html";
import style from "./sales.component.scss";

@Component({
  selector: "sales",
  template,
  styles: [ style ]
})
@InjectUser('currentUser')
export class SalesComponent {
   
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filters: Subject<Filters> = new Subject<Filters>();

  filtersParams: Filters = [
    {key: 'saleNumber', value:''},
    {key: 'saleState', value:''},
    {key: 'saleDate', value:''},
    {key: 'lastUpdate', value:''},
    {key: 'seller', value:''},
    {key: 'paymentForm', value:''},
  ];

  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Nº Venta', 'value':'saleNumber'},
    {'key': 'Estado', 'value':'status', 'showHeaderFilter': true},
    {'key': 'Forma de Pago', 'value': 'payment', 'showHeaderFilter': true},
    {'key': 'Fecha de Venta', 'value':'saleDate', 'showHeaderFilter': true},
    {'key': 'Ultimo Cambio', 'value':'lastUpdate', 'showHeaderFilter': false},
    {'key': 'Responsable', 'value':'seller', 'showHeaderFilter': true},
    // {'key': 'Sucursal', 'value':'name', 'showHeaderFilter': true},
    {'key': 'Descuento', 'value':'discount', 'showHeaderFilter': false},
    {'key': 'Total', 'value':'total', 'showHeaderFilter': false},
  ];

  collectionCount: number = 0;
  PAGESIZE: number = 6 

  balanceNumber: number;


  paginatedSub: Subscription;
  optionsAndParamsSub: Subscription;
  autorunSub: Subscription;
  usersSub: Subscription;

  // complexForm: FormGroup;

  currentUser: Meteor.User;

  // emptySale = 
  //   {
  //     saleNumber:'', 
  //     saleState:'' 
  //   };
  // editedSale: any;
  // editing: boolean = false;

  salesStatusValues = salesStatusMapping;
  salePaymentValues = salePaymentMapping;
  workShiftValues = workShiftMapping;

  sales: Observable<Sale[]>;
  userStores: Observable<UserStore[]>;
  users: Observable<User[]>;
  // productSales: Observable<ProductSale[]>;
  // stores: Observable<Store[]>;

  constructor(
    private paginationService: PaginationService,
    private activeRoute: ActivatedRoute,
    private router:Router
    // private formBuilder: FormBuilder
  ){
    // this.complexForm = formBuilder.group({
    //   saleState: ['', Validators.required],
    // });
  }

  ngOnInit() {
    this.optionsAndParamsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.sortDirection,
      this.sortField,
      this.filters,
      this.activeRoute.params.map(params => params['balanceNumber'])
    ).subscribe(([pageSize, curPage, sortDirection, sortField, filters, balanceNumber]) => {
      this.balanceNumber = +balanceNumber; 

      const options: SearchOptions = {
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number),
        sort: { [sortField as string] : sortDirection as number }
      };
            
      this.paginationService.setCurrentPage(
        this.paginationService.defaultId() , curPage as number);

      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }
      this.paginatedSub = MeteorObservable.subscribe(
        'store.sales', 
        options, 
        filters,
        this.getCurrentStoreId(),
        this.balanceNumber
      ).subscribe(() => {
        this.sales = Sales.find({}).zone();
        this.userStores= UserStores.find({}).zone();
      });

      if (this.usersSub) { 
        this.usersSub.unsubscribe();
      }
      this.usersSub = MeteorObservable.subscribe(
        'users'
      ).subscribe(() => {
        this.users = Users.find({}).zone();
      });

    });

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfSales');
      this.paginationService.setTotalItems(
        this.paginationService.defaultId(), this.collectionCount);
    });

    this.paginationService.register({
      id: this.paginationService.defaultId(),
      itemsPerPage: this.PAGESIZE,
      currentPage: 1,
      totalItems: this.collectionCount,
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortField.next('saleNumber');
    this.sortDirection.next(-1);
    this.filters.next(this.filtersParams);

  }

  ngOnDestroy() {
    this.paginatedSub.unsubscribe();
    this.optionsAndParamsSub.unsubscribe();
    this.autorunSub.unsubscribe();
    this.usersSub.unsubscribe();
  }
  
  onPageChanged(page: number): void {
    this.curPage.next(page);
  }

  changeSortOrder(direction: string, fieldName: string): void {
    this.sortDirection.next(parseInt(direction));
    this.sortField.next(fieldName);
  }

  search(fieldKey: string, value: string): void {
    if (value == 'undefined')  {
      value = '';
    }

    let filter = _.find(this.filtersParams, function(filter)
      { return filter.key == fieldKey }
    )
    if (filter) {
      if (filter.value === value) {
        return;
      }

      filter.value = value.toUpperCase();

      this.curPage.next(1);
      this.filters.next(this.filtersParams);
    }
  }

  copy(original: any){
    return Object.assign({}, original)
  }

  getCurrentStoreName() {
    let val: string = Session.get("currentStoreName"); 
    return (val != null)?val:'';
  }

  getCurrentStoreId(): string {
    let val: string = Session.get("currentStoreId"); 
    return (val != null)?val:'';
  }

  getCurrentBalanceNumber(): number {
    let val: number = +Session.get("currentBalanceNumber"); 
    return (val != null) ? val : -1;
  }

  getUser(userStoreId) {
    let userStore =  UserStores.findOne({_id: userStoreId});
    if (userStore) {
      return Users.findOne({_id: userStore.userId});
    }
  }

  createOrder(){
    let userStoreId = UserStores.findOne(
      {storeId: this.getCurrentStoreId()})._id;
    MeteorObservable.call('createSaleOrder',
      userStoreId,
      this.getCurrentBalanceNumber(),
      this.getCurrentStoreId()
    ).subscribe(
    (orderNumber) => {
      this.router.navigate(['sales/' + orderNumber]); 
    }, (error) => {
      Bert.alert('Error al crear la venta: ' +  error, 'danger', 'growl-top-right' ); 
    });  
  }
}
