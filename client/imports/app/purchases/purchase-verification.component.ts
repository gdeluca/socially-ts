
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
import { SearchOptions } from '../../../../both/search/search-options';

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

import { Dictionary } from '../../../../both/models/dictionary';
import { isNumeric } from '../../validators/validators';

import * as moment from 'moment';
import 'moment/locale/es';

import template from "./purchase-verification.component.html";
import style from "./purchase-verification.component.scss";

@Component({
  selector: "purchase-verification",
  template,
  styles: [ style ] 
})
@InjectUser('currentUser')
export class PurchaseVerificationComponent implements OnInit, OnDestroy {

  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();
  filters: Subject<any> = new Subject<any>();
  collectionCount: number = 0;
  PAGESIZE: number = 15; 

  filtersParams: any = {
      'code': '',
      'name':  '',
      'color': '',
      'brand': '',
      'model': '',
      'size': ''
  };

  orderStatus = purchasesStatusMapping; // from Purchases;

  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Codigo', 'value':'code'},
    {'key': 'Descripcion', 'value': 'description'},
    {'key': 'Color', 'value':'color'},
    {'key': 'Marca', 'value':'brand'},
    {'key': 'Modelo', 'value':'model'},
    {'key': 'Talle', 'value':'size'},
    {'key': 'Cantidad Recibida X talle', 'value':'received'},
    {'key': 'Precio Costo', 'value':'cost'},
    {'key': 'Precio contado', 'value':'cashPrice'},
    {'key': 'Precio tarjeta', 'value':'cardPrice'},
    {'key': 'En stock X talle', 'value':'inStock'},
  ];

  orderNumber: number;
  
  paginatedSub: Subscription;
  optionsAndParamsSub: Subscription;
  autorunSub: Subscription;

  currentUser: User;

  purchase: Purchase;
  productPurchases: Observable<ProductPurchase[]>;
  productSizes: Observable<ProductSize[]>;
  productPrices: Observable<ProductPrice[]>;
  products: Observable<Product[]>;
  stocks: Observable<Stock[]>;

  costPrices: number[] = [];
  cardPrices: number[] = [];
  cashPrices: number[] = [];

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
      this.orderNumber = orderNumber;

      const options: SearchOptions = {
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number),
        sort: { [sortField as string] : sortDirection as number }
      };

      this.paginationService.setCurrentPage(this.paginationService.defaultId() , curPage as number);

      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }
      this.paginatedSub = MeteorObservable.subscribe('purchase-orders', this.orderNumber).subscribe(() => {
        this.purchase = Purchases.findOne({purchaseNumber: this.orderNumber})
        this.productPurchases = ProductPurchases.find({ purchaseId: this.purchase._id }).zone();
        this.productSizes = ProductSizes.find().zone();
        this.products = Products.find().zone();
        this.stocks = Stocks.find({}).zone();
        this.productPrices = ProductPrices.find({}).zone();
        this.loadInputboxValues(); 
      });

    });

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfPurchases');
      this.paginationService.setTotalItems(this.paginationService.defaultId(), this.collectionCount);
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortField.next('description');
    this.sortDirection.next(1);
    this.filters.next('');

    this.paginationService.register({
      id: this.paginationService.defaultId(),
      itemsPerPage: this.PAGESIZE,
      currentPage: 1,
      totalItems: this.collectionCount,
    });
  }

  ngOnDestroy() {
    this.paginatedSub.unsubscribe();
    this.autorunSub.unsubscribe();
    this.optionsAndParamsSub.unsubscribe(); 
  }

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }

  changeSortOrder(direction: string, fieldName: string): void {
    this.sortDirection.next(parseInt(direction));
    this.sortField.next(fieldName);
  }

  search(field: string, value: string): void {    
    if (value == 'undefined')  {
      value = '';
    }
    // no value change on blur
    if (this.filtersParams[field] === value) {
      return;
    }
    this.filtersParams[field] = value.toUpperCase();

    this.curPage.next(1);
    this.filters.next(this.filtersParams);
  }

  getProduct(productId:Product) {
    return Products.findOne({_id: productId});
  }

  getStockQuantityForSize(productSizeId):number {
    return Stocks.collection.find({productSizeId: productSizeId}, {fields: {quantity: 1}})
      .fetch()
      .reduce((a, b) => a + +b.quantity, 0);
  }

  loadInputboxValues(){
    this.productPrices.mergeMap(productPrices => {
      return productPrices.map(productPrice => {
        return productPrice})})
    .subscribe(productPrice => {
      let product = Products.findOne({_id: productPrice.productId});
      if (!(this.costPrices[product._id] || this.cardPrices[product._id] || this.cashPrices[product._id])) {
        this.costPrices[product._id] = productPrice.lastCostPrice
        this.cardPrices[product._id] = productPrice.priceCard
        this.cashPrices[product._id] = productPrice.priceCash
      }
    }) 
  } 

  saveAndChangeVerificationState(){
    this.productPurchases.mergeMap(productPurchases => {
      return productPurchases.map(productPurchase => {
        return productPurchase})})
    .subscribe(productPurchase => {
      let productSize = ProductSizes.findOne({_id: productPurchase.productSizeId});
      let product = Products.findOne({_id: productSize.productId});
       this.callUpdateProductPrices(product); // update the product prices set
       this.callUpdateProductPurchase(productPurchase, product); // update the product purchases quantities 
      }
    )
    this.callMoveToAsignation();  // set the new pruchase order state
  }

  callUpdateProductPurchase(productPurchase, product){
    console.log("updateProductPurchase",
    productPurchase._id,
      +this.costPrices[product._id],
      +productPurchase.quantity,
      +productPurchase.quantity * +this.costPrices[product._id]
      );
    MeteorObservable.call("updateProductPurchase",
      productPurchase._id,
      +this.costPrices[product._id],
      +productPurchase.quantity,
      +productPurchase.quantity * +this.costPrices[product._id]
    ).subscribe(
    (response) => {
      Bert.alert('Se guardaron los nuevos estados en los pedidios', 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al guardar: ' +  error, 'danger', 'growl-top-right' ); 
    });  
  }

  callUpdateProductPrices(product) {
    console.log("updateProductPrices",
      product._id,
      +this.costPrices[product._id],
      +this.cashPrices[product._id],
      +this.cardPrices[product._id]
      );
    MeteorObservable.call("updateProductPrices",
      product._id,
      +this.costPrices[product._id],
      +this.cashPrices[product._id],
      +this.cardPrices[product._id]
    ).subscribe(
    (response) => {
      Bert.alert('Se guardaron los nuevos precios', 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al guardar: ' +  error, 'danger', 'growl-top-right' ); 
    });  
  }

  callMoveToAsignation() {
    MeteorObservable.call(
      'updatePurchaseOrderStatus', 
      this.purchase._id, 
      'ASIGNATION'
    ).subscribe(
      (response) => {
       this.router.navigate(['purchases/'+this.orderNumber+'/asignation']); 
       Bert.alert('Se actualizo el pedidio al estado VERIFICADO', 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al guardar: ' +  error, 'danger', 'growl-top-right' ); 
    });  
  }

}