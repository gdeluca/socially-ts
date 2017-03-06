// angular
import { Component, OnInit, OnDestroy, Injectable, Inject, NgZone } from '@angular/core';
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
import { SearchOptions } from '../../../../both/search/search-options';

// model 
import { Users } from '../../../../both/collections/users.collection';
import { UserStores } from '../../../../both/collections/user-stores.collection';
import { Stores } from '../../../../both/collections/stores.collection';

import { Dictionary } from '../../../../both/models/dictionary';
import { Container } from '../../../../both/models/container';

import { emailValidator, matchingPasswords } from '../validators/validators';

import { UserStore } from '../../../../both/models/user-store.model';
import { Store } from '../../../../both/models/store.model';
import { User } from '../../../../both/models/user.model';

import template from './users.component.html';
import style from './users.component.scss';

@Component({ 
  selector: 'users',
  template,
  styles: [ style ],
})
@InjectUser('user')
export class UsersComponent implements OnInit, OnDestroy {
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filterField: Subject<string> = new Subject<string>();
  filterValue: Subject<string> = new Subject<string>();


  collectionCount: number = 0;
  PAGESIZE: number = 6; 
  
  storesSub: Subscription;
  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;


  user: Meteor.User;
  editedUser: any = {username:'', email:'',_id:'', storeIds:[]};
  adding: boolean = false;
  editing: boolean = false;
  users: Observable<User[]>; // users from the collection related to current page
  paginatedStores: Observable<Store[]>; // stores related to current page of users
  stores: Observable<Store[]>; // all the stores from the collection
  selectedStores: Store[]; // selected store from save form 
  paginatedUserStores: Observable<UserStore[]>; // stores related to current page of users
  
  st: string[][];

  // name, sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Nombre de Usuario', 'value':'username'},
    {'key': 'Email', 'value':'email'},
    {'key': 'Sucursal', 'value':'storeIds'},
  ];
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
      this.paginatedSub = MeteorObservable.subscribe('users.stores', options, filterField, filterValue)
        .subscribe(() => {
          this.users = Users.find({}).zone();
          this.paginatedStores = Stores.find({}).zone();
          this.paginatedUserStores = UserStores.find({}).zone();
          });
    });

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfUsers');
      this.paginationService.setTotalItems(this.paginationService.defaultId(), this.collectionCount);
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortField.next('email');
    this.sortDirection.next(1);
    this.filterField.next('email');
    this.filterValue.next('');

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

  }

  ngOnDestroy() {
    this.paginatedSub.unsubscribe();
    this.optionsSub.unsubscribe(); 
    this.autorunSub.unsubscribe();
  }  

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }
 
  update = function(user){
    console.log(this.editedUser);
    console.log(user);
    
    // console.log(user);
    Users.update({_id: user._id}, {
      $set: { 
        username: user.username
      }
    }); 
    var currentStoreIds=[];
    UserStores.find({userId: user._id}).mergeMap(userStores => {
      return userStores.map(userStore => {
        return userStore.storeId})}).subscribe(res => {currentStoreIds.push(res)});

    var newStoreIds = [];
    if (user.storeIds) {
      newStoreIds = user.storeIds.map(ids => {return ids._id})
      // console.log('new ids ' + newStoreIds);

    }
    var storeIdsToRemove = currentStoreIds.filter(x => newStoreIds.indexOf(x) == -1);
    var storeIdsToAdd = newStoreIds.filter(x => currentStoreIds.indexOf(x) == -1);

    for (let storeId of storeIdsToAdd) {
      // console.log('adding ' + storeId);
      UserStores.insert({userId: user._id, storeId: storeId});
    }

    for (let storeId of storeIdsToRemove) {
      // console.log('removing ' + storeId);
      UserStores.find({userId: user._id, storeId: storeId})
        .mergeMap(userStores => {return userStores })
        .subscribe((userStore: UserStore) => {
        UserStores.remove(userStore._id)})    
    } 
  }

 saveUser() {
    if (!Meteor.userId()) {
      alert('Ingrese al sistema para realizar cambios');
      return;
    }

    var user_id = ''
    if (this.complexForm.valid) {
      user_id = Accounts.createUser({
        email: this.complexForm.value.email,
        password: this.complexForm.value.password
      }, (err) => {
        if (err) {
          this.zone.run(() => {
            console.log(err);
          });
        } else {
          for (let store of this.selectedStores) {
            UserStores.collection.insert({
              userId: Meteor.userId(), 
              storeId: store._id 
            });
          }
        }
      });
      this.complexForm.reset();
    }
  }

  copy(original: User){
    this.editedUser = {
      username: original.username, 
      email: original.emails[0].address,
      _id:original._id
    };

    return this.editedUser;
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
