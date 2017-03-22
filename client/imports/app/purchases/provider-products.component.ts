
// angular
import { Component, OnInit, OnDestroy, OnChanges, Injectable, Inject, Input, Output, EventEmitter } from '@angular/core';
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

// import * as moment from 'moment';
// import 'moment/locale/es';

import template from "./provider-products.component.html";
import style from "./provider-products.component.scss";

@Component({
  selector: "provider-products",
  template,
  styles: [ style ] 
})
@InjectUser('currentUser')
export class ProviderProductsComponent implements OnInit, OnDestroy, OnChanges {
 
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  filters: Subject<any> = new Subject<any>();
  collectionCount: number = 0;
  PAGESIZE: number = 15; 
  
  @Output('update') notifyProductSelected: EventEmitter<string> = new EventEmitter<string>();
  @Input() selectedProducts: Observable<Product[]>;
  @Input() provider: string;


  filtersParams: any = {
      'name':  '',
      'code': '',
      'color': '',
      'brand': '',
      'model': ''
    };

  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Codigo', 'value':'code'},
    {'key': 'Descripcion', 'value': 'description'},
    {'key': 'Color', 'value':'color'},
    {'key': 'Marca', 'value':'brand'},
    {'key': 'Modelo', 'value':'model'},
    {'key': 'Precio Costo', 'value':'cost'},
  ];

  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;
  
  currentUser: User;

  products: Observable<Product[]>;
  productPrices: Observable<ProductPrice[]>;

  constructor(
    private paginationService: PaginationService, 
  ){}


  ngOnChanges(changes:any):void {
    if (changes.provider) {
      // selected provider name
      console.log('read provider' + changes.provider.currentValue);
      this.provider = changes.provider.currentValue;
      this.createOptionsSubScription()
    }

    // get selected products to check if need to be added back to the provider list
    if (changes.products) {
        console.log('read provider' + changes.provider.currentValue);

      this.selectedProducts = changes.products;
    }

  }
 
  createOptionsSubScription(){
    if (this.optionsSub) {
      this.optionsSub.unsubscribe();
    }
    this.optionsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.filters,
    ).subscribe(([pageSize, curPage, filters]) => {
      const options: SearchOptions = {
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number)
      };
      
      this.paginationService.setCurrentPage(
        this.paginationService.defaultId() , curPage as number);

      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }
      this.paginatedSub = MeteorObservable.subscribe(
        'provider-products', this.provider, options, filters)
        .subscribe(() => {
          this.products = Products.find({}).zone();
          this.productPrices = ProductPrices.find({}).zone();
      });
      
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.filters.next(''); 

    if (this.autorunSub) {
      this.autorunSub.unsubscribe();
    }
    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfProducts');
      this.paginationService.setTotalItems(
        this.paginationService.defaultId(), this.collectionCount);
    });

    this.paginationService.register({
      id: this.paginationService.defaultId(),
      itemsPerPage: this.PAGESIZE,
      currentPage: 1,
      totalItems: this.collectionCount,
    });

  }

  ngOnInit() {  

  }

  ngOnDestroy() {
    if (this.paginatedSub) {
      this.paginatedSub.unsubscribe();
    }
    if (this.optionsSub) {
      this.optionsSub.unsubscribe();
    }
    if (this.autorunSub) {
      this.autorunSub.unsubscribe();
    }
  } 

   isProductSelected(product: Product): boolean {
    // console.log('check selected for: ' + JSON.stringify(providerProduct));  
    // this.products.subscribe((es)=>{
    //    console.log(JSON.stringify(es))
    //  });
    let selected = this.matchingProduct(this.selectedProducts, product);
    // console.log('selected = ' + JSON.stringify(selected));
    return (selected != undefined);
  }

  matchingProduct(productObs: Observable<Product[]>, source: Product): Product {
    let result:Product;

    productObs.subscribe((products)=>{
      // console.log('looking into : ' + JSON.stringify(products));
      let match =  products.filter((product: Product) => product._id == source._id);
      // console.log('match found: ' + JSON.stringify(match));
      if (match.length > 0){
       result = match[0];
      }
    }) 
    return result;
  }

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }

  search(field: string, value: string): void {
    console.log(value);
    
    if (value == 'undefined')  {
      value = '';
    }
    // no value change on blur
    if (this.filtersParams[field] == value) {
      return;
    }
    this.filtersParams[field] = value.toUpperCase();

    this.curPage.next(1);
    this.filters.next(this.filtersParams);
  }

  doEmit(productId: string){
     // console.log('emiting: '+ barCode);
    this.notifyProductSelected.emit(productId);
  }
 
  getCost(productId) {
    let productPrice = ProductPrices.findOne({productId:productId});
     return (productPrice)?productPrice.lastCostPrice:0;
  }

}
