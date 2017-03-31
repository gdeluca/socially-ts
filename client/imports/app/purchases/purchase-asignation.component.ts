
// angular
import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Injectable, Inject, NgModule, Input, Output, EventEmitter  } from '@angular/core';
// import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
// import 'rxjs/add/operator/combineLatest';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/publishLast';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/domain/search-options';

// collections
// import { Counters } from '../../../../both/collections/counters.collection';
import { ProductPurchases } from '../../../../both/collections/product-purchases.collection';
import { ProductSales } from '../../../../both/collections/product-sales.collection';
import { ProductSizes } from '../../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../../both/collections/product-prices.collection';
import { Products } from '../../../../both/collections/products.collection';
import { Purchases, purchasesStatusMapping } from '../../../../both/collections/purchases.collection';
import { Stocks } from '../../../../both/collections/stocks.collection';
import { Stores } from '../../../../both/collections/stores.collection';
import { Tags } from '../../../../both/collections/tags.collection';
import { Users } from '../../../../both/collections/users.collection';

// model 
// import { Counter } from '../../../../both/models/counter.model';
import { ProductPurchase } from '../../../../both/models/product-purchase.model';
import { ProductSale } from '../../../../both/models/product-sale.model';
import { ProductSize } from '../../../../both/models/product-size.model';
import { ProductPrice } from '../../../../both/models/product-price.model';
import { Product } from '../../../../both/models/product.model';
import { Purchase } from '../../../../both/models/purchase.model';
import { Stock } from '../../../../both/models/stock.model';
import { Store } from '../../../../both/models/store.model';
import { Tag } from '../../../../both/models/tag.model';
import { User } from '../../../../both/models/user.model';

// domain
import { Dictionary } from '../../../../both/domain/dictionary';
import { Filter, Filters } from '../../../../both/domain/filter';
import * as _ from 'underscore';

import * as moment from 'moment';
import 'moment/locale/es';

import template from "./purchase-asignation.component.html";
import style from "./purchase-asignation.component.scss";

@Component({
  selector: "purchase-asignation",
  template,
  styles: [ style ] 
})
@InjectUser('currentUser')
export class PurchaseAsignationComponent implements OnInit, OnDestroy {

  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();
  
  filters: Subject<Filters> = new Subject<Filters>();

  filtersParams: Filters = [
    {key: 'code', value:''},
    {key: 'name', value:''},
    {key: 'color', value:''},
    {key: 'brand', value:''},
    {key: 'size', value:''},
    {key: 'model', value:''},
  ];

  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Codigo', 'value':'code'},
    {'key': 'Descripcion', 'value': 'description'},
    {'key': 'Color', 'value':'color'},
    {'key': 'Marca', 'value':'brand'},
    {'key': 'Modelo', 'value':'model'},
    {'key': 'Talle', 'value':'size'},
    {'key': 'Cantidad a distribuir X talle', 'value':'received'},
  ];

  collectionCount: number = 0;
  PAGESIZE: number = 15; 

  orderStatus = purchasesStatusMapping; // from Purchases;

  orderNumber: number;
  
  paginatedSub: Subscription;
  optionsAndParamsSub: Subscription;
  autorunSub: Subscription;
  storesSub: Subscription; 

  currentUser: User;

  purchase: Purchase;
  productPurchases: Observable<ProductPurchase[]>;
  productSizes: Observable<ProductSize[]>;
  products: Observable<Product[]>;
  stocks: Observable<Stock[]>;
  allStores: Observable<Store[]>;


  asignedQuantity: number[] = [];

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private paginationService: PaginationService, 
  )  {} 

  ngOnInit() {
     this.optionsAndParamsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.sortDirection,
      this.sortField,
      this.filters,
      this.activeRoute.params.map(params => params['orderNumber'])
    ).subscribe(([pageSize, curPage, sortDirection, sortField, filters, orderNumber]) => {
      this.orderNumber = +orderNumber;

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
        'purchase-orders', this.orderNumber).subscribe(() => {
        this.purchase = Purchases.findOne(
          {purchaseNumber: this.orderNumber})
        this.productPurchases = ProductPurchases.find(
          { purchaseId: this.purchase._id }).zone();
        this.productSizes = ProductSizes.find().zone();
        this.products = Products.find().zone();
        this.stocks = Stocks.find({}).zone();

        this.loadInputboxValues(); 
      });

    });

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfPurchases');
      this.paginationService.setTotalItems(
        this.paginationService.defaultId(), this.collectionCount);
    });

    if (this.storesSub) {
      this.storesSub.unsubscribe();
    } 
    this.storesSub = MeteorObservable.subscribe('stores')
      .subscribe(() => {
        this.allStores = Stores.find({}).zone();
    });

    this.paginationService.register({
      id: this.paginationService.defaultId(),
      itemsPerPage: this.PAGESIZE,
      currentPage: 1,
      totalItems: this.collectionCount,
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortField.next('description');
    this.sortDirection.next(1);
    this.filters.next(this.filtersParams);
  }

  ngOnDestroy() {
    this.paginatedSub.unsubscribe();
    this.autorunSub.unsubscribe();
    this.optionsAndParamsSub.unsubscribe();
    this.storesSub.unsubscribe();
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
 
  getProduct(productId:Product) {
    return Products.findOne({_id: productId});
  }

  getStockQuantityForSizeAndStore(productSizeId, storeId):number {
    return Stocks.collection.find({productSizeId: productSizeId, storeId: storeId}, {fields: {quantity: 1}})
      .fetch()
      .reduce((a, b) => a + +b.quantity, 0);
  }

  loadInputboxValues(){
    let storesIds = Stores.collection.find().fetch().map(function(store) {return store._id});
    this.productPurchases.mergeMap(productPurchases => {
      return productPurchases.map(productPurchase => {
        return productPurchase})})
    .subscribe(productPurchase => {
      storesIds.map(storeId => {
        // let stock = Stocks.findOne({storeId: storeId, productSizeId: productPurchase.productSizeId});
        // if (
        //   !this.asignedQuantity[productPurchase.productSizeId + storeId]) {
        //   this.asignedQuantity[productPurchase.productSizeId + storeId] = stock.quantity;
        // }
         if (
          !this.asignedQuantity[productPurchase.productSizeId + storeId]) {
          this.asignedQuantity[productPurchase.productSizeId + storeId] = 0;
        }
      })
    }) 
  } 

  saveAndChangeAsignationState(){
    let storeIds = Stores.collection.find().fetch().map(function(store) {return store._id});
    if (this.validateStockDelivery(storeIds, this.productPurchases)) {
      this.productPurchases.distinct().mergeMap(productPurchases => {
        return productPurchases.map(productPurchase => {
          return productPurchase})})
      .subscribe(productPurchase => {
          console.log('calling update for ',productPurchase._id, storeIds);
         this.callUpdateStock(productPurchase, storeIds); // set the new stock values
        }
      )
       this.callMoveToFinishState();  // set the new pruchase order state
    }
  }

  validateStockDelivery(storeIds, productPurchases) {
    let flag = true;
    productPurchases.distinct().mergeMap(productPurchases => {
        return productPurchases.map(productPurchase => {
          return productPurchase})})
    .subscribe(productPurchase => {
      
      let asignedSum = storeIds.map(storeId => {
        return this.asignedQuantity[productPurchase.productSizeId + storeId]
      }).reduce((a, b) => a + +b, 0);
      if ( asignedSum != +productPurchase.quantity) {
        Bert.alert('No conciden los montos de stock a asignar, se esperaba : ' 
          +  productPurchase.quantity  + ', el monto asignado es de ' + asignedSum, 
          'danger', 'growl-top-right' ); 
        flag = false;
      }
    })
    return flag;
  }

  callMoveToFinishState() {
    MeteorObservable.call(
      'updatePurchaseOrderStatus', 
      this.purchase._id, 
      'FINISHED'
    ).subscribe(
      (response) => {
       this.router.navigate(['purchases']); 
       Bert.alert('Se actualizo el pedidio al estado FINALIZADO', 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al guardar: ' +  error, 'danger', 'growl-top-right' ); 
    });  
  }

  callUpdateStock(productPurchase, storesIds: string[]){
    storesIds.map(storeId => {
      console.log(
        productPurchase.productSizeId,
        storeId,
        +this.asignedQuantity[productPurchase.productSizeId + storeId]
      );

      MeteorObservable.call("increaseStock",
      productPurchase.productSizeId,
      storeId,
      +this.asignedQuantity[productPurchase.productSizeId + storeId]
    ).subscribe(
    (response) => {
      Bert.alert('Se asignaron los valores de stock', 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al guardar: ' +  error, 'danger', 'growl-top-right' ); 
    }); 
    })
  }

}