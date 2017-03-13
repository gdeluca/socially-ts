// angular
import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Injectable, Inject, NgModule, Input, Output, EventEmitter  } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, CanActivate } from '@angular/router';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';
 
// reactiveX
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/publishLast';

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
import { isNumeric } from '../validators/validators';


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
  users: Observable<User[]>;

  showOperations: boolean = false;
  showStores: boolean = false;

  constructor(
    private paginationService: PaginationService, 
    private formBuilder: FormBuilder
  ){
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
      this.paginatedSub = MeteorObservable.subscribe('balance-sales', options, filters)
        .subscribe(() => {
          this.balances = Balances.find({}).zone();
          this.sales = Sales.find({}).zone();
          this.userStores= UserStores.find({}).zone();
          this.stores = Stores.find({}).zone();
          this.users = Users.find({}).zone();
      });
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
  }

  doShowOperation(condition:boolean){
    this.showOperations = condition;
  }
  
  doShowStores(condition:boolean){
    this.showStores = condition;
  }

  changeSortOrder(direction: string, fieldName: string): void {
    this.sortDirection.next(parseInt(direction));
    this.sortField.next(fieldName);
  }

  copy(original: any){
    return Object.assign({}, original)
  }



}
