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
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from '../../modules/multiselect';

// model 
import { Categories } from '../../../../both/collections/categories.collection';
import { Products } from '../../../../both/collections/products.collection';
import { lettersSizes, uniqueSize } from '../../../../both/collections/product-sizes.collection';

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

  sizesType: string;
  numericSizesData: IMultiSelectOption[];
  numericStartSelected: number[];
  numericEndSelected: number[];
  lettersSizesData: IMultiSelectOption[];
  lettersStartSelected: number[];
  lettersEndSelected: number[];
  selectorSizesData: IMultiSelectOption[];
  sizesSelector: number[];

  commonTexts: IMultiSelectTexts = { 
    checkAll: 'Todos', 
    uncheckAll: 'Ninguno',
    checked: 'Selecionado',
    checkedPlural: 'Seleccionados',
    searchPlaceholder: 'Buscar...',
    defaultTitle: 'Sin seleccion',
    allSelected: 'Todos Selecionados',
  };

  singleSettings: IMultiSelectSettings = {
    pullRight: false,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-secondary',
    selectionLimit: 1,
    autoUnselect: true,
    closeOnSelect: true,
    showCheckAll: false,
    showUncheckAll: false,
    dynamicTitleMaxItems: 1,
    maxHeight: '300px' 
  };

  multiSettingsWithoutChecks: IMultiSelectSettings = {
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
    private formBuilder: FormBuilder
  ){
    this.complexForm = formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      code: ['', Validators.compose([Validators.required, Validators.minLength(10)])],
      color:[''],
      brand: [''],
      model: [''],
      provider: ['', Validators.required],
      category: ['', Validators.required],
      sizesSelector: ['', Validators.required]
    });

    this.numericSizesData = this.generateNumericOptions(1,69);
    this.numericStartSelected = [1];
    this.numericEndSelected = [10];
    this.lettersSizesData = this.generateLettersOptions(lettersSizes);
    this.lettersStartSelected = [70];
    this.lettersEndSelected = [74];
    
    this.sizesType = 'letters';
    this.setSizes('letters', [70], [74]);
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

  generateNumericOptions(start, amount): IMultiSelectOption[] {
    let result: IMultiSelectOption[] = [];
    for (var i = start; i <= amount; ++i) {
      result.push({id: i, name: ""+i });
    }
    return result;
  } 

  generateLettersOptions(letters) : IMultiSelectOption[]{
    let result: IMultiSelectOption[] = [];
    for (let letter in letters) {
      result.push({id: +letters[letter], name: ""+letter });
    }
    return result;
  } 

  generateNumberSequence(start, end) {
    let result: number[] = [];
    for (var i = start; i <= end; i++) {
        result.push(i);
    }
    return result;
  } 

  setSizes(type, init, end){
    switch(type) { 
      case 'numeric': { 
        this.selectorSizesData = this.numericSizesData;
         this.sizesSelector = 
           this.generateNumberSequence(init[0], end[0]);
        break;
      }  
      case 'letters': { 
        this.selectorSizesData = this.lettersSizesData;
        this.sizesSelector = 
           this.generateNumberSequence(init[0], end[0]);
        break;
      } 
      case 'unique': {
        this.selectorSizesData = [{id: 0, name: "UNICO" }];
        this.sizesSelector = [0];
        break;
      } 
      default: { 
        return;
      } 
    } 
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

      this.saveProduct(product, values);

    }
  }

  saveProduct(product, values){
    MeteorObservable.call('saveProduct', product).subscribe(
      (response) => {
        this.saveProductSizes(response, product.code, values.sizesSelector);
        Bert.alert('Se agrego el producto: ' + product.code , 'success', 'growl-top-right' ); 
      }, (error) => {
        Bert.alert('Error al guardar:  ${error} ', 'danger', 'growl-top-right' ); 
    });
  }
 
  saveProductSizes(id, code, sizes){
    MeteorObservable.call('saveProductSizes', id, code, sizes).subscribe(() => {
      Bert.alert('Se agregaron los talles: ' + JSON.stringify(sizes), 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al guardar: ' +  error, 'danger', 'growl-top-right' ); 
    });
  }
 
}
