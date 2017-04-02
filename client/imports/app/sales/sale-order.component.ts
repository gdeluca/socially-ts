
// angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, CanActivate } from '@angular/router';

import { InjectUser } from "angular2-meteor-accounts-ui";
 
// reactiveX
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Subject } from 'rxjs/Subject';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/domain/search-options';

// // collections
import { UserStores } from '../../../../both/collections/user-stores.collection';
import { ProductSales } from '../../../../both/collections/product-sales.collection';
import { ProductSizes } from '../../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../../both/collections/product-prices.collection';
import { Products } from '../../../../both/collections/products.collection';
import { Sales, salesStatusMapping, salePaymentMapping, workShiftMapping } from '../../../../both/collections/sales.collection';
import { Stocks } from '../../../../both/collections/stocks.collection';
import { Stores } from '../../../../both/collections/stores.collection';
import { Users } from '../../../../both/collections/users.collection';

// // model 
import { UserStore } from '../../../../both/models/user-store.model';
import { ProductSale } from '../../../../both/models/product-sale.model';
import { ProductSize } from '../../../../both/models/product-size.model';
import { ProductPrice } from '../../../../both/models/product-price.model';
import { Product } from '../../../../both/models/product.model';
import { Sale } from '../../../../both/models/sale.model';
import { Stock } from '../../../../both/models/stock.model';
import { Store } from '../../../../both/models/store.model';
import { User } from '../../../../both/models/user.model';

import { Dictionary } from '../../../../both/domain/dictionary';
import * as _ from 'underscore';
import { Bert } from 'meteor/themeteorchef:bert';

import * as moment from 'moment';
import 'moment/locale/es';

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
 
  valuesMapping = salesStatusMapping;

  paymentMapping = salePaymentMapping;

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

  paymentForm = 'CASH';
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
    this.paramsSub = this.activeRoute.params
    .map(params => params['orderNumber'])
    .subscribe(orderNumber => {
      this.orderNumber = +orderNumber
      
      if (this.saleSub) {
        this.saleSub.unsubscribe();
      }
      this.saleSub = MeteorObservable.subscribe(
        'sale-orders', 
        this.orderNumber
      ).subscribe(() => {
        this.sale = Sales.findOne(
          {saleNumber:this.orderNumber});
        this.productSales = ProductSales.find({}).zone();
        this.productSizes = ProductSizes.find({}).zone();
        this.productPrices = ProductPrices.find({}).zone();
        this.products = Products.find({}).zone();
        this.userStore = UserStores.findOne();
        this.seller = Users.findOne(
          {_id: this.userStore.userId});
        this.store = Stores.findOne({});
      });

      if (this.allStockSub) { 
        this.allStockSub.unsubscribe();
      }
      this.allStockSub = MeteorObservable.subscribe('stocks').subscribe(() => {
        this.stocks = Stocks.find({}).zone();
      });

    });
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe();
    this.saleSub.unsubscribe();
    this.allStockSub.unsubscribe();
  }
 
  /** search the product by code and add it to the table  */
  addProductToOrder() {
    MeteorObservable.call(
      'addProductToOrder', 
      this.selectedProductSizeBarCode,
      this.selectedProductAmount,
      this.store._id,
      this.sale._id
    ).subscribe(() => { 
        Bert.alert('Producto agregado', 'success', 'growl-top-right'); 
        this.selectedProductSizeBarCode = "";
      }, (error) => { 
        Bert.alert('Fallo al agregar: ' + error, 'danger', 'growl-top-right'); 
      }
    ); 
  }
   
  setQuantityTracker(index, quantity) {
    this.quantityTracker[index] = quantity; 
    return this.quantityTracker[index];
  }

  calculateSubTotal(index, productPrice) {
    this.productSubTotals[index] = 
      this.getPrice(productPrice) * this.quantityTracker[index];
    console.log(this.getPrice(productPrice));
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

  getPrice(productPrice: ProductPrice){
    console.log(productPrice.priceCash);
    if (this.sale.payment == 'CASH') {
      return productPrice.priceCash;
    } else if (this.sale.payment == 'CARD' 
      || this.sale.payment == 'ACCOUNT') {
      return productPrice.priceCard;
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

  getCurrentStoreName(){
    let val = Session.get("currentStoreName"); 
    return (val != null)?val:'';
  }

  getCurrentStoreId(): string{
    let val = Session.get("currentStoreId"); 
    return (val != null)?val:'';
  }

  getCurrentBalanceId(): string{
    let val = Session.get("currentBalanceId"); 
    return (val != null)?val:'';
  }
  
  getUser(userStoreId) {
    let userId =  UserStores.findOne({_id: userStoreId}).userId;
    return Users.findOne({_id: userId});
  }


  cancelOrder(){
    MeteorObservable.call('updateSaleOrderStatus', this.sale._id, 'CANCELED')
    .subscribe(
    () => {
      this.router.navigate(['sales']); 
      Bert.alert('Se cancelo la venta', 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al crear la venta: ' +  error, 'danger', 'growl-top-right' ); 
    });  
  }

  submitOrder(){
    MeteorObservable.call('updateSaleOrderStatus', this.sale._id, 'SUBMITTED')
    .subscribe(() => {
      this.router.navigate(['sales']); 
      Bert.alert('Se marco la venta como finalizada', 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al crear la venta: ' +  error, 'danger', 'growl-top-right' ); 
    });  
  }

  reserveOrder(){
    MeteorObservable.call('updateSaleOrderStatus', this.sale._id, 'RESERVED')
    .subscribe(() => {
      this.router.navigate(['sales']); 
      Bert.alert('Se marco la venta como reservada', 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al crear la venta: ' +  error, 'danger', 'growl-top-right' ); 
    });  
  }

  notifyProductFound(barCode:string) {
    this.selectedProductSizeBarCode = barCode;
    this.addProductToOrder();
  }
}
