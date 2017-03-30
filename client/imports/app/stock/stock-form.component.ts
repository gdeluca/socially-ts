
// angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InjectUser } from "angular2-meteor-accounts-ui";

// reactiveX
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Subject } from 'rxjs/Subject';

// collections
import { Categories } from '../../../../both/collections/categories.collection';
import { Tags } from '../../../../both/collections/tags.collection';

// model 
import { Category } from '../../../../both/models/category.model';
import { Tag } from '../../../../both/models/tag.model';

import { isNumeric } from '../../validators/validators';

import template from "./stock-form.component.html";
import style from "./stock-form.component.scss";

@Component({
  selector: "stock-form",
  template,
  styles: [ style ]
})
@InjectUser('currentUser')
export class StockFormComponent implements OnInit, OnDestroy {

  categoriesSub: Subscription;
  sectionsSub: Subscription;

  currentUser: Meteor.User;

  allCategories: Observable<Category[]>;
  allSections: Observable<Tag[]>;

  complexForm : FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ){
    this.complexForm = formBuilder.group({
      barCode:     ['', Validators.compose([Validators.required, Validators.minLength(12)])],
      name:        ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      color:       ['', Validators.required],
      size:        ['', Validators.required],
      provider:    ['', Validators.required],
      cost:        ['', Validators.compose([Validators.required, isNumeric])],
      cashPayment: ['', Validators.compose([Validators.required, isNumeric])],
      cardPayment: ['', Validators.compose([Validators.required, isNumeric])],
      category:    ['', Validators.required],
      section:     ['', Validators.required],
    });
  }
 
  ngOnInit() {

    if (this.sectionsSub) {
      this.sectionsSub.unsubscribe();
    }
    this.sectionsSub = MeteorObservable.subscribe('tags.section')
      .subscribe(() => {
        this.allSections = Tags.find({}).zone();
    });

    if (this.categoriesSub) {
      this.categoriesSub.unsubscribe();
    } 
    this.categoriesSub = MeteorObservable.subscribe('categories')
      .subscribe(() => {
        this.allCategories = Categories.find({}).zone();
    });

  }
  
  ngOnDestroy() {
    this.sectionsSub.unsubscribe();
    this.categoriesSub.unsubscribe();
  } 

  save(form: FormGroup){
    if (!Meteor.userId()) {
      alert('Ingrese al sistema para poder guardar');
      return;
    } 
    if (form.valid) {
      let values = form.value;

      MeteorObservable.call('saveStock', values)
        .subscribe(() => {
          alert('Stock successfully saved.');
        }, (error) => {
          alert(`Failed to save to ${error}`);
      });
        
      this.complexForm.reset();
    }
  }

}
 
