// angular
import { Component, OnInit, OnDestroy } from '@angular/core';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';

// reactive
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/combineLatest';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/domain/search-options';

//collections
import { Products, productTagNames } from '../../../../both/collections/products.collection';
import { Categories } from '../../../../both/collections/categories.collection';
import { Tags, definedTags } from '../../../../both/collections/tags.collection';

// model 
import { Product } from '../../../../both/models/product.model';
import { Category } from '../../../../both/models/category.model';
import { Tag } from '../../../../both/models/tag.model';

// domain
import { Dictionary } from '../../../../both/domain/dictionary';
import { Filter, Filters } from '../../../../both/domain/filter';
import * as _ from 'underscore';
import { Bert } from 'meteor/themeteorchef:bert';

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

  filters: Subject<Filters> = new Subject<Filters>();

  filtersParams: Filters = [
    {key: 'name', value:''},
    {key: 'code', value:''},
    {key: 'color', value:''},
    {key: 'brand', value:''},
    {key: 'provider', value:''},
    {key: 'model', value:''},
  ];

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
 
  tagsSubs:Subscription[] = []; 
  tags: Observable<Tag[]>[] = [];
  productTagDef = productTagNames;
  sources:string[] = [];

  currentUser: Meteor.User;
  editedProduct: any = 
  { 
    name: '', 
    color: '', 
    brand: '', 
    model: '', 
    categoryId : '', 
    provider:''
  };

  products: Observable<Product[]>;
  // paginatedCategories: Observable<Category[]>;
  categories: Observable<Category[]>;

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
        'products.categories', 
        options, 
        filters
      ).subscribe(() => {
        this.products = Products.find({}).zone();
        // this.paginatedCategories = Categories.find({}).zone();
      });

      for (let name of this.productTagDef) {
        if (this.tagsSubs[name]) {
          this.tagsSubs[name].unsubscribe();
        } 
        this.tagsSubs[name] = MeteorObservable.subscribe('tags.'+name)
          .subscribe(() => {
          this.tags[name] = Tags.find({type: name}).zone();
          this.tags[name].subscribe((tags)=>{
            this.sources[name] = tags.map((tag) => {
              return tag.description;
            });
          })
        });
      }
      
    });

    if (this.categoriesSub) {
        this.categoriesSub.unsubscribe();
    }
    this.categoriesSub = MeteorObservable.subscribe('categories')
      .subscribe(() => {
        this.categories = Categories.find({}).zone();
    });

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
    this.sortDirection.next(1);
    this.sortField.next('name');
    this.filters.next(this.filtersParams);
  }
  
  ngOnDestroy() {
    this.paginatedSub.unsubscribe();
    this.optionsSub.unsubscribe(); 
    this.autorunSub.unsubscribe();
    for (let name of this.productTagDef) {
      if (this.tagsSubs[name]) {
        this.tagsSubs[name].unsubscribe();
      }
    } 
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

}
