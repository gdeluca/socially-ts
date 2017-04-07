// angular
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
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
import 'rxjs/add/operator/mergeMap';
import { Meteor } from 'meteor/meteor';
import 'rxjs/add/operator/map';


import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/domain/search-options';

//collections
import { Users } from '../../../../both/collections/users.collection';
import { UserStores } from '../../../../both/collections/user-stores.collection';
import { Stores } from '../../../../both/collections/stores.collection';

// model 
import { UserStore } from '../../../../both/models/user-store.model';
import { Store } from '../../../../both/models/store.model';
import { User } from '../../../../both/models/user.model';

// domain
import { emailValidator, matchingPasswords } from '../../validators/validators';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from '../../modules/multiselect';
import { Dictionary } from '../../../../both/domain/dictionary';
import { Filter, Filters } from '../../../../both/domain/filter';

import * as _ from 'underscore';
import { Bert } from 'meteor/themeteorchef:bert';

import template from './users.component.html';
import style from './users.component.scss';

@Component({ 
  selector: 'users',
  template,
  styles: [ style ],
})
@InjectUser('currentUser')
export class UsersComponent implements OnInit, OnDestroy {
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filters: Subject<Filters> = new Subject<Filters>();

  filtersParams: Filters = [
    {key: 'username', value:''},
    {key: 'email', value:''},
    {key: 'role', value:''},
  ];

  // name, sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Nombre de Usuario', 'value':'username'},
    {'key': 'Email', 'value':'email'},
    {'key': 'Persmisos', 'value':'role'},
    {'key': 'Sucursal', 'value':'storeIds'},
  ];

  collectionCount: number = 0;
  PAGESIZE: number = 6; 
  
  storesSub: Subscription;
  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;

  currentUser: Meteor.User;
  
  users: Observable<User[]>; // users from the collection related to current page
  stores: Observable<Store[]>; // stores related to current page of users
  userStores: Observable<UserStore[]>; // stores related to current page of users
  
  editedUser: any = {username:'', email:'', _id:'', role:'', stores:[]};
  allStores: Observable<Store[]>; // all the stores from the collection
  
  selectedStores: Store[]; // selected store from save form 
  selectedRole: string;
  storesSelected: number[] = []; // Default selection
  
  storesData: IMultiSelectOption[] = [];

  populateStoresDropdownData(){
    let result = [];
    let index = 0;
    this.stores
      .flatMap(function(stores) { return stores })
      .distinct()
      .subscribe((store) => {
        result.push({id: store['_id'], name: store['name'] }); 
      });
      
    return result;
  }

  commonTexts: IMultiSelectTexts = {
      checkAll: 'Todos',
      uncheckAll: 'Ninguno',
      checked: 'Selecionado',
      checkedPlural: 'Seleccionados',
      searchPlaceholder: 'Buscar...',
      defaultTitle: 'Sin seleccion',
      allSelected: 'Todos Selecionados',
  };

  multiSettingsWithChecks: IMultiSelectSettings = {
      pullRight: false,
      enableSearch: false,
      checkedStyle: 'fontawesome',
      buttonClasses: 'btn btn-default btn-secondary',
      selectionLimit: 0,
      autoUnselect: false,
      closeOnSelect: false,
      showCheckAll: false,
      showUncheckAll: false,
      dynamicTitleMaxItems: 10,
      maxHeight: '300px',
  };

  constructor(
    private zone: NgZone, 
    private paginationService: PaginationService, 
  ){ }

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
        'users.stores', 
        options, 
        filters
      ).subscribe(() => {
        this.users = Users.find({}).zone();
        this.stores = Stores.find({}).zone();
        this.userStores = UserStores.find({}).zone();
      });
    });

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfUsers');
      this.paginationService.setTotalItems(
        this.paginationService.defaultId(), this.collectionCount);
    });


    if (this.storesSub) {
        this.storesSub.unsubscribe();
      }
      this.storesSub = MeteorObservable.subscribe('stores')
        .subscribe(() => {
          this.stores = Stores.find({}).zone();
      });
    

    this.paginationService.register({
      id: this.paginationService.defaultId(),
      itemsPerPage: this.PAGESIZE,
      currentPage: 1,
      totalItems: this.collectionCount,
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortField.next('email');
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
 
  copy(user: User){
    this.editedUser = {
      username: user.username, 
      email: user.emails[0].address,
      role: user['roles']['default-group'][0],
      _id:user._id
    };

    return this.editedUser;
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

  updateUser = function(user){
    MeteorObservable.call(
      'updateUser', 
      user._id,
      user.username,
      user.storeIds
    ).subscribe(() => { 
      Bert.alert('Datos de usuario actualizados', 'success', 'growl-top-right'); 
      this.router.navigate(['/']);
    }, (error) => { 
      Bert.alert('Fallo al actualizar el usuario: ' + error, 'danger', 'growl-top-right'); 
    })
  }

}
