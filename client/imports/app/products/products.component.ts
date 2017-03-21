// angular
import { Component, OnInit, OnDestroy, Injectable, Inject } from '@angular/core';

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
import { Bert } from 'meteor/themeteorchef:bert';

// model 
import { Products } from '../../../../both/collections/products.collection';
import { Categories } from '../../../../both/collections/categories.collection';
import { Sections } from '../../../../both/collections/sections.collection';
import { Product } from '../../../../both/models/product.model';
import { Category } from '../../../../both/models/category.model';
import { Section } from '../../../../both/models/section.model';

import { Dictionary } from '../../../../both/models/dictionary';


 
import template from './products.component.html';
import style from './products.component.scss';

@Component({
  selector: 'products',
  template,
  styles: [ style ],
})
@InjectUser('currentUser')
export class ProductsComponent implements OnInit, OnDestroy {
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filters: Subject<any> = new Subject<any>();

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
    {'key': 'Categoria', 'value':'categoryName:name'},
  ];

  collectionCount: number = 0;
  PAGESIZE: number = 6; 
  
  categoriesSub: Subscription;
  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;

  currentUser: Meteor.User;
  editedProduct: Product = {code: '0', name: '', color: '', brand: '', model: '', categoryId : '', provider:''};
  adding: boolean = false;
  editing: boolean = false;
  selected: any;
  products: Observable<Product[]>;
  paginatedCategories: Observable<Category[]>;
  categories: Observable<Category[]>;

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
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number),
        sort: { [sortField as string] : sortDirection as number }
      };
      
      this.paginationService.setCurrentPage(this.paginationService.defaultId() , curPage as number);

      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }
      this.paginatedSub = MeteorObservable.subscribe('products-with-categories', options, filters)
        .subscribe(() => {
          this.products = Products.find({}).zone();
          this.paginatedCategories = Categories.find({}).zone();
      });
      
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortDirection.next(1);
    this.sortField.next('name');
    this.filters.next('');

    if (this.categoriesSub) {
        this.categoriesSub.unsubscribe();
    }
    this.categoriesSub = MeteorObservable.subscribe('categories')
      .subscribe(() => {
        this.categories = Categories.find({}).zone();
    });

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
 
  update = function(product){
    MeteorObservable.call('updateProduct', product._id, product).subscribe(() => {
      Bert.alert('Se cambio el producto: ' + product.code , 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al actualizar:  ${error} ', 'danger', 'growl-top-right' ); 
    });

  }

  copy(original: any){
    return Object.assign({}, original)
  }

  search(field: string, value: string): void {
    console.log(value);
    console.log(field);

    if (value == 'undefined')  {
      value = '';
    }

    // no value change on blur
    if (this.filtersParams[field] === value) {
      return;
    }
    this.filtersParams[field] = value

    this.curPage.next(1);
    this.filters.next(this.filtersParams);
  }
  
  changeSortOrder(direction: string, fieldName: string): void {
    this.sortDirection.next(parseInt(direction));
    this.sortField.next(fieldName);
  }

}
