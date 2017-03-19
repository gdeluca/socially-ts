
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
// import { Balances } from '../../../../both/collections/balances.collection';
// import { Categories } from '../../../../both/collections/categories.collection';
// import { Counters } from '../../../../both/collections/counters.collection';
import { UserStores } from '../../../../both/collections/user-stores.collection';
// import { ProductPurchases } from '../../../../both/collections/product-purchases.collection';
import { ProductSales } from '../../../../both/collections/product-sales.collection';
import { ProductSizes } from '../../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../../both/collections/product-prices.collection';
import { Products } from '../../../../both/collections/products.collection';
// import { Purchases, purchasesStatusMapping } from '../../../../both/collections/purchases.collection';
import { Sales, salesStatusMapping, salePaymentMapping, workShiftMapping } from '../../../../both/collections/sales.collection';
// import { Sections } from '../../../../both/collections/sections.collection';
import { Stocks } from '../../../../both/collections/stocks.collection';
import { Stores } from '../../../../both/collections/stores.collection';
// import { Tags } from '../../../../both/collections/tags.collection';
import { Users } from '../../../../both/collections/users.collection';

// model 
// import { Balance } from '../../../../both/models/balance.model';
// import { Category } from '../../../../both/models/category.model';
// import { Counter } from '../../../../both/models/counter.model';
import { UserStore } from '../../../../both/models/user-store.model';
// import { ProductPurchase } from '../../../../both/models/product-purchase.model';
import { ProductSale } from '../../../../both/models/product-sale.model';
import { ProductSize } from '../../../../both/models/product-size.model';
import { ProductPrice } from '../../../../both/models/product-price.model';
import { Product } from '../../../../both/models/product.model';
// import { Purchase } from '../../../../both/models/purchase.model';
import { Sale } from '../../../../both/models/sale.model';
// import { Section } from '../../../../both/models/section.model';
import { Stock } from '../../../../both/models/stock.model';
import { Store } from '../../../../both/models/store.model';
// import { Tag } from '../../../../both/models/tag.model';
import { User } from '../../../../both/models/user.model';

import { Dictionary } from '../../../../both/models/dictionary';
import { isNumeric } from '../../validators/validators';

import template from "./sale-order.component.html";
import style from "./sale-order.component.scss";

import { ProductSearchComponent } from './product-search.component';

@Component({
  selector: "sale-details",
  template,
  styles: [ style ] 
})
@InjectUser('currentUser')
export class SaleOrderComponent implements OnInit, OnDestroy {
 
  orderStatus = salesStatusMapping; // from Sales;
  salePayment = salePaymentMapping;
  workShift = workShiftMapping;
   
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

  paymentForm: number = 1;
  quantityTracker: number[] = [];
  productSubTotals: number[] = [];
  orderNumber: number;
  total: number = 0;

  selectedProductSizeBarCode: string;
  selectedProductAmount: number = 1;

  paramsSub: Subscription;
  saleSub: Subscription;
  allStockSub: Subscription;

  currentUser: User;
  seller: User;
  sale: Sale;
  productSales: Observable<ProductSale[]>;
  productSizes: Observable<ProductSize[]>;
  productPrices: Observable<ProductPrice[]>;

  products: Observable<Product[]>;
  userStore: UserStore;
  store: Store;
  stocks: Observable<Stock[]>;
  allStocks: Observable<Stock[]>;

 constructor(
    private router: Router,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {

    // console.log('init sale details subscribers');
    this.paramsSub = this.activeRoute.params
      .map(params => params['orderNumber'])
      .subscribe(orderNumber => {
        this.orderNumber = orderNumber
        
        if (this.saleSub) {
          this.saleSub.unsubscribe();
        }
        this.saleSub = MeteorObservable.subscribe('sale-orders', this.orderNumber).subscribe(() => {
          // MeteorObservable.autorun().subscribe(() => {
            // console.log('getting subscriber data');

            this.sale = Sales.findOne({saleNumber:this.orderNumber});
            this.productSales = ProductSales.find({}).zone();
            this.productSizes = ProductSizes.find({}).zone();
            this.productPrices = ProductPrices.find({}).zone();
            this.products = Products.find({}).zone();
            this.userStore = UserStores.findOne();
            this.seller = Users.find({_id: this.userStore.userId}).fetch()[0];
            this.store = Stores.findOne({});
           // this.stocks = Stocks.find({}).zone();
          // });
        });
 

        if (this.allStockSub) { 
          this.allStockSub.unsubscribe();
        }
        this.allStockSub = MeteorObservable.subscribe('allStocks').subscribe(() => {
          this.stocks = Stocks.find({}).zone();
        });


      });
  }

  ngOnDestroy() {
    // console.log('destroy party details subscribers');
    this.paramsSub.unsubscribe();
    this.saleSub.unsubscribe();
    this.allStockSub.unsubscribe();
  }
  
  getOrderStatus(value){
    return this.orderStatus[value];
  }

  /** search the product by code and add it to the table  */
  addProduct() {

    let currentBarCode = this.selectedProductSizeBarCode;
    this.selectedProductSizeBarCode = "";
    let requestedQuantity = +this.selectedProductAmount;
    // attach this check to input box 
    if (!currentBarCode || currentBarCode.length != 12) {
      return;
    }

    console.log('entering add product');
    // get the productsize
    let productSize = ProductSizes.collection.find({
      barCode: currentBarCode
    }).fetch()[0];

    console.log('getting stock for product size:' + productSize._id);
    // check stock existence for the productSize
    let stockFetch = Stocks.collection.find({
      productSizeId: productSize._id, active:true, storeId: this.store._id
    }).fetch();

    console.log({
      productSizeId: productSize._id, active:true, storeId: this.store._id
    });
    // checkeo de consistencia
    if (stockFetch.length > 1) {
      Bert.alert('Entradas duplicadas para el stock activo del producto: ' 
        + currentBarCode + ' en la sucursal ' + this.store.name, 
        'warning', 'growl-top-right' ); 
      return;
    }

    if (stockFetch.length == 0) {
       Bert.alert( 'No se encuentra informacion del stock activo para producto: ' 
        + currentBarCode + ' en la sucursal ' + this.store.name, 
        'warning', 'growl-top-right' ); 
       return;
    }

    let stock = stockFetch[0];
    console.log('stock object :' + JSON.stringify(stock));
    if (stock.quantity < requestedQuantity) {
      Bert.alert(
        'La cantidad ingresada: ' + requestedQuantity 
        + 'es mayor a la disponible en stock: ' + stock.quantity 
        + ' para el producto seleccionado: ' + currentBarCode, 
        'warning', 'growl-top-right' ); 
      return;

    } else {
      let productSale = ProductSales.collection.find(
        {productSizeId: productSize._id, saleId: this.sale._id}
      ).fetch()[0];

      console.log('updating stock:' + stock._id);
      // update the stock, decrement the quantity field
      Stocks.update(
       {_id:stock._id},
       {$set:{quantity:stock.quantity-requestedQuantity}}
      );

      // if found the update(increase the quantity)
       console.log('current product sale:' + JSON.stringify(productSale));
      if (productSale) {
        console.log('updating current product sale:');
        ProductSales.update(
          {_id:productSale._id},
          {$set:{quantity:productSale.quantity+requestedQuantity}}
        );
      } else {
        // add a new one
        console.log('updating product sales');
        // update the produstsale, add the new productsize
        ProductSales.insert({
          productSizeId: productSize._id, 
          saleId: this.sale._id,
          quantity: requestedQuantity
        });

        Bert.alert('Producto agregado', 'success', 'growl-top-right'); 

      }
    }
  }
   
  setQuantityTracker(index, quantity) {
    this.quantityTracker[index] = quantity; 
    return this.quantityTracker[index];
  }

  calculateSubTotal(index, productPrice) {
    this.productSubTotals[index] = 
      this.getPrice(productPrice) * this.quantityTracker[index];
    return this.productSubTotals[index];
  }

  getTotal(){
    var total = 0;
    if (this.productSubTotals.length > 0) {
      for (let subTotal of this.productSubTotals) {
        total += subTotal;
      }
    }
    return total;
  }

  getPrice(productPrice){
    if (this.paymentForm == 1) {
      return productPrice.priceCash;
    } else {
      return productPrice.priceCard;
    }
  }

  checkLength(){
    if (this.selectedProductSizeBarCode.length == 12){
      this.addProduct();
    }
  }
  
  increaseAmount(index, stock) {
    if (stock.quantity - this.quantityTracker[index] > 0) {
      this.quantityTracker[index] +=1;
    }
  }

  decreaseAmount(index) {
    if (this.quantityTracker[index] > 1) {
      this.quantityTracker[index] -=1;
    }
  }

  removeFormList(product){
 
  }

  cancelSale(){
    
  }

  notifyProductFound(barCode:string) {
    this.selectedProductSizeBarCode = barCode;
    this.addProduct();
  }
}
