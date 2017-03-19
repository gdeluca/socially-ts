
// angular
import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Injectable, Inject, NgModule, Input, Output, EventEmitter  } from '@angular/core';
// import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, CanActivate } from '@angular/router';

import { InjectUser } from "angular2-meteor-accounts-ui";
// import { PaginationService } from 'ng2-pagination';
 import { Bert } from 'meteor/themeteorchef:bert';
 
// reactiveX
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
// import 'rxjs/add/operator/combineLatest';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/publishLast';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/search/search-options';

// collections
// import { Counters } from '../../../../both/collections/counters.collection';
import { ProductPurchases } from '../../../../both/collections/product-purchases.collection';
import { ProductSales } from '../../../../both/collections/product-sales.collection';
import { ProductSizes } from '../../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../../both/collections/product-prices.collection';
import { Products } from '../../../../both/collections/products.collection';
import { Purchases, purchasesStatusMapping } from '../../../../both/collections/purchases.collection';
import { Stocks } from '../../../../both/collections/stocks.collection';
import { Stores } from '../../../../both/collections/stores.collection';
import { Tags } from '../../../../both/collections/tags.collection';
import { Users } from '../../../../both/collections/users.collection';

// model 
// import { Counter } from '../../../../both/models/counter.model';
import { ProductPurchase } from '../../../../both/models/product-purchase.model';
import { ProductSale } from '../../../../both/models/product-sale.model';
import { ProductSize } from '../../../../both/models/product-size.model';
import { ProductPrice } from '../../../../both/models/product-price.model';
import { Product } from '../../../../both/models/product.model';
import { Purchase } from '../../../../both/models/purchase.model';
import { Stock } from '../../../../both/models/stock.model';
import { Store } from '../../../../both/models/store.model';
import { Tag } from '../../../../both/models/tag.model';
import { User } from '../../../../both/models/user.model';

import { Dictionary } from '../../../../both/models/dictionary';
import { isNumeric } from '../../validators/validators';

import * as moment from 'moment';
import 'moment/locale/es';

import template from "./purchase-order.component.html";
import style from "./purchase-order.component.scss";

@Component({
  selector: "order-details",
  template,
  styles: [ style ] 
})
@InjectUser('currentUser')
export class PurchaseOrderComponent implements OnInit, OnDestroy {
 
  orderStatus = purchasesStatusMapping; // from Purchases;
   
  // name <-> sortfield, touple
  productsHeaders: Dictionary[] = [
    {'key': 'Codigo', 'value':'code'},
    {'key': 'Descripcion', 'value': 'description'},
    {'key': 'Color', 'value':'color'},
    {'key': 'Marca', 'value':'brand'},
    {'key': 'Modelo', 'value':'model'},
    {'key': 'Precio Costo', 'value':'cost'},
  ];

  // name <-> sortfield, touple
  orderHeaders: Dictionary[] = [
    {'key': 'Codigo', 'value':'code'},
    {'key': 'Descripcion', 'value': 'description'},
    {'key': 'Color', 'value':'color'},
    {'key': 'Marca', 'value':'brand'},
    {'key': 'Modelo', 'value':'model'},
    {'key': 'Precio Costo', 'value':'cost'},
    {'key': 'En stock', 'value':'totalStock'},

  ];

  // paymentForm: number = 1;
  // quantityTracker: number[] = [];
  // productSubTotals: number[] = [];
  orderNumber: number;
  // total: number = 0;

  // selectedProductSizeBarCode: string;
  // selectedProductAmount: number = 1;

  paramsSub: Subscription;
  storesSub: Subscription;
  purchaseSub: Subscription;
  providersSub: Subscription;
  productsProviderSub: Subscription;

  currentUser: User;

  // related to current purchase
  purchase: Purchase;
  productPurchases: Observable<ProductPurchase[]>;
  productSizes: Observable<ProductSize[]>;
  stocks: Observable<Stock[]>;
  products: Observable<Product[]>;
  productPrices: Observable<ProductPrice[]>;
  
  allStores: Observable<Store[]>;
  allProviders: Observable<Tag[]>;
  
  // related to provider products
  providerProductsSizes: Observable<ProductSize[]>;
  // providerStocks: Observable<Stock[]>;
  providerProducts: Observable<Product[]>;
  providerProductPrices: Observable<ProductPrice[]>;

  selectedProvider: string ;
  lockProvider: boolean =false;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute
    )  {}

  ngOnInit() {
    this.paramsSub = this.activeRoute.params
      .map(params => params['orderNumber'])
      .subscribe(orderNumber => {
        this.orderNumber = orderNumber

      this.registerPurchaseOrderProducts();

      if (this.storesSub) { 
        this.storesSub.unsubscribe();
      }
      this.storesSub = MeteorObservable.subscribe('stores').subscribe(() => {
        this.allStores = Stores.find({}).zone();
      });

      if (this.providersSub) { 
        this.providersSub.unsubscribe();
      }
      this.providersSub = MeteorObservable.subscribe('tags.provider').subscribe(() => {
        this.allProviders = Tags.find({type: 'provider'}).zone();
      });

    });
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
    this.purchaseSub.unsubscribe();
    this.storesSub.unsubscribe();
    this.providersSub.unsubscribe();
    if (this.productsProviderSub) {
        this.productsProviderSub.unsubscribe();
    }
  }

  findProductSizes(productPurchasesObs: Observable<ProductPurchase[]>): Observable<ProductSize[]> {
    let ids: string[] = [];
    productPurchasesObs.mergeMap(productPurchases => {
      return productPurchases.map(productPurchase => {
        return productPurchase.productSizeId})})
      .subscribe(res => {
        ids.push(res); 
        console.log(res)
      });
      console.log("productSize ids:" ,ids);
       
      // ProductSizes.find(
      //   {_id: { $in: ids }}
      // ).subscribe((es)=>{
      //   console.log(JSON.stringify(es))
      // });
    return ProductSizes.find({_id: { $in: ids }});
  }

  findProducts(productSizesObs: Observable<ProductSize[]>): Observable<Product[]> {
    let ids: string[] = [];

    productSizesObs.mergeMap(productSizes => {
      return productSizes.map(productSize => {
        return productSize.productId})})
      .subscribe(res => {
        ids.push(res); 
        console.log("product ids:" ,ids);
      });

      // Products.find(
      //   {_id: { $in: ids }}
      // ).subscribe((es)=>{
      //   console.log(JSON.stringify(es))
      // });
    return Products.find({_id: { $in: ids }});
  } 

  registerPurchaseOrderProducts() {
    if (this.purchaseSub) {
      this.purchaseSub.unsubscribe();
    } 
    this.lockProvider=false;

    this.purchaseSub = MeteorObservable.subscribe('purchase-orders', this.orderNumber).subscribe(() => {
      this.purchase = Purchases.findOne({purchaseNumber: this.orderNumber});
      this.productPurchases = ProductPurchases.find({ purchaseId: this.purchase._id }).zone();
      this.productSizes = this.findProductSizes(this.productPurchases);
      this.products = this.findProducts(this.productSizes).zone();
      this.stocks = Stocks.find({}).zone();
      this.productPrices = ProductPrices.find({}).zone();

      // console.log('purchase number', this.orderNumber);
      // console.log('purchase provider', this.purchase.provider);
      // console.log(this.selectedProvider);
      if (this.purchase.provider && this.purchase.provider != 'none') {
        this.selectedProvider = this.purchase.provider;
        this.registerProviderProducts(this.selectedProvider);
      }
    });  
  }

  registerProviderProducts(provider) {
    if (this.productsProviderSub) {
        this.productsProviderSub.unsubscribe();
    } 
    
    if (provider && provider != 'none') {
      this.lockProvider=true;
      this.selectedProvider = provider;
    } else {
      this.lockProvider=false;
      this.selectedProvider = null;
    }

    this.productsProviderSub = MeteorObservable.subscribe('products-stock')
      .subscribe(() => {
        this.providerProducts = Products.find(
          {provider: this.selectedProvider}).zone();
        this.providerProductsSizes = ProductSizes.find({}).zone();
        this.providerProductPrices = ProductPrices.find({}).zone();
    }); 

  } 
  
  getOrderStatus(value){
    return this.orderStatus[value];
  }

  getCost(product) {
    let productPrice = ProductPrices.findOne({productId:product._id});
     return (productPrice)?productPrice.lastCostPrice:0;
  }

  getProductSizeIds(product) {
    let productSize = ProductSizes.find({productId:product._id}, {fields: {}});
    return (productSize)?productSize.fetch().map(x => {return x._id}):'';
  }

  getTotalStock(product: Product) {
    let productSize = ProductSizes.find({productId: product._id}, {fields: {_id: 1}});
    if (productSize) {
      let sizesIds = productSize.fetch().map(x => {return x._id});
      return Stocks.find({productSizeId: { $in: sizesIds }}, {fields: {quantity: 1}})
        .fetch()
        .reduce((a, b) => a + b.quantity, 0);
    } else { 
      return 0;
    }
  }

  matchingProduct(productObs: Observable<Product[]>, source: Product): Product {
    let result:Product;

    productObs.subscribe((products)=>{
      console.log('looking into : ' + JSON.stringify(products));
      let match =  products.filter((product: Product) => product._id == source._id);
      console.log('match found: ' + JSON.stringify(match));
      if (match.length > 0){
       result = match[0];
      }
    }) 
    return result;
  }
   
  isProductSelected(providerProduct: Product): boolean {
    // console.log('check selected for: ' + JSON.stringify(providerProduct));
   
      this.products.subscribe((es)=>{
         console.log(JSON.stringify(es))
       });
    let selected = this.matchingProduct(this.products, providerProduct);
    console.log('selected = ' + JSON.stringify(selected));
    return (selected != undefined);
  }

  getProductPurchaseTotal(product){ 
    // console.log(JSON.stringify(product));
  }

  updatePurchaseProvider(provider){
    console.log('purchase updated with provider', provider);
    MeteorObservable.call('updatePurchaseOrder', 
      this.purchase._id,
      'loaded',
      null,
      moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      provider,
      null,
      null,
    ).subscribe(
      () => {
      Bert.alert('Se actualizo el producto', 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al guardar: ' +  error, 'danger', 'growl-top-right' ); 
    });

    this.registerProviderProducts(provider);
  }
  updateProductPurchase(product, value){
    // console.log(JSON.stringify(product));
    // console.log(JSON.stringify(value));
  } 

  addToPurchaseList(product){
    // console.log(this.purchase._id, product._id, this.getSizes(product), this.getCost(product));
    MeteorObservable.call('saveProductSizesPurchase', 
      this.purchase._id, 
      product._id,
      this.getProductSizeIds(product),
      this.getCost(product),
      0
    ).subscribe(
      () => {
      Bert.alert('Se agrego el producto a la lista', 'success', 'growl-top-right' ); 
    
      // TODO: investigate why changes are not propagate automatically 
      this.productSizes = this.findProductSizes(this.productPurchases).zone();
      this.products = this.findProducts(this.productSizes).zone();
    
    }, (error) => {
      Bert.alert('Error al guardar: ' +  error, 'danger', 'growl-top-right' ); 
    });
  }

   removeFormPurchaseList(product){
    // console.log(this.purchase._id, product._id, this.getSizes(product), this.getCost(product));
    MeteorObservable.call('removeProductSizesPurchase', 
      this.purchase._id, 
      this.getProductSizeIds(product)
    ).subscribe(
      () => {
      Bert.alert('Se quito el producto de la lista', 'success', 'growl-top-right' ); 
    
      // TODO: investigate why changes are not propagate automatically 
      this.productSizes = this.findProductSizes(this.productPurchases).zone();
      this.products = this.findProducts(this.productSizes).zone();
    
    }, (error) => {
      Bert.alert('Error al guardar: ' +  error, 'danger', 'growl-top-right' ); 
    });
  }

}
