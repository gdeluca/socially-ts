
// angular
import { Component, OnInit, OnDestroy, Injectable, Inject, NgModule } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, CanActivate } from '@angular/router';

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
import { Balances } from '../../../../both/collections/balances.collection';
import { Categories } from '../../../../both/collections/categories.collection';
import { Counters } from '../../../../both/collections/counters.collection';
import { UserStores } from '../../../../both/collections/user-stores.collection';
import { ProductPurchases } from '../../../../both/collections/product-purchases.collection';
import { ProductSales } from '../../../../both/collections/product-sales.collection';
import { ProductSizes } from '../../../../both/collections/product-sizes.collection';
import { Products } from '../../../../both/collections/products.collection';
import { Purchases } from '../../../../both/collections/purchases.collection';
import { Sales } from '../../../../both/collections/sales.collection';
import { Sections } from '../../../../both/collections/sections.collection';
import { Stocks } from '../../../../both/collections/stocks.collection';
import { Stores } from '../../../../both/collections/stores.collection';
import { Tags } from '../../../../both/collections/tags.collection';
import { Users } from '../../../../both/collections/users.collection';

// model 
import { Balance } from '../../../../both/models/balance.model';
import { Category } from '../../../../both/models/category.model';
import { Counter } from '../../../../both/models/counter.model';
import { UserStore } from '../../../../both/models/user-store.model';
import { ProductPurchase } from '../../../../both/models/product-purchase.model';
import { ProductSale } from '../../../../both/models/product-sale.model';
import { ProductSize } from '../../../../both/models/product-size.model';
import { Product } from '../../../../both/models/product.model';
import { Purchase } from '../../../../both/models/purchase.model';
import { Sale } from '../../../../both/models/sale.model';
import { Section } from '../../../../both/models/section.model';
import { Stock } from '../../../../both/models/stock.model';
import { Store } from '../../../../both/models/store.model';
import { Tag } from '../../../../both/models/tag.model';
import { User } from '../../../../both/models/user.model';

import { Dictionary } from '../../../../both/models/dictionary';
import { isNumeric } from '../validators/validators';

import template from "./sale-details.component.html";
import style from "./sale-details.component.scss";

@Component({
  selector: "sale-details",
  template,
  styles: [ style ]
})
@InjectUser('user')
export class SaleDetailsComponent implements OnInit, OnDestroy {
 
  saleStatus = {
    'started': 'En Proceso', 
    'submitted': 'Finalizada', 
    'reserved': 'Mercadera Reservada o Señada', 
    'canceled': 'Cancelada',
  };

  salePayment = {
    'card': 'Contado', 
    'cash': 'Tarjeta', 
    'account': 'Cuenta', 
  };
  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Codigo', 'value':'code'},
    {'key': 'Descripcion', 'value': 'description'},
    {'key': 'Color', 'value':'color'},
    {'key': 'Talle', 'value':'size'},
    {'key': 'Marca', 'value':'brand'},
    {'key': 'Modelo', 'value':'model'},
    {'key': 'Precio', 'value':'price'},
    {'key': 'DOWN', 'value':''},
    {'key': 'Cantidad', 'value':'amount'},
    {'key': 'UP', 'value':''},
    {'key': 'SubTotal', 'value':'subTotal'},
  ];

getSaleStatus(value){
  return this.saleStatus[value];
}
  paymentForm: number = 1;
  productAmounts: number[] = [];
  productSubTotals: number[] = [];
  saleNumber: number;
  total: number = 0;

  paramsSub: Subscription;
  saleSub: Subscription;

  user: Meteor.User;
  sale: Sale;
  productSales: Observable<ProductSale[]>;
  productSizes: Observable<ProductSize[]>;
  products: Observable<Product[]>;
  userStore: UserStore;
  store: Store;
  stocks: Observable<Stock[]>;

 constructor(
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {
    
  }

  ngOnInit() {
    // console.log('init sale details subscribers');
    this.paramsSub = this.activeRoute.params
      .map(params => params['saleNumber'])
      .subscribe(saleNumber => {
        this.saleNumber = saleNumber
        
        if (this.saleSub) {
          // console.log('unsuscribe sale sub');
          this.saleSub.unsubscribe();
        }
 
        this.saleSub = MeteorObservable.subscribe('sales', this.saleNumber).subscribe(() => {
          MeteorObservable.autorun().subscribe(() => {
            // console.log('getting subscriber data');

            this.sale = Sales.findOne({saleNumber:this.saleNumber});
            this.productSales = ProductSales.find({}).zone();
            this.productSizes = ProductSizes.find({}).zone();
            this.products = Products.find({}).zone();
            this.userStore = UserStores.findOne();
            this.store = Stores.findOne({});
            this.stocks = Stocks.find({}).zone();
          });
        });

      });
  }

  ngOnDestroy() {
    // console.log('destroy party details subscribers');
    this.paramsSub.unsubscribe();
    this.saleSub.unsubscribe();
  }

  addProduct(code){
    // search the product by code and add it to the table 
  }
   
   getUserName(){
    return "";// return Meteor.userId().username;
   }
  getProductAmount(index) {
    if (this.productAmounts[index] === undefined){
      this.productAmounts[index] = 1;
    }
    return this.productAmounts[index];
  }

  calculateSubTotal(index, stock) {
    this.productSubTotals[index] = 
      this.getPrice(stock) * this.getProductAmount(index);
    return this.productSubTotals[index];
  }

  getTotal(){
    var total = 0;
        //console.log(this.productSubTotals);
    if (this.productSubTotals.length > 0) {
      for (let subTotal of this.productSubTotals) {
        total += subTotal;
      }
    }
    return total;
  }

  getPrice(stock){
    if (this.paymentForm == 1) {
      return stock.priceCash;
    } else {
      return stock.priceCard;
    }
  }
  
  increaseAmount(index, stock) {
    if (stock.quantity - this.productAmounts[index] > 0) {
      this.productAmounts[index] +=1;
    }
  }

  decreaseAmount(index) {
    if (this.productAmounts[index] > 1) {
      this.productAmounts[index] -=1;
    }
  }

  remove(product){

  }

  cancelSale(){}

  doLog(){
    // console.log(this.paymentForm);
  }
}
