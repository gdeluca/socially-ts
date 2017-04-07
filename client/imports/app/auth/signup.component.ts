import {Component, OnInit, OnDestroy, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';

// reactive
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';


import { Stores } from '../../../../both/collections/stores.collection';
import { UserStores } from '../../../../both/collections/user-stores.collection';
import { Users, rolesMapping } from '../../../../both/collections/users.collection';

import { Store } from '../../../../both/models/store.model';

//domain
import { emailValidator, matchingPasswords, notEmptyArrayValidator } from '../../validators/validators';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from '../../modules/multiselect';
import * as _ from 'underscore';
import { Bert } from 'meteor/themeteorchef:bert';

import template from './signup.component.html';
 
@Component({
  selector: 'signup',
  template
})
export class SignupComponent implements OnInit, OnDestroy {
  signupForm: FormGroup;
  
  valuesMapping = rolesMapping;
 
  stores: Observable<Store[]>;
  storesSub: Subscription;

  selectedRole = 'supervisor';
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
      role: ['', Validators.required],
      stores: [[], notEmptyArrayValidator]
      }, 
      {validator: matchingPasswords('password', 'confirmPassword')
    });

    this.storesSub = MeteorObservable.subscribe('stores')
    .subscribe(() => {
      this.stores = Stores.find({}).zone();

      this.storesData = this.populateStoresDropdownData(); 
      for (let store of this.storesData) { 
        this.storesSelected.push(store.id);
      }
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
        values.role,
        values.stores,
      ).subscribe(() => { 
        Bert.alert('Usuario Creado', 'success', 'growl-top-right'); 
        this.router.navigate(['/']);
      }, (error) => { 
        Bert.alert('Fallo al crear el usuario: ' + error, 'danger', 'growl-top-right'); 
      })
    }
  }

}
