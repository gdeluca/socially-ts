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
import { SearchOptions } from '../../../../both/domain/search-options';

// model 
import { Stores } from '../../../../both/collections/stores.collection';
import { Store } from '../../../../both/models/store.model';

// domain
import { Dictionary } from '../../../../both/domain/dictionary';
import { Filter, Filters } from '../../../../both/domain/filter';
import * as _ from 'underscore';
import { Bert } from 'meteor/themeteorchef:bert';
 
import template from './stores.component.html';
import style from './stores.component.scss';

@Component({
  selector: 'stores',
  template,
  styles: [ style ],
})
@InjectUser('currentUser')
export class StoresComponent implements OnInit, OnDestroy {
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filters: Subject<Filters> = new Subject<Filters>();

  filtersParams: Filters = [
    {key: 'name', value:''},
    {key: 'address', value:''},
  ];

  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Sucursal', 'value': 'name'}, 
    {'key': 'Direccion', 'value': 'address'}, 
  ];

  collectionCount: number = 0;
  PAGESIZE: number = 6; 
  
  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;

  currentUser: Meteor.User;

  editedEntity: Store = {name:'', address:''};
  adding: boolean = false;
  editing: boolean = false;
  selected: any;
  stores: Observable<Store[]>; 

  complexForm : FormGroup;

  constructor(
    private paginationService: PaginationService, 
    private formBuilder: FormBuilder
  ){
    this.complexForm = formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      address: ['', Validators.required],
    });
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
      
      this.paginationService.setCurrentPage(
        this.paginationService.defaultId() , curPage as number);

      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }
      this.paginatedSub = MeteorObservable.subscribe(
        'paginated.stores', 
        options, 
        filters
      ).subscribe(() => {
        this.stores = Stores.find().zone();
      });
      
    });

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfStores');
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

  update = function(store){
    MeteorObservable.call(
      'updateStore', 
      store._id,
      store.name,
      store.address
    ).subscribe(() => { 
        Bert.alert('Sucursal actualizada', 'success', 'growl-top-right'); 
      }, (error) => { 
        Bert.alert('Fallo al actualizar datos: ' + error, 'danger', 'growl-top-right'); 
      }
    ); 
  }

  save(value: any){
    if (!Meteor.userId()) {
      alert('Ingrese al sistema para poder guardar');
      return;
    }
    let values = this.complexForm.value;
    if (this.complexForm.valid) {
      MeteorObservable.call(
        'addStore', 
        values.name, 
        values.address
      ).subscribe(() => {
        Bert.alert('Sucursal agregada', 'success', 'growl-top-right'); 
      }, (error) => {
        Bert.alert('Fallo al agregar la sucursal ' + error, 'danger', 'growl-top-right'); 
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
