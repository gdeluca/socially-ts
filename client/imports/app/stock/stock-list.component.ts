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
import { ProductSizes } from '../../../../both/collections/product-sizes.collection';
import { Stocks } from '../../../../both/collections/stocks.collection';
import { Products } from '../../../../both/collections/products.collection';
import { Categories } from '../../../../both/collections/categories.collection';
import { Sections } from '../../../../both/collections/sections.collection';
import { Stores } from '../../../../both/collections/stores.collection';

// model 
import { ProductSize } from '../../../../both/models/product-size.model';
import { Stock } from '../../../../both/models/stock.model';
import { Product } from '../../../../both/models/product.model';
import { Category } from '../../../../both/models/category.model';
import { Section } from '../../../../both/models/section.model';
import { Store } from '../../../../both/models/store.model';

import { Dictionary } from '../../../../both/models/dictionary';

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

  stocks: Observable<Stock[]>;
  productSizes: Observable<ProductSize[]>;
  products: Observable<Product[]>;
  categories: Observable<Category[]>;
  stores: Observable<Store[]>;

  allCategories: Observable<Category[]>;
  allSections: Observable<Section[]>;


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
      cost:        ['', Validators.required],
      cashPayment: ['', Validators.required],
      cardPayment: ['', Validators.required],
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
      this.paginatedSub = MeteorObservable.subscribe('stocks', options, filters)
        .subscribe(() => {
          this.stocks = Stocks.find({}).zone();
          this.productSizes = ProductSizes.find({}).zone();
          this.products = Products.find({}).zone();
          this.categories = Categories.find({}).zone();

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
        this.stores = Stores.find({}).zone();
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
      this.collectionCount = Counts.get('numberOfStocks');
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
            storeId: stock.storeId, 
            quantity: stock.quantity,
            priceCash: stock.priceCash,
            priceCard: stock.priceCard,
            rateCash: stock.rateCash,
            rateCard: stock.rateCard,
            lastCostPrice: stock.lastCostPrice
          }
        });
      }
    }
    editedStock = this.copy(this.emptyStock);
  }

  save(form: FormGroup){
    if (!Meteor.userId()) {
      alert('Ingrese al sistema para poder guardar');
      return;
    } 

    if (form.valid) {
      let values = form.value;      
      // find a product
      let product = Products.findOne({barCode: values.barCode});
      console.log('found product', product);
      if (product) {
          // if exists update the product information
         Products.update(product._id, {
          $set: { 
            name: values.name,
            color: values.color,
            provider: values.provider,
            categoryId: values.category._id
          }
        })

        // update or insert the product size information
        let productSizeId = '';

          console.log('looking for productSize with ', {productId: product._id, size: values.size});
        let productSize = ProductSizes.findOne({productId: product._id, size: values.size});
        if (productSize) {
          console.log('productSize found', productSize);
          productSizeId = productSize._id;
        } else {
          productSizeId = ProductSizes.collection.insert({productId: product._id, size: values.size});
          console.log('productSize created', productSize);
        }

        let stores = Stores.find({}).fetch();

        // update or insert the stocks related to all the stores
        stores.forEach(function(store: Store){
          let stock = Stocks.findOne({productSizeId: productSizeId, storeId: store._id, active: true}); 
          if (stock) { 
            console.log('stock found', stock);
            Stocks.update(stock._id, {
              $set: { 
                lastCostPrice: +values.cost,
                priceCash: +values.cashPayment,
                priceCard: +values.cardPayment,
                rateCash: (+values.cashPayment/(+values.cost))*100,
                rateCard: (+values.cardPayment/(+values.cost))*100,
              }
           })
          } else {
            console.log('stock inserting ');
            Stocks.insert({
              quantity: 0,
              lastCostPrice: +values.cost,
              priceCash: +values.cashPayment,
              priceCard: +values.cardPayment,
              rateCash: (+values.cashPayment/(+values.cost))*100,
              rateCard: (+values.cardPayment/(+values.cost))*100,
              storeId: store._id,
              active: true,
              productSizeId: productSizeId
            })
          }
        }) 

      // if the product is missed create a new one
      } else {
        let productId = Products.collection.insert({
          barCode: values.barCode,
          name: values.name,
          color: values.color,
          brand: values.brand,
          model: values.model,
          provider: values.provider,
          categoryId: values.category._id
        });

        // insert the product size information
        let productSizeId = ProductSizes.collection.insert({productId: productId, size: values.size});
        
        let stores = Stores.find({}).fetch();

        // insert the stocks related to all the stores
        stores.forEach(function(store: Store){
          Stocks.insert({
            quantity: 0,
            lastCostPrice: +values.cost,
            priceCash: +values.cashPayment,
            priceCard: +values.cardPayment,
            rateCash: (+values.cashPayment/(+values.cost))*100,
            rateCard: (+values.cardPayment/(+values.cost))*100,
            storeId: store._id,
            active: true,
            productSizeId: productSizeId
          })
        })
      }
      
      this.complexForm.reset();
    }
  }

  copy(original: any){
    return Object.assign({}, original)
  }

  /* update edited stock model */
  updateEditedStock(editedStock: any, stock:Stock, storeId:string, quantity:number){
    if (quantity) {
      editedStock.quantity.push(
        {
          stockId: stock._id, 
          storeId: storeId, 
          quantity: quantity,
          priceCash: stock.priceCash,
          priceCard: stock.priceCard,
          rateCash: stock.rateCash,
          rateCard: stock.rateCard,
          lastCostPrice: stock.lastCostPrice
        }
      );
    }
    // console.log(editedStock);
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
 
