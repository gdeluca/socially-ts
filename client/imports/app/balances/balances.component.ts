// angular
import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Injectable, Inject, NgModule, Input, Output, EventEmitter  } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, CanActivate } from '@angular/router';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';
 
import { Bert } from 'meteor/themeteorchef:bert';

// reactiveX
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/publishLast';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/search/search-options';

// collections
import { Balances, balanceOpsMapping, balanceOps } from '../../../../both/collections/balances.collection';
// import { Categories } from '../../../../both/collections/categories.collection';
// import { Counters } from '../../../../both/collections/counters.collection';
import { UserStores } from '../../../../both/collections/user-stores.collection';
// import { ProductPurchases } from '../../../../both/collections/product-purchases.collection';
// import { ProductSales } from '../../../../both/collections/product-sales.collection';
// import { ProductSizes } from '../../../../both/collections/product-sizes.collection';
// import { Products } from '../../../../both/collections/products.collection';
// import { Purchases } from '../../../../both/collections/purchases.collection';
import { Sales } from '../../../../both/collections/sales.collection';
// import { Sections } from '../../../../both/collections/sections.collection';
// import { Stocks } from '../../../../both/collections/stocks.collection';
import { Stores } from '../../../../both/collections/stores.collection';
// import { Tags } from '../../../../both/collections/tags.collection';
import { Users } from '../../../../both/collections/users.collection';

// model 
import { Balance } from '../../../../both/models/balance.model';
// import { Category } from '../../../../both/models/category.model';
// import { Counter } from '../../../../both/models/counter.model';
import { UserStore } from '../../../../both/models/user-store.model';
// import { ProductPurchase } from '../../../../both/models/product-purchase.model';
// import { ProductSale } from '../../../../both/models/product-sale.model';
// import { ProductSize } from '../../../../both/models/product-size.model';
// import { Product } from '../../../../both/models/product.model';
// import { Purchase } from '../../../../both/models/purchase.model';
import { Sale } from '../../../../both/models/sale.model';
// import { Section } from '../../../../both/models/section.model';
// import { Stock } from '../../../../both/models/stock.model';
import { Store } from '../../../../both/models/store.model';
// import { Tag } from '../../../../both/models/tag.model';
import { User } from '../../../../both/models/user.model';

import { Dictionary } from '../../../../both/models/dictionary';
import { isNumeric } from '../../validators/validators';

import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from '../../modules/multiselect';
import * as moment from 'moment';
import 'moment/locale/es';

import template from "./balances.component.html";
import style from "./balances.component.scss";
 
@Component({
  selector: "balances",
  template,
  styles: [ style ]
})
@InjectUser('currentUser')
export class BalancesComponent {
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filters: Subject<any> = new Subject<any>();

  filtersParams: any = {
    'year':  '',
    'month': '',
    'day': '',
    'store': '',
    'workShift': ''
  };

  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Nº Balance', 'value':'balanceNumber'},
    {'key': 'Año', 'value': 'year'},
    {'key': 'Mes', 'value':'month'},
    {'key': 'Dia', 'value':'day'},
    {'key': 'Turno', 'value':'workShift'},
    {'key': 'Sucursal', 'value':'store'},
    {'key': 'Existencia', 'value':'existence'},
    {'key': 'Operacion', 'value':'operation'},
    {'key': 'Facturacion', 'value':'invoicing'},
  ];

  collectionCount: number = 0;
  PAGESIZE: number = 15; 

  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;
  storesSub: Subscription;


  complexForm: FormGroup;

  currentUser: Meteor.User;

  emptySale = 
    {
      balanceNumber:'', 
      operationState:'' 
    };
  editedBalance: any;
  editing: boolean = false;

  balances: Observable<Balance[]>;
  sales: Observable<Sale[]>;
  userStores: Observable<UserStore[]>;
  stores: Observable<Store[]>;
  allStores: Observable<Store[]>;

  showOperations: boolean = false;
  showStores: boolean = false;

  commonTexts: IMultiSelectTexts = {
      checkAll: 'Todos',
      uncheckAll: 'Ninguno',
      checked: 'Selecionado',
      checkedPlural: 'Seleccionados',
      searchPlaceholder: 'Buscar...',
      defaultTitle: 'Sin seleccion',
      allSelected: 'Todos Selecionados',
  };

  singleSettings: IMultiSelectSettings = {
      pullRight: false,
      enableSearch: false,
      checkedStyle: 'fontawesome',
      buttonClasses: 'btn btn-default btn-secondary',
      selectionLimit: 1,
      autoUnselect: true,
      closeOnSelect: false,
      showCheckAll: false,
      showUncheckAll: false,
      dynamicTitleMaxItems: 1,
      maxHeight: '300px',
  };

  multiSettingsWithChecks: IMultiSelectSettings = {
      pullRight: false,
      enableSearch: false,
      checkedStyle: 'fontawesome',
      buttonClasses: 'btn btn-default btn-secondary',
      selectionLimit: 0,
      autoUnselect: false,
      closeOnSelect: false,
      showCheckAll: true,
      showUncheckAll: true,
      dynamicTitleMaxItems: 10,
      maxHeight: '300px',
  };

  multiSettingsWithoutChecks: IMultiSelectSettings = {
      pullRight: false,
      enableSearch: false,
      checkedStyle: 'fontawesome',
      buttonClasses: 'btn btn-default btn-secondary',
      selectionLimit: 0,
      autoUnselect: false,
      closeOnSelect: false,
      showCheckAll: false,
      showUncheckAll: false,
      dynamicTitleMaxItems: 10,
      maxHeight: '300px',
  };
  
  // /* Labels */
  // myOptions: IMultiSelectOption[] = [
  //     { id: 1, name: 'Car brands', isLabel: true },
  //     { id: 2, name: 'Volvo', parentId: 1 },
  //     { id: 3, name: 'Colors', isLabel: true },
  //     { id: 4, name: 'Blue', parentId: 3 }
  // ];

  yearSelected: number[] = [moment().year() - 2016]; // Default selection
  monthSelected: number[] = [moment().month()];
  daysSelected: number[] = [+moment().format('D')];
  workShiftsSelected: number[] = [1, 2];
  yearsData: IMultiSelectOption[] = [
      { id: 1, name: '2017' },
      { id: 2, name: '2018' },
      { id: 3, name: '2019' },
  ];
  monthsData = [];
  daysData = [];
  workShiftData = [
    { id: 1, name: 'MAÑANA' },
    { id: 2, name: 'TARDE' }
  ]
  storesData = [];
  
  constructor(
    private paginationService: PaginationService, 
    private formBuilder: FormBuilder
  ){
    moment.locale("es");

    this.complexForm = formBuilder.group({
      operation: ['', Validators.required],
    });
  }
 
  ngOnInit() {
    this.optionsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.sortDirection,
      this.sortField,
      this.filters
    ).subscribe(([pageSize, curPage, sortDirection, sortField, filters]) => {
      const options: SearchOptions = {
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number),
        sort: { [sortField as string] : sortDirection as number }
      };
            
      this.paginationService.setCurrentPage(this.paginationService.defaultId() , curPage as number);

      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }
      this.paginatedSub = MeteorObservable.subscribe('balances-sales', options, filters)
        .subscribe(() => {
          this.balances = Balances.find({}).zone();
          this.sales = Sales.find({}).zone();
          this.userStores= UserStores.find({}).zone();
          this.stores = Stores.find({}).zone();
      });

      if (this.storesSub) { 
        this.storesSub.unsubscribe();
      }
      this.storesSub = MeteorObservable.subscribe('stores').subscribe(() => {
        this.allStores = Stores.find({}).zone();

        this.populateStoreData();
      });

      this.populateMonthsData(moment.months(), this.yearSelected);

    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortField.next('balanceNumber');
    this.sortDirection.next(1);
    this.filters.next('');

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfBalances');
      this.paginationService.setTotalItems(this.paginationService.defaultId(), this.collectionCount);
    });

    this.paginationService.register({
      id: this.paginationService.defaultId(),
      itemsPerPage: this.PAGESIZE,
      currentPage: 1,
      totalItems: this.collectionCount,
    });

  }

  ngOnDestroy() {
    this.paginatedSub.unsubscribe();
    this.optionsSub.unsubscribe();
    this.autorunSub.unsubscribe();
    this.storesSub.unsubscribe();
  }

  doShowOperation(condition:boolean){
    this.showOperations = condition;
  }
  
  doShowStores(condition:boolean){
    this.showStores = condition;
  }

  changeSortOrder(direction: string, fieldName: string): void {
    console.log('direction:' + direction + ' fieldname' + fieldName);
    // this.sortDirection.next(parseInt(direction));
    // this.sortField.next(fieldName);
  }

  copy(original: any){
    return Object.assign({}, original)
  }

  filterBy(filter) { 
    console.log(filter);
  }

  daysInMonth(month, year) {
    let count = this.daysInMonthCount(month, year);    
    let result: any[] = [];
    for (var i = 1; i <= count; ++i) {
      result.push({id: i, name: ""+i });
    }  
    return result;
  } 
 
  populateDays(month, year){
    this.daysData = this.daysInMonth(month, year);
    this.daysSelected = [+moment().format('D')];
    this.daysSelected = Array.from(
        new Array(this.daysInMonthCount(month, year)),(val,index)=>index+1);



  }

  populateMonthsData(month, year) {
    let result: any[] = [];
    month.map((month: string) => {
      result.push({id: result.length, name: month });
    });
    this.monthsData = result;

    this.populateDays(month, year);

  }

  daysInMonthCount(month, year) {
    return +moment( year + '-' + [month[0]+1], "YYYY-MM").daysInMonth();
  }

  populateStoreData(){
    let result = [];
    let index = 0;
    this.allStores
      .flatMap(function(stores) { return stores })
      .distinct()
      .subscribe((store) => {
        result.push({id: ++index, name: store['name'] });
      });
      
    this.storesData = result;
  }

  filterFieldById(model, index: number){
    return model.filter((element) => {
      return element.id == index
    })[0].name;
  }

  filterJoinFieldByIds(model, indexes: number[]) {
    return indexes.map((index) => {
      return this.filterFieldById(model, index);
    }).join(", ");
  }

  getFromModel(field: string, index: any) {
    switch(field) { 
      case 'year': { 
        return this.filterFieldById(this.yearsData, index);
      } 
      case 'month': { 
        return this.filterFieldById(this.monthsData, index);
      } 
      case 'days': { 
        let val = this.filterJoinFieldByIds(this.daysData, index);
        return (val.length > 15) ? val.substring(0, 15) + " ..." : val;
      }
      case 'workShift': { 
        return this.filterJoinFieldByIds(this.workShiftData, index);
      } 
      default: { 
        return 'none';
      } 
    } 
  }

  calculateInvoicing() {
  // operate over date or workshift
  // formula: close + extraction - deposit - open 
    return 1000;
  }

}
