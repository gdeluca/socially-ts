// angular
import { Component, OnInit, OnDestroy, OnChanges, Injectable, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, CanActivate } from '@angular/router';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';
 
// reactiveX
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Subject } from 'rxjs/Subject';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/domain/search-options';

// collections
import { ProductPurchases } from '../../../../both/collections/product-purchases.collection';
import { ProductSales } from '../../../../both/collections/product-sales.collection';
import { ProductSizes } from '../../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../../both/collections/product-prices.collection';
import { Products } from '../../../../both/collections/products.collection';
import { Purchases } from '../../../../both/collections/purchases.collection';
import { Stocks } from '../../../../both/collections/stocks.collection';
import { Stores } from '../../../../both/collections/stores.collection';
import { Tags } from '../../../../both/collections/tags.collection';
import { Users } from '../../../../both/collections/users.collection';

// model 
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
import { Bert } from 'meteor/themeteorchef:bert';

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
  
  filters: Subject<Filters> = new Subject<Filters>();

  filtersParams: Filters = [
    {key: 'code', value:''},
    {key: 'name', value:''},
    {key: 'color', value:''},
    {key: 'brand', value:''},
    {key: 'model', value:''},
  ];

  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Codigo', 'value':'code'},
    {'key': 'Descripcion', 'value': 'description'},
    {'key': 'Color', 'value':'color'},
    {'key': 'Marca', 'value':'brand'},
    {'key': 'Modelo', 'value':'model'},
    {'key': 'Precio Costo', 'value':'cost'},
  ];

  collectionCount: number = 0;
  PAGESIZE: number = 15; 
  
  @Output('update') notifyProductSelected: EventEmitter<string> = new EventEmitter<string>();
  @Input() selectedProducts: Observable<Product[]>;
  @Input() provider: string;
  
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
    if (changes.provider && changes.provider.currentValue) {
      // selected provider name
      // console.log('read provider' + changes.provider.currentValue);
      this.provider = changes.provider.currentValue;
     
      this.createOptionsSubScription();

    }

    // get selected products to check if need to be added back to the provider list
    if (changes.products) {
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
        'provider.products', 
        this.provider, 
        options, 
        filters
      ).subscribe(() => {
        this.products = Products.find({}).zone();
        this.productPrices = ProductPrices.find({}).zone();
      });
      
    });

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

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.filters.next(this.filtersParams); 

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

  doEmit(productId: string){
     // console.log('emiting: '+ barCode);
    this.notifyProductSelected.emit(productId);
  }
 
  getCost(productId) {
    let productPrice = ProductPrices.findOne({productId:productId});
     return (productPrice) ? productPrice.cost : 0;
  }

}
