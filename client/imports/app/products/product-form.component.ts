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
import { Products, productTagNames } from '../../../../both/collections/products.collection';
import { lettersSizes, uniqueSize } from '../../../../both/collections/product-sizes.collection';
import { Stores } from '../../../../both/collections/stores.collection';
import { Tags, definedTags } from '../../../../both/collections/tags.collection';


import { ProductPrice } from '../../../../both/models/product-price.model';
import { Category } from '../../../../both/models/category.model';
import { Store } from '../../../../both/models/store.model';
import { Tag } from '../../../../both/models/tag.model';

import { isNumeric } from '../../validators/validators'; 
import * as _ from 'underscore';

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
  storesSub: Subscription;
  allCategories: Observable<Category[]>;
  allStores: Observable<Store[]>;

  tagsSubs:Subscription[] = []; 
  tags: Observable<Tag[]>[] = [];
  productTagDef = productTagNames;
  sources:string[] = []; 

  currentUser: Meteor.User;
  adding: boolean = false;
  cashPayment = 0;
  cardPayment = 0;

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
      name:          ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      color:         ['', Validators.required],
      brand:         ['', Validators.required],
      model:         ['', Validators.required],
      provider:      ['', Validators.required],
      cost:          ['', Validators.compose([Validators.required, isNumeric])],
      cashPayment:   ['', Validators.compose([Validators.required, isNumeric])],
      cardPayment:   ['', Validators.compose([Validators.required, isNumeric])],
      category:      ['', Validators.required],
      sizesSelector: ['', Validators.required]
    });

    this.numericSizesData = this.generateNumericOptions(1,120);
    this.numericStartSelected = [1];
    this.numericEndSelected = [10];
    this.lettersSizesData = this.generateLettersOptions(lettersSizes);
    this.lettersStartSelected = [700];
    this.lettersEndSelected = [704];
    
    this.sizesType = 'letters';
    this.setSizes('letters', [700], [704]);
  }

  ngOnInit() {
    
    if (this.categoriesSub) {
        this.categoriesSub.unsubscribe();
    }
    this.categoriesSub = MeteorObservable.subscribe('categories')
      .subscribe(() => {
        this.allCategories = Categories.find({}).zone();
    });

    if (this.storesSub) {
      this.storesSub.unsubscribe();
    } 
    this.storesSub = MeteorObservable.subscribe('stores')
      .subscribe(() => {
        this.allStores = Stores.find({}).zone();
    });

    for (let name of this.productTagDef) {
      if (this.tagsSubs[name]) {
        this.tagsSubs[name].unsubscribe();
      } 
      this.tagsSubs[name] = MeteorObservable.subscribe('tags.'+name)
        .subscribe(() => {
        this.tags[name] = Tags.find({type: name}).zone();
        this.tags[name].subscribe((tags)=>{
          this.sources[name] = tags.map((tag) => {
            return tag.description;
          });
        })
      });
    }
  }
  
  ngOnDestroy() {
    this.categoriesSub.unsubscribe();
    
    for (let name of this.productTagDef) {
      if (this.tagsSubs[name]) {
        this.tagsSubs[name].unsubscribe();
      }
    } 
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

  populatePrices(values){
    console.log(values);
    this.cashPayment = values * 2;
    this.cardPayment = Math.round(values * 2.1);
  }
  save(form: FormGroup){
    if (!Meteor.userId()) {
      alert('Ingrese al sistema para poder guardar');
      return;
    }

    let values = form.value;

    if (form.valid) {
      this.saveProduct(values);
    }
  }

  saveProduct(values) {
    let product = {
        name: values.name, 
        color: values.color, 
        brand: values.brand, 
        model: values.model, 
        provider: values.provider, 
        categoryId: values.category._id
    }; 
    
    MeteorObservable.call('saveProduct', product).subscribe(
      (productId: string) => {
       let productPrice: ProductPrice = {
          createdAt: new Date(),
          active: true,
          cost: +values.cost, 

          priceCash: +values.cashPayment, 
          priceCard: +values.cashPayment, 
          productId: productId,
          storeId: ""  
        }; 

        let sizes:string[] = [];

        // for (let selector of values.sizesSelector) {
        //   for (let sizeData of this.selectorSizesData) {
        //     if (sizeData.id == selector) {
        //       sizes.push(sizeData.name)
        //     }
        //   }
        // }

        var selectedSizes = this.selectorSizesData.filter(sizesData => {
          return values.sizesSelector.indexOf(sizesData.id) !== -1;
        });
          
        //   if (selector) {
        //     sizes.push(selector.name)
        //   }
        // }        
        //   console.log(JSON.stringify(values.sizesSelector));
        //   console.log(JSON.stringify(sizes));

        let storeIds:string[] = [];
        this.allStores.subscribe((stores) => {
          storeIds = stores.map((store) => { return store._id });
        });
        this.saveSizesForAllStocks(
          productId, 
          _.pluck(selectedSizes, 'name'),
           storeIds);
        
        this.savePriceForAllStores(productPrice, storeIds);

        Bert.alert('Se agrego el producto: ' + productId , 'success', 'growl-top-right' ); 
      }, (error) => {
        Bert.alert('Error al guardar el producto:  ${error} ', 'danger', 'growl-top-right' ); 
    });
  }
 
  savePriceForAllStores(producPrice: ProductPrice, storeIds: string[]) {
    MeteorObservable.call('savePricesForStores', producPrice, storeIds).subscribe(
      (productPriceIds) => {
      Bert.alert('Se agregaron los precios: ' + JSON.stringify(productPriceIds)
         + 'para las sucursales' + JSON.stringify(storeIds), 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al guardar los precios: ' +  error, 'danger', 'growl-top-right' );
    });
  }

  saveSizesForAllStocks(productId, sizes: string[], storeIds: string[]) {
    MeteorObservable.call('saveProductSizes', productId, sizes).subscribe(
      (productSizeIds) => {
      Bert.alert('Se agregaron los talles: ' + JSON.stringify(sizes), 'success', 'growl-top-right' ); 
      this.saveStocks(productSizeIds, storeIds);
    }, (error) => {
      Bert.alert('Error al guardar los talles: ' +  error, 'danger', 'growl-top-right' ); 
    });
  }
  
  saveStocks(productSizeIds, storeIds) {
    MeteorObservable.call('bulkSaveStockForStores', productSizeIds, storeIds, 0).subscribe(
      (stockIds) => {
       Bert.alert('Se agregaron los stocks: ' + JSON.stringify(stockIds)
         + 'para las sucursales' + JSON.stringify(storeIds), 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al guardar el stock: ' +  error, 'danger', 'growl-top-right' ); 
    });  
  }

}
