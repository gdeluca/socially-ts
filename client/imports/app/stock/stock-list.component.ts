// angular
import { Component, OnInit, OnDestroy, Injectable, Inject, NgModule } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';

// reactiveX
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishLast';


import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/search/search-options';

// collections
import { ProductSizes, getMappingSize } from '../../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../../both/collections/product-prices.collection';
import { Stocks } from '../../../../both/collections/stocks.collection';
import { Products } from '../../../../both/collections/products.collection';
import { Categories } from '../../../../both/collections/categories.collection';
import { Sections } from '../../../../both/collections/sections.collection';
import { Stores } from '../../../../both/collections/stores.collection';

// model 
import { ProductSize } from '../../../../both/models/product-size.model';
import { ProductPrice } from '../../../../both/models/product-price.model';
import { Stock } from '../../../../both/models/stock.model';
import { Product } from '../../../../both/models/product.model';
import { Category } from '../../../../both/models/category.model';
import { Section } from '../../../../both/models/section.model';
import { Store } from '../../../../both/models/store.model';

import { Dictionary } from '../../../../both/models/dictionary';
import { isNumeric } from '../validators/validators';

import template from "./stock-list.component.html";
import style from "./stock-list.component.scss";

@Component({
  selector: "stock-list",
  template,
  styles: [ style ]
})
@InjectUser('user')
export class StockListComponent implements OnInit, OnDestroy {
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filters: Subject<any> = new Subject<any>();

  filtersParams: any = {
    'barCode': '',
    'name':  '',
    'color': '',
    'size': '',
    'provider': '',
    'cost': '',
    'cashPayment': '',
    'cardPayment': '',
    'categoryId': '',
    'sectionId': ''
  };

  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Codigo', 'value':'barCode'},
    {'key': 'Descripcion', 'value': 'name'},
    {'key': 'Color', 'value':'color'},
    {'key': 'Talle', 'value':'size'},
    {'key': 'Proveedor', 'value':'provider'},
    {'key': 'Costo', 'value':'cost'},
    {'key': 'Contado', 'value':'cashPayment'},
    {'key': 'Tarjeta', 'value':'cardPayment'},
  ];

  collectionCount: number = 0;
  PAGESIZE: number = 15;  
  
  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;
  categoriesSub: Subscription;
  sectionsSub: Subscription;
  storesSub: Subscription;

  user: Meteor.User;
  emptyStock: any = 
    {
      barCode:'', 
      name:'', 
      color:'', 
      size:'', 
      provider:'', 
      quantity:[{stockId:'', storeId:'', quantity:'', priceCash:'', priceCard:'', lastCostPrice:''}]
    };

  editedStock: any;
  editing: boolean = false;
  selectedCategory: Category;

  productSizes: Observable<ProductSize[]>;
  stocks: Observable<Stock[]>;
  stores: Observable<Store[]>;
  products: Observable<Product[]>;
  productPrices: Observable<ProductPrice[]>;
  categories: Observable<Category[]>; 

  allCategories: Observable<Category[]>;
  allSections: Observable<Section[]>;
  allStores: Observable<Store[]>;


  complexForm : FormGroup;

  constructor(
    private paginationService: PaginationService, 
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
    this.optionsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.sortDirection,
      this.sortField,
      this.filters
    ).subscribe(([pageSize, curPage, sortDirection, sortField, filters]) => {
      const options: SearchOptions = {
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number),
        sort: { [sortField as string] : sortDirection as number }
      };
      
      this.paginationService.setCurrentPage(this.paginationService.defaultId() , curPage as number);

      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }
      this.paginatedSub = MeteorObservable.subscribe('productsSize-stock', options, filters)
        .subscribe(() => {
          this.productSizes = ProductSizes.find({}).zone();
          this.stocks = Stocks.find({}).zone();
          this.stores = Stores.find({}).zone();
          this.products = Products.find({}).zone();
          this.productPrices = ProductPrices.find({}).zone();
      });

    });

    if (this.sectionsSub) {
      this.sectionsSub.unsubscribe();
    } 
    this.sectionsSub = MeteorObservable.subscribe('sections')
      .subscribe(() => {
        this.allSections = Sections.find({}).zone();
    });

    if (this.storesSub) {
      this.storesSub.unsubscribe();
    } 
    this.storesSub = MeteorObservable.subscribe('stores')
      .subscribe(() => {
        this.allStores = Stores.find({}).zone();
    });

    if (this.categoriesSub) {
      this.categoriesSub.unsubscribe();
    } 
    this.categoriesSub = MeteorObservable.subscribe('categories')
      .subscribe(() => {
        this.allCategories = Categories.find({}).zone();
    });


    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortField.next('barCode');
    this.sortDirection.next(1);
    this.filters.next('');

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfProductSizes');
      this.paginationService.setTotalItems(this.paginationService.defaultId(), this.collectionCount);
    });

    this.paginationService.register({
      id: this.paginationService.defaultId(),
      itemsPerPage: this.PAGESIZE,
      currentPage: 1,
      totalItems: this.collectionCount,
    });

  }
  
  ngOnDestroy() {
    this.paginatedSub.unsubscribe();
    this.optionsSub.unsubscribe(); 
    this.autorunSub.unsubscribe();
    this.sectionsSub.unsubscribe();
    this.categoriesSub.unsubscribe();
    this.storesSub.unsubscribe();
  } 

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }

  /* save values to database */
  update = function(editedStock){
    for (let stock of editedStock.quantity) {

      if (stock.quantity && stock.stockId) {
        Stocks.update(stock.stockId, {
          $set: { 
            quantity: stock.quantity,
          }
        });
      }
      // do something
    }

    // clean after insert
    editedStock = this.copy(this.emptyStock);
  }

  save(form: FormGroup){
    if (!Meteor.userId()) {
      alert('Ingrese al sistema para poder guardar');
      return;
    } 
    if (form.valid) {
      let values = form.value;

      // last two characters are reserved for product size
      let productCode =  values.barCode.substring(0, 10);
      let size = values.size.toUpperCase();
      let barCode = productCode + getMappingSize(values.size);

      console.log('looking for product with code: ', productCode);
      // find a product
      let product = Products.findOne({code: productCode});
      if (product) {
          // if exists update the product information
        Products.update(product._id, {
            $set: { 
              name: values.name,
              color: values.color,
              provider: values.provider,
              categoryId: values.category._id
            }
        });
        console.log('product updated', JSON.stringify(product))

        // find or insert the product size information
        console.log('looking for productSize with: ', {productId: product._id, size: size});
        let productSize = ProductSizes.findOne(
          {productId: product._id, size: size, barCode: barCode}
        );
        let productSizeId = '';
        if (productSize) {
          console.log('productSize found', JSON.stringify(productSize));
          productSizeId = productSize._id;
        } else {
          productSizeId = ProductSizes.collection.insert(
            {productId: product._id, size: size, barCode: barCode}
          );
          console.log('productSize created, new id is:', productSizeId)
        }

        let stores = Stores.find({}).fetch();

        stores.forEach(function(store: Store){
          
          // update or insert the stocks for each stores
          let stock = Stocks.findOne(
            {productSizeId: productSizeId, storeId: store._id, active: true}
          ); 
          if (stock) { 
            console.log('stock found, nothing to do', JSON.stringify(stock));
          } else {
            Stocks.insert({
              quantity: 0,
              storeId: store._id,
              active: true,
              productSizeId: productSizeId
            })
            console.log('stock created', JSON.stringify(stock));
          }

          // update or insert the productprices for each stores 
          let productPrice = ProductPrices.findOne(
            {productId: product._id, storeId: store._id}
          );
          if (productPrice) { 
            ProductPrices.update(stock._id, {
              $set: { 
                lastCostPrice: +values.cost,
                priceCash: +values.cashPayment,
                priceCard: +values.cardPayment,
                rateCash: (+values.cashPayment/(+values.cost))*100,
                rateCard: (+values.cardPayment/(+values.cost))*100,
              }
            })
            console.log('productPrice updated: ', JSON.stringify(productPrice));
          } else {
            let productPriceId = ProductPrices.insert({
              lastCostPrice: +values.cost,
              priceCash: +values.cashPayment,
              priceCard: +values.cardPayment,
              rateCash: (+values.cashPayment/(+values.cost))*100,
              rateCard: (+values.cardPayment/(+values.cost))*100,
              storeId: store._id,
              productId: product._id
            })
            console.log('productPrice created: ', productPriceId);
          }
        });

      } else {
        // the product is missed, create a new one
        let productId = Products.collection.insert({
          code: productCode,
          name: values.name,
          color: values.color,
          brand: values.brand,
          model: values.model,
          provider: values.provider,
          categoryId: values.category._id
        });
        console.log('product created with id: ', productId)

        // insert the product size information
        let productSizeId = ProductSizes.collection.insert(
            {productId: productId, size: size, barCode: barCode}
        );
        
        let stores = Stores.find({}).fetch();

        // insert the stocks related to all the stores
        stores.forEach(function(store: Store){
          console.log('inseting stock for store: ',store);

          Stocks.insert({
            quantity: 0,
            storeId: store._id,
            active: true,
            productSizeId: productSizeId
          });
          console.log('stock created');

          ProductPrices.insert({
            lastCostPrice: +values.cost,
            priceCash: +values.cashPayment,
            priceCard: +values.cardPayment,
            rateCash: (+values.cashPayment/(+values.cost))*100,
            rateCard: (+values.cardPayment/(+values.cost))*100,
            storeId: store._id,
            productId: productId
          })
          console.log('productPrice created');
        })
      }
      
      this.complexForm.reset();
    }
  }

  copy(original: any){
    return Object.assign({}, original)
  }

  updateEditedStock(editedStock: any, id: string, quantity: number) {
    if (quantity) {
      editedStock.quantity.push(
        {
          stockId: id, 
          quantity: quantity,
        }
      );
    }
  }

  
  changeSortOrder(direction: string, fieldName: string): void {
    this.sortDirection.next(parseInt(direction));
    this.sortField.next(fieldName);
  }

  search(field: string, value: string): void {
    console.log(value);
    // no value change on blur
    if (this.filtersParams[field] === value) {
      return;
    }
    this.filtersParams[field] = value

    this.curPage.next(1);
    this.filters.next(this.filtersParams);
  }

}
 
