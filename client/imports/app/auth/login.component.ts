import {Component, OnInit, OnDestroy ,NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Meteor } from 'meteor/meteor';

// reactive
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable, ObservableCursor } from 'meteor-rxjs';

import { Store } from '../../../../both/models/store.model';
import { User } from '../../../../both/models/user.model';
import { Stores } from '../../../../both/collections/stores.collection';
import { UserStore } from '../../../../both/models/user-store.model';
import { UserStores } from '../../../../both/collections/user-stores.collection';
import { Users } from '../../../../both/collections/users.collection';

import template from './login.component.html';
 
@Component({
  selector: 'login', 
  template
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  error: string;

  email: string;
  stores: Observable<Store[]>;
  userSub: Subscription;
  selectedStore: Store;

  constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {}
 
  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      store: ['', Validators.required]
    });
 
    this.error = '';
    this.updatesubscription(this.loginForm.value.email);
    
}

  updatesubscription(email){
    if (email) {
      if (this.userSub){
        this.userSub.unsubscribe();
      }
      this.userSub = MeteorObservable.subscribe('stores.useremail', email).subscribe(() => {
        console.log(email);
        var user = Users.collection.find({'emails.address': email}).fetch();
          
        console.log(user[0]._id);
        let userStores = UserStores.find({userId: user[0]._id}).zone();
        userStores.subscribe((userstores) => {
          console.log(userstores);
          let ids = userstores.map(function(userStore) {return userStore.storeId});
          console.log(ids);
          this.stores = Stores.find({_id: {$in: ids}}).zone();
          this.stores.subscribe((stores) => {
            console.log(stores);
          });
        });
      })
    }
  }

  ngOnDestroy() {
    if (this.userSub){
        this.userSub.unsubscribe();
    }
  } 

  login(event) {
    if (this.loginForm.valid) {
      Meteor.loginWithPassword(this.loginForm.value.email, this.loginForm.value.password, (err) => {
        this.zone.run(() => {
          if (err) {
            console.log(err);
            this.error = err;
          } else {
            Session.setPersistent("currentUserEmail", this.loginForm.value.email);
            Session.setPersistent("currentStoreName", this.selectedStore.name);
            this.router.navigate(['/']);
          }
        });
      });
    }
  }

}