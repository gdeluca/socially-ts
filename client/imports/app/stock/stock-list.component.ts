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
import { SearchOptions } from '../../../../both/domain/search-options';

// collections
import { ProductSizes, getMappingSize } from '../../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../../both/collections/product-prices.collection';
import { Stocks } from '../../../../both/collections/stocks.collection';
import { Products } from '../../../../both/collections/products.collection';
import { Categories } from '../../../../both/collections/categories.collection';
import { Stores } from '../../../../both/collections/stores.collection';
import { Tags } from '../../../../both/collections/tags.collection';

// model 
import { ProductSize } from '../../../../both/models/product-size.model';
import { ProductPrice } from '../../../../both/models/product-price.model';
import { Stock } from '../../../../both/models/stock.model';
import { Product } from '../../../../both/models/product.model';
import { Category } from '../../../../both/models/category.model';
import { Store } from '../../../../both/models/store.model';
import { Tag } from '../../../../both/models/tag.model';

// domain
import { Dictionary } from '../../../../both/domain/dictionary';
import { Filter, Filters } from '../../../../both/domain/filter';
import { getSelectorFilter, checkOptions } from '../../../../both/domain/selectors';

import * as _ from 'underscore'; 
import { isNumeric } from '../../validators/validators';
import { Bert } from 'meteor/themeteorchef:bert';

import template from "./stock-list.component.html";
import style from "./stock-list.component.scss";

@Component({
  selector: "stock-list",
  template,
  styles: [ style ]
})
@InjectUser('currentUser')
export class StockListComponent implements OnInit, OnDestroy {
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filters: Subject<Filters> = new Subject<Filters>();

  filtersParams: Filters = [
    {key: 'barCode', value:''},
    {key: 'name', value:''},
    {key: 'color', value:''},
    {key: 'size', value:''},
    {key: 'provider', value:''},
    {key: 'model', value:''},    
    {key: 'cost', value:''},
    {key: 'cashPayment', value:''},
    {key: 'cardPayment', value:''},
    {key: 'categoryId', value:''},
    {key: 'sectionId', value:''},
  ];

  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Codigo', 'value':'barCode'},
    {'key': 'Descripcion', 'value': 'name'},
    {'key': 'Color', 'value':'color'},
    {'key': 'Talle', 'value':'size'},
    {'key': 'Proveedor', 'value':'provider'},
    {'key': 'Modelo', 'value':'model'},
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
  // stockSub: Subscription;
  // productSub: Subscription;
  // productPriceSub: Subscription;
  // productSizeSub: Subscription;
  // categorySub: Subscription;

  currentUser: Meteor.User;
  emptyStock: any = 
    {
      barCode:'', 
      name:'', 
      color:'', 
      size:'', 
      provider:'', 
      quantity:[{productSizeId:'', storeId:'', quantity:''}]
    };

  editedStock: any;
  selectedCategory: Category ;

  productSizes: Observable<ProductSize[]>;
  stocks: Observable<Stock[]>;
  stores: Observable<Store[]>;
  products: Observable<Product[]>;
  productPrices: Observable<ProductPrice[]>;
  categories: Observable<Category[]>; 

  allCategories: Observable<Category[]>;
  allSections: Observable<Tag[]>;
  allStores: Observable<Store[]>;

  constructor(
    private paginationService: PaginationService, 
  ){ }
 
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
      
      this.paginationService.setCurrentPage(
        this.paginationService.defaultId() , curPage as number);

      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }

      // this.categorySub = MeteorObservable.subscribe(
      //   'categories.test',
      //   filters,
      //   ['sectionId']
      // ).subscribe(() => {

      //   this.categories = Categories.find().zone();
      //   let categoryIds = _.pluck(Categories.find().fetch(), '_id');
      //   this.productSub = MeteorObservable.subscribe(
      //     'products.test',
      //     filters,
      //     ['code','name','color','provider','categoryId'],
      //     {categoryId: {$in: categoryIds }}
      //   ).subscribe(() => {

      //     this.products = Products.find().zone();
      //     let productIds = _.pluck(Products.find().fetch(), '_id');
      //     this.storesSub = MeteorObservable.subscribe(
      //       'stores.test',
      //       filters,
      //       []
      //     ).subscribe(() => {

      //       this.stores = Stores.find().zone();
      //       let storeIds = _.pluck(Stores.find().fetch(), '_id');
      //       this.productPriceSub = MeteorObservable.subscribe(
      //         'productprices.test',
      //         filters,
      //         [],
      //         [
      //           {storeId: {$in: storeIds }},
      //           {productId: {$in: productIds }}
      //         ]
      //       ).subscribe(() => {

      //         this.productPrices = ProductPrices.find().zone();
      //         this.productSizeSub = MeteorObservable.subscribe(
      //           'productsizes.test',
      //           options,
      //           filters,
      //           ['barCode','size'],
      //           [
      //             {productId: {$in: productIds }}
      //           ]
      //         ).subscribe(() => {

      //           this.productSizes = ProductSizes.find().zone();
      //           let productSizeIds = _.pluck(ProductSizes.find().fetch(), '_id');
      //           this.stockSub = MeteorObservable.subscribe(
      //             'stocks.test',
      //             filters,
      //             [],
      //             [ 
      //               {productSizeId: {$in:  productSizeIds }},
      //               {storeId: {$in: storeIds }},
      //               {active: true }
      //             ]
      //           ).subscribe(() => {

      //             this.stocks = Stocks.find().zone();
      //           })
      //         })
      //       })
      //     })
      //   })
      // })

      // this.storesSub = MeteorObservable.subscribe(
      //   'stores.test',
      //   filters,
      // this.productSub = MeteorObservable.subscribe(
      //   'products.test',
      //   filters,
      //   ['code','name','color','provider','categoryId']
      // ).subscribe(() => {
      // this.productSizeSub = MeteorObservable.subscribe(
      //   'productsizes.test',
      //   options,
      //   filters,
      //   ['barCode','size']
      // ).subscribe(() => {
      //   this.productSizes = ProductSizes.find().zone();
      //   this.stocksSub = MeteorObservable.subscribe(
      //   'stocks.test',
      //   filters,
      //   [],
      //   _.pluck(ProductSizes.find().fetch(), '_id'),
      //   ).subscribe(() => {
      //     [ 
      //       {productSizeId: {$in:  _.pluck(ProductSizes.find().fetch(), '_id') }},
      //       {storeId: {$in:  _.pluck(Stores.find().fetch(), '_id') }},
      //       {active: true }
      //     ]
      //     this.stocks = Stocks.find().zone();
      //   })

      // })

      this.paginatedSub = MeteorObservable.subscribe(
        'productsize.stock', 
        options, 
        filters
      ).subscribe(() => {
        this.productSizes = ProductSizes.find().zone();
        this.stocks = Stocks.find({}).zone();
        this.stores = Stores.find({}).zone();
        this.products = Products.find({}).zone();
        this.productPrices = ProductPrices.find({}).zone();

        if (this.storesSub) {
          this.storesSub.unsubscribe();
        } 
        this.storesSub = MeteorObservable.subscribe('stores')
          .subscribe(() => {
            this.allStores = Stores.find({}).zone();
        });

        // this.stockSub = MeteorObservable.subscribe(
        //   'product.stocks',
        //   _.pluck(ProductSizes.find().fetch(), '_id'),
        //   _.pluck(Stores.find().fetch(), '_id')
        // ).subscribe(() => { 
        //   this.stocks = Stocks.find({}).zone(); 
        // console.log('finish local process');
 
        // }) 

      });
    });

    if (this.sectionsSub) {
      this.sectionsSub.unsubscribe();
    } 
    this.sectionsSub = MeteorObservable.subscribe(
      'tags.section'
    ).subscribe(() => {
      this.allSections = Tags.find(
        { $and: [ {type: 'section'}, {code: { $ne: '00' }}]}
      ).zone();
    });

    

    if (this.categoriesSub) {
      this.categoriesSub.unsubscribe();
    } 
    this.categoriesSub = MeteorObservable.subscribe('categories')
      .subscribe(() => {
        this.allCategories = Categories.find({}).zone();
    });

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfProductSizes');
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
    this.sortField.next('barCode');
    this.sortDirection.next(1);
    this.filters.next(this.filtersParams);
  }
  
  // function getIds(entity, filter){        
  //   let currentIds=[];
  //   entity.find(filter).mergeMap(a => {
  //         return a.map(b => {
  //           return b._id})}).subscribe(res => {currentIds.push(res)});
  //   return currentIds;
  // }

  ngOnDestroy() {
    this.paginatedSub.unsubscribe();
    this.optionsSub.unsubscribe(); 
    this.autorunSub.unsubscribe();
    this.sectionsSub.unsubscribe();
    this.categoriesSub.unsubscribe();
     
    this.storesSub.unsubscribe();
    // this.stockSub.unsubscribe();
    // this.productSub.unsubscribe();
    // this.productPriceSub.unsubscribe();
    // this.productSizeSub.unsubscribe();
    // this.categorySub.unsubscribe();

   
  } 

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }

  getProduct(productId) {
    return Products.findOne({_id: productId});
  }

  getPrice(productId) {
    return ProductPrices.findOne({productId: productId});
  }

  getStock(productSizeId, storeId) {
    return Stocks.findOne({
      productSizeId: productSizeId, 
      storeId: storeId,
      active:true
    });
  }

  update = function(editedStock){
    for (let edited of editedStock.quantity) {
      if (edited.quantity && 
        edited.storeId && 
        edited.productSizeId) {

        //TODO: low priority, change to a bulk operation, its OK if 2 o 3 stores
        MeteorObservable.call('upsertStock', 
          edited.productSizeId, 
          edited.storeId,
          +edited.quantity
        ).subscribe(
          (productSizeIds) => {
        Bert.alert('Stock actualizado: ', 'success', 'growl-top-right' ); 
        }, (error) => {
          Bert.alert('Error al guardar e stock: ' +  error, 'danger', 'growl-top-right' ); 
        });

      } 
    }
    this.editedStock = this.copy(this.emptyStock);
  }

  copy(original: any){
    return Object.assign({}, original)
  }

  updateEditedStock(
    editedStock: any, 
    productSizeId: string,
    storeId: string, 
    quantity: number
  ) {
    if (quantity) {
      editedStock.quantity.push({
        storeId: storeId,
        productSizeId: productSizeId,
        quantity: quantity
      });
    }
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
      console.log(this.filtersParams);
    }
  }

}
 
