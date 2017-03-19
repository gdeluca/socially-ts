// angular
import { Component, OnInit, OnDestroy, Injectable, Inject, NgModule } from '@angular/core';
// import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';

// reactiveX
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishLast';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/search/search-options';
import { Bert } from 'meteor/themeteorchef:bert';

// collections
import { ProductSizes, getMappingSize } from '../../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../../both/collections/product-prices.collection';
import { Stocks } from '../../../../both/collections/stocks.collection';
import { Products } from '../../../../both/collections/products.collection';
import { Categories } from '../../../../both/collections/categories.collection';
import { Sections } from '../../../../both/collections/sections.collection';
import { Stores } from '../../../../both/collections/stores.collection';

// model 
import { ProductSize } from '../../../../both/models/product-size.model';
import { ProductPrice } from '../../../../both/models/product-price.model';
import { Stock } from '../../../../both/models/stock.model';
import { Product } from '../../../../both/models/product.model';
import { Category } from '../../../../both/models/category.model';
import { Section } from '../../../../both/models/section.model';
import { Store } from '../../../../both/models/store.model';

import { Dictionary } from '../../../../both/models/dictionary';
import { isNumeric } from '../../validators/validators';

import template from "./stock-list.component.html";
import style from "./stock-list.component.scss";

@Component({
  selector: "stock-list",
  template,
  styles: [ style ]
})
@InjectUser('user')
export class StockListComponent implements OnInit, OnDestroy {
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filters: Subject<any> = new Subject<any>();

  filtersParams: any = {
    'barCode': '',
    'name':  '',
    'color': '',
    'size': '',
    'provider': '',
    'cost': '',
    'cashPayment': '',
    'cardPayment': '',
    'categoryId': '',
    'sectionId': ''
  };

  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Codigo', 'value':'barCode'},
    {'key': 'Descripcion', 'value': 'name'},
    {'key': 'Color', 'value':'color'},
    {'key': 'Talle', 'value':'size'},
    {'key': 'Proveedor', 'value':'provider'},
    {'key': 'Costo', 'value':'cost'},
    {'key': 'Contado', 'value':'cashPayment'},
    {'key': 'Tarjeta', 'value':'cardPayment'},
  ];

  collectionCount: number = 0;
  PAGESIZE: number = 10;  
  
  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;
  categoriesSub: Subscription;
  sectionsSub: Subscription;
  storesSub: Subscription;

  user: Meteor.User;
  emptyStock: any = 
    {
      barCode:'', 
      name:'', 
      color:'', 
      size:'', 
      provider:'', 
      quantity:[{stockId:'', storeId:'', quantity:'', priceCash:'', priceCard:'', lastCostPrice:''}]
    };

  editedStock: any;
  editing: boolean = false;
  selectedCategory: Category ;

  productSizes: Observable<ProductSize[]>;
  stocks: Observable<Stock[]>;
  stores: Observable<Store[]>;
  products: Observable<Product[]>;
  productPrices: Observable<ProductPrice[]>;
  categories: Observable<Category[]>; 

  allCategories: Observable<Category[]>;
  allSections: Observable<Section[]>;
  allStores: Observable<Store[]>;

  constructor(
    private paginationService: PaginationService, 
  ){ 
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
        limit: (pageSize as number),
        skip: ((curPage as number) - 1) * (pageSize as number),
        sort: { [sortField as string] : sortDirection as number }
      };
      
      this.paginationService.setCurrentPage(this.paginationService.defaultId() , curPage as number);

      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }
      this.paginatedSub = MeteorObservable.subscribe('productsSize-stock', options, filters)
        .subscribe(() => {
          this.productSizes = ProductSizes.find({}).zone();
          this.stocks = Stocks.find({}).zone();
          this.stores = Stores.find({}).zone();
          this.products = Products.find({}).zone();
          this.productPrices = ProductPrices.find({}).zone();
      });

    });

    if (this.sectionsSub) {
      this.sectionsSub.unsubscribe();
    } 
    this.sectionsSub = MeteorObservable.subscribe('sections')
      .subscribe(() => {
        this.allSections = Sections.find({}).zone();
    });

    if (this.storesSub) {
      this.storesSub.unsubscribe();
    } 
    this.storesSub = MeteorObservable.subscribe('stores')
      .subscribe(() => {
        this.allStores = Stores.find({}).zone();
    });

    if (this.categoriesSub) {
      this.categoriesSub.unsubscribe();
    } 
    this.categoriesSub = MeteorObservable.subscribe('categories')
      .subscribe(() => {
        this.allCategories = Categories.find({}).zone();
    });


    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortField.next('barCode');
    this.sortDirection.next(1);
    this.filters.next('');

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfProductSizes');
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
    this.sectionsSub.unsubscribe();
    this.categoriesSub.unsubscribe();
    this.storesSub.unsubscribe();
  } 

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }

  /* save values to database */
  update = function(editedStock){
    for (let stock of editedStock.quantity) {

      if (stock.quantity && stock.stockId) {
        Stocks.update(stock.stockId, {
          $set: { 
            quantity: stock.quantity,
          }
        });
      }
      // do something
    }

    // clean after insert
    editedStock = this.copy(this.emptyStock);
  }

  copy(original: any){
    return Object.assign({}, original)
  }

  updateEditedStock(editedStock: any, id: string, quantity: number) {
    if (quantity) {
      editedStock.quantity.push(
        {
          stockId: id, 
          quantity: quantity,
        }
      );
    }
  }

  changeSortOrder(direction: string, fieldName: string): void {
    this.sortDirection.next(parseInt(direction));
    this.sortField.next(fieldName);
  }

  search(field: string, value: string): void {
    console.log(value);
    // no value change on blur
    if (this.filtersParams[field] === value) {
      return;
    }
    this.filtersParams[field] = value

    this.curPage.next(1);
    this.filters.next(this.filtersParams);
  }

}
 
