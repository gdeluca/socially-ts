// angular
import { Component, OnInit, OnDestroy, Injectable, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';

// reactive
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/combineLatest';
import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/search/search-options';

//collections
import { Products } from '../../../../both/collections/products.collection';
import { ProductSizes } from '../../../../both/collections/product-sizes.collection';
import { Categories } from '../../../../both/collections/categories.collection';

// model 
import { Product } from '../../../../both/models/product.model';
import { ProductSize } from '../../../../both/models/product-size.model';
import { Category } from '../../../../both/models/category.model';

import { Dictionary } from '../../../../both/models/dictionary';


 
import template from './product-search.component.html';
import style from './product-search.component.scss';

@Component({
  selector: 'product-search',
  template,
  styles: [ style ],
})
@InjectUser('user')
export class ProductSearchComponent implements OnInit, OnDestroy {
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();

  filters: Subject<any> = new Subject<any>();
 
  @Output('update') notifyProductSize: EventEmitter<string> = new EventEmitter<string>();

  filtersParams: any = {
    'name':  '',
    'code': '',
    'color': '',
    'brand': '',
    'provider': '',
    'model': ''
  };

   // name, sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Descripcion', 'value': 'name'},
    {'key': 'Codigo', 'value':'code'},
    {'key': 'Color', 'value':'color'},
    {'key': 'Marca', 'value':'brand'},
    {'key': 'Proveedor', 'value':'provider'},
    {'key': 'Modelo', 'value':'model'},
    {'key': 'Categoria', 'value':'categoryId'},
  ];

  collectionCount: number = 0;
  PAGESIZE: number = 6; 
  
  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;

  user: Meteor.User;
  selectedProduct: Product;
  products: Observable<Product[]>;
  productSizes: Observable<ProductSize[]>;
  categories: Observable<Category[]>;

  hideSizesForm = true;
  selectedRow: number;
  constructor(
    private paginationService: PaginationService, 
  ){}

  ngOnInit() {
    this.optionsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.filters,
    ).subscribe(([pageSize, curPage, filters]) => {
      const options: SearchOptions = {
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number)
      };
      
      this.paginationService.setCurrentPage(this.paginationService.defaultId() , curPage as number);

      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }
      this.paginatedSub = MeteorObservable.subscribe('products-search', options, filters)
        .subscribe(() => {
          this.categories = Categories.find({}).zone();
          this.products = Products.find({}).zone();
          this.productSizes = ProductSizes.find({}).zone();
      });
      
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.filters.next(''); 

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfProducts');
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

  search(field: string, value: string): void {
    console.log(value);
    // no value change on blur
    if (this.filtersParams[field] == value) {
      return;
    }
    this.filtersParams[field] = value

    this.curPage.next(1);
    this.filters.next(this.filtersParams);
  }

  populateProductSizes(product) {
    this.selectedProduct = product;
    this.hideSizesForm = false;
  }

  setClickedRow(index) {
    this.selectedRow = index;
  }

  doEmit(barCode: string){
     // console.log('emiting: '+ barCode);
    this.notifyProductSize.emit(barCode);
  }
}
