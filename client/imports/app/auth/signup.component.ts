import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';

// reactive
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';

import { emailValidator, matchingPasswords } from '../../validators/validators';

import { Store } from '../../../../both/models/store.model';
import { Stores } from '../../../../both/collections/stores.collection';
import { UserStores } from '../../../../both/collections/user-stores.collection';

import template from './signup.component.html';
 
@Component({
  selector: 'signup',
  template
})
export class SignupComponent implements OnInit, OnDestroy {
  signupForm: FormGroup;
  error: string;
 
  stores: Observable<Store[]>;
  storesSub: Subscription;
  selectedStore: Store;

  constructor(
    private router: Router, 
    private zone: NgZone, 
    private formBuilder: FormBuilder) 
  {}
 
  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required,  emailValidator])],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      stores: ['', Validators.required]
      }, 
      {validator: matchingPasswords('password', 'confirmPassword')
    });

    this.error = '';

    this.storesSub = MeteorObservable.subscribe('stores')
      .subscribe(() => {
        this.stores = Stores.find({}).zone();
    });

  }
 
  ngOnDestroy() {
    this.storesSub.unsubscribe();
  } 

  signup() {
    var user_id = ''
    if (this.signupForm.valid) {
      let values = this.signupForm.value;
      let user_id = Accounts.createUser({
        email: values.email,
        username: values.name,
        password: values.password,
        profile: { name: values.name }
      }, (err) => {
        if (err) {
          this.zone.run(() => {
            console.log(err);
            this.error = err;
          });
        } else {
          UserStores.collection.insert({
            userId: Meteor.userId(), 
            storeId: this.selectedStore._id 
          });

          this.router.navigate(['/']);
        }
      });


     // Ensuring every user has an email address, should be in server-side code
      // Accounts.validateNewUser((user) => {
      // new SimpleSchema({
      //   _id: { type: String },
      //   emails: { type: Array },
      //   'emails.$': { type: Object },
      //   'emails.$.address': { type: String },
      //   'emails.$.verified': { type: Boolean },
      //   createdAt: { type: Date },
      //   services: { type: Object, blackbox: true }
      // }).validate(user);
    }
  }

}
