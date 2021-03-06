import {Component, OnInit, OnDestroy ,NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Meteor } from 'meteor/meteor';

// reactive
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable, ObservableCursor } from 'meteor-rxjs';

// collections
import { Stores } from '../../../../both/collections/stores.collection';
import { UserStore } from '../../../../both/models/user-store.model';
import { UserStores } from '../../../../both/collections/user-stores.collection';
import { Users } from '../../../../both/collections/users.collection';

// model
import { Store } from '../../../../both/models/store.model';
import { User } from '../../../../both/models/user.model';
import { Balance } from '../../../../both/models/balance.model';

import * as _ from 'underscore';
import { Bert } from 'meteor/themeteorchef:bert';
import { SessionHelper } from '../../modules/session-helper';

import template from './login.component.html';
 
@Component({
  selector: 'login', 
  template
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  error: string;

  email: string;
  username: string;
  storeId: string;
  prevEmail: string;
  prevUsername: string;

  stores: Observable<Store[]>;
  userSub: Subscription;
  selectedStore: Store;

  constructor(
    private router: Router, 
    private zone: NgZone, 
    private formBuilder: FormBuilder,
   // private session: SessionHelper
    ) {}
 
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      storeId: ['', Validators.required]
    });
 
    this.error = '';
    this.userSearch();
    
}

  userSearch() {
    if ((!this.email || !this.username) ||
     (this.email == this.prevEmail && 
       this.username == this.prevUsername)) {
      return;
    }

    if (this.userSub){
      this.userSub.unsubscribe();
    } 

    let email = this.email.toUpperCase();
    let username = this.username.toUpperCase();

    this.userSub = MeteorObservable.subscribe(
      'user.stores', 
      email, 
      username
    ).subscribe(() => {
      var user = Users.findOne();
      if (user) {
        let userStores = UserStores.find().zone();
        userStores.subscribe((userstores) => {
          let ids = _.pluck(userstores, 'storeId');
          this.stores = Stores.find({_id: {$in: ids}}, {sort: {name: 1}}).zone();
        });
      } else {
        this.prevEmail = this.email;
        this.prevUsername = this.username;
        Bert.alert('Usuario invalido: ', 'danger', 'growl-top-right' ); 
      }
    })
  }

  ngOnDestroy() {
    if (this.userSub){
        this.userSub.unsubscribe();
    }
  } 

  login(event) {
    if (this.loginForm.valid) {
      let values = this.loginForm.value;
      Meteor.loginWithPassword(
        values.email.toUpperCase(), 
        values.password.toUpperCase(), (err) => 
        {
          this.zone.run(() => 
            {
              if (err) {
               Bert.alert(err.reason, 'danger', 'growl-top-right' ); 
              } else {
                let currentStoreName = (values.storeId > -1)?
                  Stores.findOne(values.storeId).name:"MODO ADMINISTRADOR";
                Session.setPersistent("currentStoreName", currentStoreName);
                Session.setPersistent("currentStoreId", values.storeId);
                this.updateBalanceStatus(values.storeId);
                
                this.router.navigate(['/']);
              }
            }
          )
        }
      )
    }
  }

  updateBalanceStatus(storeId: string) {
    MeteorObservable.call('findCurrentStoreBalance', storeId
    ).subscribe((balance: Balance) => {
        let balanceNumber = (balance)?balance.balanceNumber:-1;
        Session.setPersistent("currentBalanceNumber", balanceNumber);
        
        let balanceStatus = (balance)?balance.status:'';
        Session.setPersistent("currentBalanceStatus", balanceStatus);
      }
    ); 
  }

}