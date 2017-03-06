// angular
import { Component, OnInit, OnDestroy, Injectable, Inject, NgModule } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/search/search-options';

// collections
import { ProductSizes } from '../../../../both/collections/product-sizes.collection';
import { Stocks } from '../../../../both/collections/stocks.collection';
import { Products } from '../../../../both/collections/products.collection';
import { Categories } from '../../../../both/collections/categories.collection';
import { Sections } from '../../../../both/collections/sections.collection';
import { Stores } from '../../../../both/collections/stores.collection';

// model 
import { ProductSize } from '../../../../both/models/product-size.model';
import { Stock } from '../../../../both/models/stock.model';
import { Product } from '../../../../both/models/product.model';
import { Category } from '../../../../both/models/category.model';
import { Section } from '../../../../both/models/section.model';
import { Store } from '../../../../both/models/store.model';

import { Dictionary } from '../../../../both/models/dictionary';

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

  filterField: Subject<string> = new Subject<string>();
  filterValue: Subject<string> = new Subject<string>();

  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Codigo', 'value':'code'},
    {'key': 'Descripcion', 'value': 'name'},
    {'key': 'Color', 'value':'color'},
    {'key': 'Talle', 'value':'size'},
    {'key': 'Contado', 'value':'cashPayment'},
    {'key': 'Tarjeta', 'value':'cardPayment'},
  ];

  collectionCount: number = 0;
  PAGESIZE: number = 6; 
  
  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;

  user: Meteor.User;
  editedProductStock: any = {code:'', description:'', color:'', size:'', contado:'', tarjeta:'', storeQuantity:[]};
  editing: boolean = false;
  product: any;

  stocks: Observable<Stock[]>;
  productSizes: Observable<ProductSize[]>;
  products: Observable<Product[]>;
  categories: Observable<Category[]>;
  section: Observable<Section[]>;
  stores: Observable<Store[]>;

  constructor(
    private paginationService: PaginationService
  ) { }
 
   ngOnInit() {
    this.optionsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.sortDirection,
      this.sortField,
      this.filterField,
      this.filterValue
    ).subscribe(([pageSize, curPage, sortDirection, sortField, filterField, filterValue]) => {
      const options: SearchOptions = {
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number),
        sort: { [sortField as string] : sortDirection as number }
      };
      
      this.paginationService.setCurrentPage(this.paginationService.defaultId() , curPage as number);

      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }
      this.paginatedSub = MeteorObservable.subscribe('stocks', options, filterField, filterValue)
        .subscribe(() => {
          this.stocks = Stocks.find({}).zone();
          this.productSizes = ProductSizes.find({}).zone();
          this.products = Products.find({}).zone();
          this.categories = Categories.find({}).zone();
          this.section = Sections.find({}).zone();
          this.stores = Stores.find({}).zone();
      });
      
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortField.next('code');
    this.sortDirection.next(1);
    this.filterField.next('code');
    this.filterValue.next('');

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfStocks');
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

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }

  update = function(stock){
    Stocks.update(stock._id, {
      $set: { 
        quantity: stock.quantity,
        priceCash: stock.priceCash,
        priceCard: stock.priceCard,
        rateCash: stock.rateCash,
        rateCard: stock.rateCard,
        active: stock.active,
        storeId: stock.storeId, 
        productSizeId: stock.productSizeId
      }
    });
  }

  save(value: any){
    if (!Meteor.userId()) {
      alert('Ingrese al sistema para poder guardar');
      return;
    }

    // if (this.complexForm.valid) {
    //   Sections.insert({
    //     name: this.complexForm.value.name
    //   });
    //   this.complexForm.reset();
    // }
    console.log(value);
  }

  copy(original: any){
    return Object.assign({}, original)
  }

  search(field: string, value: string): void {
    console.log(field);
    console.log(value);
    this.curPage.next(1);
    this.filterField.next(field);
    this.filterValue.next(value); 
  }
  
  changeSortOrder(direction: string, fieldName: string): void {
    this.sortDirection.next(parseInt(direction));
    this.sortField.next(fieldName);
  }

}
