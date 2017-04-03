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

import * as _ from 'underscore';
import { Bert } from 'meteor/themeteorchef:bert';

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
  selectedStores: string[];
  selectedRole: string;
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
    if (this.signupForm.valid) {
      let values = this.signupForm.value;
      MeteorObservable.call(
        'addUser', 
        values.email,
        values.username,
        values.password,
        this.selectedStores,
        this.selectedRole
      ).subscribe(() => { 
        Bert.alert('Usuario Creado', 'success', 'growl-top-right'); 
        this.router.navigate(['/']);
      }, (error) => { 
        Bert.alert('Fallo al crear el usuario: ' + error, 'danger', 'growl-top-right'); 
      })
    }
  }

}
