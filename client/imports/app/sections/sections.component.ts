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
import { Sections } from '../../../../both/collections/sections.collection';
import { Section } from '../../../../both/models/section.model';
import { Dictionary } from '../../../../both/models/dictionary';


 
import template from './sections.component.html';
import style from './sections.component.scss';

@Component({
  selector: 'sections',
  template,
  styles: [ style ],
})
@InjectUser('user')
export class SectionsComponent implements OnInit, OnDestroy {
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filterField: Subject<string> = new Subject<string>();
  filterValue: Subject<string> = new Subject<string>();


  collectionCount: number = 0;
  PAGESIZE: number = 6; 
  
  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;


  user: Meteor.User;
  editedSection: Section = {name:''};
  adding: boolean = false;
  editing: boolean = false;
  selected: any;
  sections: Observable<Section[]>;

  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Nombre', 'value': 'name'},
  ];
  complexForm : FormGroup;

  constructor(
    private paginationService: PaginationService, 
    private formBuilder: FormBuilder
  ){
    this.complexForm = formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(5)])],
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
      this.paginatedSub = MeteorObservable.subscribe('sections.with.counter', options, filterField, filterValue)
        .subscribe(() => {
          this.sections = Sections.find({}).zone();
      });
      
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortField.next('name');
    this.sortDirection.next(1);
    this.filterField.next('name');
    this.filterValue.next('');

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfSections');
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

  update = function(Section){
    Sections.update(Section._id, {
      $set: { 
         name: Section.name
      }
    });
  }

  save(value: any){
    if (!Meteor.userId()) {
      alert('Ingrese al sistema para poder guardar');
      return;
    }

    if (this.complexForm.valid) {
      Sections.insert({
        name: this.complexForm.value.name
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
    this.curPage.next(1);
    this.filterField.next(field);
    this.filterValue.next(value); 
  }
  
  changeSortOrder(direction: string, fieldName: string): void {
    this.sortDirection.next(parseInt(direction));
    this.sortField.next(fieldName);
  }

}