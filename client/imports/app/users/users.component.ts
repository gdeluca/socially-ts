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
  editedUser: any = {username:'', email:'',_id:''};
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
    {'key': 'Sucursal', 'value':'storeId'},
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
         // this.findStoresForUser();
 
           // var source = 
           //   Observable.combineLatest(
           //     this.users,
           //     this.paginatedStores, 
           //     this.paginatedUserStores,
           //     function (users, stores, userstores) {
           //       return  stores.map(store => {return store}) ;
           //     });

           //  source.subscribe(x => {
           //    this.st =  x;
           //    console.log(x);
           //  });  
             

             // const combined = Observable
             //    .combineLatest(
             //        this.users,
             //        this.paginatedStores,
             //        this.paginatedUserStores
             //    );
             // const subscribe = combined.subscribe(latestValues => {
             //      const [users, paginatedStores, paginatedUserStores] = latestValues;
             // console.log(
             //      `Timer One Latest: ${users}, 
             //       Timer Two Latest: ${paginatedStores}, 
             //       Timer Three Latest: ${paginatedUserStores}`
             //     );
             //  });


             // let eventSource  =
             //   this.users.distinctUntilChanged()
             //   .concat(this.paginatedStores.distinctUntilChanged())
             //   .concat(this.paginatedUserStores.distinctUntilChanged())
             //   .subscribe((val) => {
             //     console.log(val);
             //   });

            const combined = Observable.combineLatest(
             this.users.distinctUntilChanged(),
             this.paginatedStores.distinctUntilChanged(),
             this.paginatedUserStores.distinctUntilChanged(),
             (users: User[], paginatedStores: Store[], paginatedUserStores: UserStore[]) => {

               users.map(user => { 
                 return paginatedStores
                   .map(paginatedStore => { 
                     return paginatedUserStores
                     .filter(paginatedUserStore => {
                       paginatedUserStore.storeId == paginatedStore._id &&
                       paginatedUserStore.userId == user._id
                     })
                     .map(paginatedUserStore => {
                        return paginatedStore.name;
                     })
                   })
                 })
               })

            // const subscribe = combined.subscribe(latestValuesProject => {
            //       const [val] = latestValuesProject;
            //       console.log(val);
            //       //this.st =  Observable.from(paginatedStores as Store[]);
            //     });


               // this.users.distinctUntilChanged()
             //   .map(user => {
             //     this.paginatedStores.distinctUntilChanged()
             //     .map(paginatedStore => {
             //       this.paginatedUserStores.distinctUntilChanged()
             //       .map(paginatedUserStore => {
             //         paginatedUserStore.filter(() =>
             //           paginatedUserStore.storeId == paginatedStore._id &&
             //           paginatedUserStore.userId == user._id
             //       })
             //     })
             //    })
             // })




             // const combined = Observable
             //    .combineLatest(
             //        this.users.distinctUntilChanged(),
             //        this.paginatedStores.distinctUntilChanged(),
             //        this.paginatedUserStores.distinctUntilChanged(),
             //    (users, paginatedStores, paginatedUserStores) => {
             //      return paginatedStores.map(paginatedStore => {
             //        return users.map(user => { 
             //          return paginatedUserStores.filter(paginatedUserStore => {
             //            paginatedUserStore.storeId == paginatedStore._id &&
             //            paginatedUserStore.userId == user._id
             //          }) 
             //        })
             //      })
             //      // return `Timer One (Proj) Latest: ${users}, 
             //      //         Timer Two (Proj) Latest: ${paginatedStores}, 
             //      //         Timer Three (Proj) Latest: ${paginatedUserStores}`
             //    }) 

             //    const subscribe = combined.subscribe(latestValuesProject => {
             //      const [users, paginatedStores, paginatedUserStores] = latestValuesProject;
             //      console.log(latestValuesProject);
             //      //this.st =  Observable.from(paginatedStores as Store[]);
             //    });


             // const subscribe2 = combined.subscribe(latestValues => {
             //      const [users, paginatedStores, paginatedUserStores] = latestValues;
             //    console.log(
             //      `Timer One Latest: ${users}, 
             //       Timer Two Latest: ${paginatedStores}, 
             //       Timer Three Latest: ${paginatedUserStores}`
             //     );
             //  });


           //   .map(res => this.join( res[0], res[1] )))
           // this.st.subscribe(x => console.log(x),
           // error => console.error(error),
           // () => console.log('done'));

            // .map(res => { 
            //   let users = res[0];
            //   let paginatedStores = res[1];
            //   let paginatedUserStores = res[2]; 
            //   this.st = Observable.from(paginatedStores) ;  
              // return users.map(user => {
              //    this.st = Observable.from(paginatedUserStores.map(paginatedUserStore => { 
              //     return paginatedStores.filter(paginatedStore => {
              //         paginatedUserStore.storeId == paginatedStore._id &&
              //         paginatedUserStore.userId == user._id
              //       }) 
              //     })) 
              //   })
              // }); 
              //return


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

  //  join(stores, userstores){
  //    console.log('a');
  //   return stores.map(store => {
  //     return userstores
  //     .filter(userstore => userstore.storeId == store._id)
  //     .map(userstore => {
  //       return {
  //         id: store._id,
  //         title: store.name,
  //         user_id: userstore.userId,
  //       }
  //     })
  //   }).reduce((a,b) =>{
  //     console.log('test');
  //     return a.concat(b);
  //   }, []);
  // }

  
  ngOnDestroy() {
    this.paginatedSub.unsubscribe();
    this.optionsSub.unsubscribe(); 
    this.autorunSub.unsubscribe();
  }  

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }
 
  update = function(user){
    console.log(user);
    /*Users.update(user._id,
      $set: { 
        emails[0].address: user.email,
        username: user.username,

      }
    });*/
  } 

  findStoreNamesForUser(user: User){

    // console.log(this.userStores);
    // let val =  this.userStores[user._id];
    // let arr = val.map(item => item.name).join(", ");
    // return arr;
  }

  findStoresForUser(){
    console.log('sds'); 

    this.users.mapTo(this.paginatedStores).combineAll().subscribe((val)=> {
      console.log('Example 1: Basic concat:', val);
    });


    /*this.users.subscribe((users: User[]) => {
      // console.log('user');
      this.paginatedStores.subscribe((paginatedStore: Store[]) => {
        // console.log('paginatestore');
        this.paginatedUserStores.subscribe((paginatedUserStore: UserStore[]) => {
          // console.log('paginatedUserStore');
            console.log(1);
            console.log(users);
              console.log(paginatedStore);
                console.log(paginatedUserStore);
          for (let user of users) {
            for (let pStore of paginatedStore) {
              for (let pUserStore of paginatedUserStore) {
                // console.log(pUserStore.storeId);
                // console.log(pStore._id);
                // console.log('AND');
                // console.log(pUserStore.userId);
                // console.log(user._id);
                if (pUserStore.storeId === pStore._id && pUserStore.userId === user._id) {
                  let container = this.userStores[user._id]; 
                  if (!container) {
                    container = new Container([pStore]);
                  } else {
                    container.add(pStore);
                  }
                  console.log(pStore);
                  this.userStores[user._id] = container; 
                 //  console.log(container);
                 // console.log(this.userStores);
                }
              }
            }
          }
        }) 
      })
    })*/
    // console.log(this.userStores);
  }

  updateUserAndUserStores = function(user, stores: Store[]){
    let storesIds = stores.map(store => store._id);
    let userStoresIdsInDB = UserStores.collection.find({userId: user._id}).map(us => us.storeId);
    let userStoresToAdd = storesIds.filter(item => userStoresIdsInDB.indexOf(item) < 0);
    let userStoresToRemove = userStoresIdsInDB.filter(item => storesIds.indexOf(item) < 0);
    
    for (let storeId of userStoresToAdd) {
      UserStores.insert({
        userId: user._id,
        storeId: storeId
      });  
    }
    for (let storeId of userStoresToRemove) {
      UserStores.remove({
        userId: user._id,
        storeId: storeId
      });  
    }
    Users.update(
      {userId: user._id},
      { $set: { 
         email: user.email,
      }
    });
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