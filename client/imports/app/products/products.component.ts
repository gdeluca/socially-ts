// angular
import { Component, OnInit, OnDestroy, Injectable, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';

// reactive
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/combineLatest';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/search/search-options';

// model 
import { Products } from '../../../../both/collections/products.collection';
import { Categories } from '../../../../both/collections/categories.collection';
import { Sections } from '../../../../both/collections/sections.collection';
import { Product } from '../../../../both/models/product.model';
import { Category } from '../../../../both/models/category.model';
import { Section } from '../../../../both/models/section.model';

 
import template from './products.component.html';
import style from './products.component.scss';

@Component({
  selector: 'products',
  template,
  styles: [ style ],
})
@InjectUser('user')
export class ProductsComponent implements OnInit, OnDestroy {
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filterField: Subject<string> = new Subject<string>();
  filterValue: Subject<string> = new Subject<string>();


  collectionCount: number = 0;
  PAGESIZE: number = 6; 
  
  categoriesSub: Subscription;
  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;

  user: Meteor.User;
  editedProduct: Product = {code: 0, name: '', color: '', brand: '', model: '', categoryId : ''};
  adding: boolean = false;
  editing: boolean = false;
  selected: any;
  products: Observable<Product[]>;
  paginatedCategories: Observable<Category[]>;
  categories: Observable<Category[]>;

  complexForm : FormGroup;

  constructor(
    private paginationService: PaginationService, 
    private formBuilder: FormBuilder
  ){
    this.complexForm = formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      code: ['', Validators.compose([Validators.required, Validators.minLength(5)])],
      color:[''],
      brand: [''],
      model: [''],
      category: ['', Validators.required]
    });
  }

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
      this.paginatedSub = MeteorObservable.subscribe('products.categories', options, filterField, filterValue)
        .subscribe(() => {
          this.products = Products.find({}).zone();
          this.paginatedCategories = Categories.find({}).zone();
      });
      
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortDirection.next(1);
    this.sortField.next('name');
    this.filterField.next('name');
    this.filterValue.next(''); 


    if (this.categoriesSub) {
        this.categoriesSub.unsubscribe();
    }
    this.categoriesSub = MeteorObservable.subscribe('categories')
      .subscribe(() => {
        this.categories = Categories.find({}).zone();
    });
    

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfproducts');
      this.paginationService.setTotalItems(this.paginationService.defaultId(), this.collectionCount);
    });

    this.paginationService.register({
      id: this.paginationService.defaultId(),
      itemsPerPage: this.PAGESIZE,
      currentPage: 1,
      totalItems: 30,
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
    Products.update(product._id, {
      $set: { 
         name: product.name,
         code: product.code,
         color: product.color,
         brand: product.brand,
         model: product.model,
         categoryId: product.categoryId
      }
    });
  }

  save(value: any){
    if (!Meteor.userId()) {
      alert('Ingrese al sistema para poder guardar');
      return;
    }

    if (this.complexForm.valid) {
      Products.insert({
        name: this.complexForm.value.name, 
        code: this.complexForm.value.code, 
        color: this.complexForm.value.color, 
        brand: this.complexForm.value.brand, 
        model: this.complexForm.value.model, 
        categoryId: this.complexForm.value.category._id
      });
      this.complexForm.reset();
    }
    console.log(value);
  }

  copy(original: any){
    return Object.assign({}, original)
  }

  search(field: string, value: string): void {
    this.curPage.next(1);
    this.filterField.next(field);
    this.filterValue.next(value); 
  }
  
  changeSortOrder(direction: string, fieldName: string): void {
    this.sortDirection.next(parseInt(direction));
    this.sortField.next(fieldName);
  }

}