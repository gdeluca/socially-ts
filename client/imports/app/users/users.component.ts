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
    {key: 'email', value:''},
  ];

  // name, sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Nombre de Usuario', 'value':'username'},
    {'key': 'Email', 'value':'email'},
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
  paginatedStores: Observable<Store[]>; // stores related to current page of users
  paginatedUserStores: Observable<UserStore[]>; // stores related to current page of users
  
  editedUser: any = {username:'', email:'',_id:'', storeIds:[]};
  stores: Observable<Store[]>; // all the stores from the collection
  
  selectedStores: Store[]; // selected store from save form 
  selectedRole: string = '';
  st: string[][];

  complexForm : FormGroup;

  constructor(
    private zone: NgZone, 
    private paginationService: PaginationService, 
    private formBuilder: FormBuilder,
  ){
    this.complexForm = formBuilder.group({
      username: ["", Validators.required],
      email: ['', Validators.compose([Validators.required,  emailValidator])],
      password: ["", Validators.required],
      confirmPassword: ['', Validators.required],
      store: ["", Validators.required]
      }, {validator: matchingPasswords('password', 'confirmPassword')
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
        'users.stores', 
        options, 
        filters
      ).subscribe(() => {
        this.users = Users.find({}).zone();
        this.paginatedStores = Stores.find({}).zone();
        this.paginatedUserStores = UserStores.find({}).zone();
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
 
  copy(original: User){
    this.editedUser = {
      username: original.username, 
      email: original.emails[0].address,
      _id:original._id
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
      'addUser', 
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

  saveUser() {
    if (!Meteor.userId()) {
      alert('Ingrese al sistema para realizar cambios');
      return;
    }

    if (this.complexForm.valid) {
      let values = this.complexForm.value;
      MeteorObservable.call(
        'addUser', 
        values.email,
        values.username,
        values.password,
        this.selectedStores,
        this.selectedRole
      ).subscribe(() => { 
        Bert.alert('Usuario Creado', 'success', 'growl-top-right'); 
        this.complexForm.reset();
      }, (error) => { 
        Bert.alert('Fallo al crear el usuario: ' + error, 'danger', 'growl-top-right'); 
      })
    }
  }

}
