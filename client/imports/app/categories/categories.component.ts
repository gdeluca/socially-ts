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
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/combineLatest';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/search/search-options';

// model 
import { Categories } from '../../../../both/collections/categories.collection';
import { Sections } from '../../../../both/collections/sections.collection';
import { Category } from '../../../../both/models/category.model';
import { Section } from '../../../../both/models/section.model';
import { Dictionary } from '../../../../both/models/dictionary';


 
import template from './categories.component.html';
import style from './categories.component.scss';

@Component({
  selector: 'categories',
  template,
  styles: [ style ],
})
@InjectUser('user')
export class CategoriesComponent implements OnInit, OnDestroy {
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filterField: Subject<string> = new Subject<string>();
  filterValue: Subject<string> = new Subject<string>();


  collectionCount: number = 0;
  PAGESIZE: number = 6; 
  
  sectionsSub: Subscription;
  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;


  user: Meteor.User;
  editedCategory: Category = {sectionId:'', name:''};
  adding: boolean = false;
  editing: boolean = false;
  selected: any;
  categories: Observable<Category[]>;
  paginatedSections: Observable<Section[]>;
  sections: Observable<Section[]>;

  // name, sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Nombre', 'value': 'name'},
    {'key': 'Seccion', 'value':'sectionId'}
  ];
  complexForm : FormGroup;

  constructor(
    private paginationService: PaginationService, 
    private formBuilder: FormBuilder
  ){
    this.complexForm = formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(5)])],
      section: ['', Validators.required],
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
      this.paginatedSub = MeteorObservable.subscribe('categories.sections', options, filterField, filterValue)
        .subscribe(() => {
          this.categories = Categories.find({}).zone();
          this.paginatedSections = Sections.find({}).zone();
      });
      
    });

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfCategories');
      this.paginationService.setTotalItems(this.paginationService.defaultId(), this.collectionCount);
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortField.next('name');
    this.sortDirection.next(1);
    this.filterField.next('name');
    this.filterValue.next('');

    if (this.sectionsSub) {
        this.sectionsSub.unsubscribe();
      }
      this.sectionsSub = MeteorObservable.subscribe('sections')
        .subscribe(() => {
          this.sections = Sections.find({}).zone();
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

  update = function(category){
    Categories.update(category._id, {
      $set: { 
         name: category.name,
         sectionId: category.sectionId,
      }
    });
  }

  saveCategory(value: any){
    if (!Meteor.userId()) {
      alert('Ingrese al sistema para guardar la categoria');
      return;
    }

    if (this.complexForm.valid) {
      Categories.insert({
        name: this.complexForm.value.name, 
        sectionId: this.complexForm.value.section._id 
      });
      this.complexForm.reset();
    }
    console.log(value);
  }

  copy(original: any){
    return Object.assign({}, original)
  }

  search(field: string, value: string): void {
    console.log(field);
    console.log(value);
    // this.curPage.next(1);
    // this.filterField.next(field);
    // this.filterValue.next(value); 
  }
  
  changeSortOrder(direction: string, fieldName: string): void {
    this.sortDirection.next(parseInt(direction));
    this.sortField.next(fieldName);
  }

}


  // categories: Category[];
  // sections: Section[];

// constructor(
  //   private paginationService: PaginationService
  // ) {
    // this.categories = [
    //   { "_id" : "01", "name" : "Shorts", "sectionId" : "01" },
    //   { "_id" : "02", "name" : "Panatalon Largo", "sectionId" : "01" },
    //   { "_id" : "03", "name" : "Pantalon Corto", "sectionId" : "01" },
    //   { "_id" : "04", "name" : "Calza", "sectionId" : "01" },
    //   { "_id" : "05", "name" : "Pollera", "sectionId" : "02" },
    //   { "_id" : "06", "name" : "Remera Mangas Corta", "sectionId" : "03" },
    //   { "_id" : "07", "name" : "Remera Mangas Larga", "sectionId" : "03" },
    //   { "_id" : "08", "name" : "Camisa", "sectionId" : "03" },
    //   { "_id" : "09", "name" : "Blusa", "sectionId" : "03" },
    //   { "_id" : "10", "name" : "Musculosa", "sectionId" : "03" },
    //   { "_id" : "11", "name" : "Pupera", "sectionId" : "03" },
    //   { "_id" : "12", "name" : "Saco Sport", "sectionId" : "04" },
    //   { "_id" : "13", "name" : "Rompeviento", "sectionId" : "05" },
    //   { "_id" : "14", "name" : "Chupin", "sectionId" : "01" },
    // ];

    // this.sections = [
    //   { "_id" : "01", "name" : "Pantalon" },
    //   { "_id" : "02", "name" : "Vestido" },
    //   { "_id" : "03", "name" : "Remera" },
    //   { "_id" : "04", "name" : "Saco" },
    //   { "_id" : "05", "name" : "Campera" },
    // ];
  // }