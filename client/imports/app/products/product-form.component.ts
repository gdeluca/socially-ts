// angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InjectUser } from "angular2-meteor-accounts-ui";

// reactive
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Subject } from 'rxjs/Subject';

import { Bert } from 'meteor/themeteorchef:bert';

// model 
import { Categories } from '../../../../both/collections/categories.collection';
import { Products } from '../../../../both/collections/products.collection';

import { Category } from '../../../../both/models/category.model';

import template from './product-form.component.html';
import style from './product-form.component.scss';

@Component({
  selector: 'product-form',
  template,
  styles: [ style ],
})
@InjectUser('currentUser')
export class ProductFormComponent implements OnInit, OnDestroy {
  
  categoriesSub: Subscription;
  currentUser: Meteor.User;
  adding: boolean = false;
  allCategories: Observable<Category[]>;
  complexForm : FormGroup;

  constructor(
    private formBuilder: FormBuilder
  ){
    this.complexForm = formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      code: ['', Validators.compose([Validators.required, Validators.minLength(10)])],
      color:[''],
      brand: [''],
      model: [''],
      provider: ['', Validators.required],
      category: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.categoriesSub) {
        this.categoriesSub.unsubscribe();
    }
    this.categoriesSub = MeteorObservable.subscribe('categories')
      .subscribe(() => {
        this.allCategories = Categories.find({}).zone();
    });
  }
  
  ngOnDestroy() {
    this.categoriesSub.unsubscribe();
  } 

  save(form: FormGroup){
    if (!Meteor.userId()) {
      alert('Ingrese al sistema para poder guardar');
      return;
    }
    let values = form.value;
    if (form.valid) {

      let product = {
        name: values.name, 
        code: values.code, 
        color: values.color, 
        brand: values.brand, 
        model: values.model, 
        provider: values.provider, 
        categoryId: values.category._id
      };

      MeteorObservable.call('saveProduct', product).subscribe(() => {
        Bert.alert('Se agrego el producto: ' + product.code , 'success', 'growl-top-right' ); 
      }, (error) => {
        Bert.alert('Error al guardar:  ${error} ', 'danger', 'growl-top-right' ); 
      });

      form.reset();
    }
    console.log(values);
  }

}
