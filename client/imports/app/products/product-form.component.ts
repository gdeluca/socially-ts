import { Meteor } from 'meteor/meteor';
import { InjectUser } from 'angular2-meteor-accounts-ui';

import { Component, OnInit, ViewChild, Input, Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'; 

import { Products } from '../../../../both/collections/products.collection';
import { FocusDirective } from '../../directives/focus.directive';

import template from './product-form.component.html';

@Component({
  selector: 'product-form', 
  template
})
@Injectable()
@InjectUser('user')
export class ProductFormComponent implements OnInit {
  addForm: FormGroup;
  user: Meteor.User;
  
  private submitFocused = false;

  constructor(
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.addForm = this.formBuilder.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      size: [],
      description: ['', Validators.required]
    });
  }

  add(): void {
    if (!Meteor.userId()) {
      alert('Please log in to add a product');
      return;
    }

    if (this.addForm.valid) {
      Products.insert(Object.assign({}, this.addForm.value));
      this.addForm.reset();
    }
  }

  setSubmitFocus(): void {
    this.submitFocused = true;
    setTimeout(() => {this.submitFocused = false});
  }

}