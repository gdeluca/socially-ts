// angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';

// reactive
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/combineLatest';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/domain/search-options';

// collections
import { Categories } from '../../../../both/collections/categories.collection';
import { Tags } from '../../../../both/collections/tags.collection';

// model 
import { Category } from '../../../../both/models/category.model';
import { Tag } from '../../../../both/models/tag.model';

// domain
import { Dictionary } from '../../../../both/domain/dictionary';
import { Filter, Filters } from '../../../../both/domain/filter';
import * as _ from 'underscore';
import { Bert } from 'meteor/themeteorchef:bert';
 
import template from './categories.component.html';
import style from './categories.component.scss';

@Component({
  selector: 'categories',
  template,
  styles: [ style ],
})
@InjectUser('currentUser')
export class CategoriesComponent implements OnInit, OnDestroy {
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filters: Subject<Filters> = new Subject<Filters>();

  filtersParams: Filters = [
    {key: 'name', value:''},
    {key: 'section:name', value:''},
  ];

  // name, sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Nombre', 'value': 'name'},
    {'key': 'Seccion', 'value':'section:name'}
  ];

  collectionCount: number = 0;
  PAGESIZE: number = 6   ; 
  
  sectionsSub: Subscription;
  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;

  currentUser: Meteor.User;
  editedCategory: Category = {sectionId:'', name:''};

  categories: Observable<Category[]>;
  paginatedSections: Observable<Tag[]>;
  sections: Observable<Tag[]>;

  complexForm : FormGroup;

  constructor(
    private paginationService: PaginationService, 
    private formBuilder: FormBuilder
  ){
    this.complexForm = formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(5)])],
      sectionCode: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.optionsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.sortDirection,
      this.sortField,
      this.filters,
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
        'categories.sections', 
        options, 
        filters
      ).subscribe(() => {
        this.categories = Categories.find({}).zone();
        this.paginatedSections = Tags.find({}).zone();
      });
      
    });

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfCategories');
      this.paginationService.setTotalItems(
        this.paginationService.defaultId(), this.collectionCount);
    });

    if (this.sectionsSub) {
      this.sectionsSub.unsubscribe();
    }
    this.sectionsSub = MeteorObservable.subscribe('tags.section')
      .subscribe(() => {
        this.sections = Tags.find(
          { $and: [ {type: 'section'}, {code: { $ne: '00' }}]}
        ).zone();
    });
    
    this.paginationService.register({
      id: this.paginationService.defaultId(),
      itemsPerPage: this.PAGESIZE,
      currentPage: 1,
      totalItems: this.collectionCount,
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortField.next('name');
    this.sortDirection.next(1);
    this.filters.next(this.filtersParams);

  }
  
  ngOnDestroy() {
    this.paginatedSub.unsubscribe();
    this.optionsSub.unsubscribe(); 
    this.autorunSub.unsubscribe();
  } 

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }

  updateCategory = function(newCategory, category) {
    MeteorObservable.call('updateCategory',category._id, newCategory.name, newCategory.sectionId)
      .subscribe(() => {
      Bert.alert('Categoria actualizada: ', 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al actualizar la categoria:' +  error, 'danger', 'growl-top-right' ); 
    });
  }

  saveCategory(){
    if (!Meteor.userId()) {
      alert('Ingrese al sistema para guardar');
      return;
    }

    if (this.complexForm.valid) {
      let values =  this.complexForm.value;
      MeteorObservable.call('saveCategory', values.name, values.sectionCode)
      .subscribe(() => {
        Bert.alert('Categoria agregada: ', 'success', 'growl-top-right' ); 
      }, (error) => {
        Bert.alert('Error al agregar la categoria: ' + error , 'danger', 'growl-top-right' ); 
      });
      this.complexForm.reset();
    }
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
  
  changeSortOrder(direction: string, fieldName: string): void {
    this.sortDirection.next(parseInt(direction));
    this.sortField.next(fieldName);
  }

}