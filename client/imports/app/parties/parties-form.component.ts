import { Meteor } from 'meteor/meteor';
import { InjectUser } from 'angular2-meteor-accounts-ui';

import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms'; 

import { Parties } from '../../../../both/collections/parties.collection';
import { FocusDirective } from '../../directives/focus.directive';

import template from './parties-form.component.html';

@Component({
  selector: 'parties-form', 
  template
})

@InjectUser('user')
export class PartiesFormComponent implements OnInit {
  addForm: FormGroup;
  user: Meteor.User;
  
  private submitFocused = false;

  constructor(
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    //console.log(this.user);
    this.addForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [],
      location: ['', Validators.required],
      public: [false]
    });
  }

  addParty(): void {
    if (!Meteor.userId()) {
      alert('Please log in to add a party');
      return;
    }

    if (this.addForm.valid) {
      Parties.insert(Object.assign({}, this.addForm.value, { owner: Meteor.userId() }));
      this.addForm.reset();
    }
  }

  setSubmitFocus(): void {
    this.submitFocused = true;
    setTimeout(() => {this.submitFocused = false});
  }

}