
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
import { isNumeric } from '../validators/validators';

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

  selectedProvider: Tag;
  lockProvider: boolean =false;
  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute
    ) 
  {}

  ngOnInit() {
    this.paramsSub = this.activeRoute.params
      .map(params => params['orderNumber'])
      .subscribe(orderNumber => {
        this.orderNumber = orderNumber
        
        if (this.purchaseSub) {
          this.purchaseSub.unsubscribe();
        } 
        this.purchaseSub = MeteorObservable.subscribe('purchase-orders', this.orderNumber).subscribe(() => {
          this.purchase = Purchases.findOne({purchaseNumber: this.orderNumber});
          this.productPurchases = ProductPurchases.find().zone();
          this.productSizes = ProductSizes.find().zone();
          this.stocks = Stocks.find({}).zone();
          this.products = Products.find({}).zone();
          this.productPrices = ProductPrices.find({}).zone();
        }); 
 
      this.registerProductProvider();

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

  registerProductProvider() {
    if (this.productsProviderSub) {
        this.productsProviderSub.unsubscribe();
        this.lockProvider=false;
    } 

    if (this.selectedProvider) {
      this.lockProvider=true;
      this.productsProviderSub = MeteorObservable.subscribe('products-stock')
        .subscribe(() => {
          this.providerProducts = Products.find(
            {provider: this.selectedProvider.description}).zone();
          this.providerProductsSizes = ProductSizes.find({}).zone();
          this.providerProductPrices = ProductPrices.find({}).zone();
      }); 
    }
  }
  
  getOrderStatus(value){
    return this.orderStatus[value];
  }

  getCost(product) {
    let productPrice = ProductPrices.findOne({productId:product._id});
     return (productPrice)?productPrice.lastCostPrice:0;
  }

  getSizes(product) {
    let productSize = ProductSizes.find({productId:product._id}, {fields: {size: 1}});
    return (productSize)?productSize.fetch().map(x => {return x.size}):'';
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
   
  isProductSelected(providerProduct: Product): boolean {
    let product = Products.collection.find({_id: providerProduct._id});
    return (product)?product.count() > 0 : false;
  }

  getProductPurchaseTotal(product){ 
    // console.log(JSON.stringify(product));
  }

  updateProductPurchase(product, value){
    // console.log(JSON.stringify(product));
    // console.log(JSON.stringify(value));
  }

  addToPurchaseList(product){
    MeteorObservable.call('saveProductPurchase', 
      this.purchase._id, 
      product._id,
      this.getSizes(product),
      this.getCost(product),
      0
    ).subscribe(
      () => {
      Bert.alert('Se agrego el producto a la lista', 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al guardar: ' +  error, 'danger', 'growl-top-right' ); 
    });
  }

  /** search the product by code and add it to the table  */
  addProduct() {

    // let currentBarCode = this.selectedProductSizeBarCode;
    // this.selectedProductSizeBarCode = "";
    // let requestedQuantity = +this.selectedProductAmount;
    // // attach this check to input box 
    // if (!currentBarCode || currentBarCode.length != 12) {
    //   return;
    // }

    // console.log('entering add product');
    // // get the productsize
    // let productSize = ProductSizes.collection.find({
    //   barCode: currentBarCode
    // }).fetch()[0];

    // console.log('getting stock for product size:' + productSize._id);
    // // check stock existence for the productSize
    // let stockFetch = Stocks.collection.find({
    //   productSizeId: productSize._id, active:true, storeId: this.store._id
    // }).fetch();

    // console.log({
    //   productSizeId: productSize._id, active:true, storeId: this.store._id
    // });
    // // checkeo de consistencia
    // if (stockFetch.length > 1) {
    //   Bert.alert('Entradas duplicadas para el stock activo del producto: ' 
    //     + currentBarCode + ' en la sucursal ' + this.store.name, 
    //     'warning', 'growl-top-right' ); 
    //   return;
    // }

    // if (stockFetch.length == 0) {
    //    Bert.alert( 'No se encuentra informacion del stock activo para producto: ' 
    //     + currentBarCode + ' en la sucursal ' + this.store.name, 
    //     'warning', 'growl-top-right' ); 
    //    return;
    // }

    // let stock = stockFetch[0];
    // console.log('stock object :' + JSON.stringify(stock));
    // if (stock.quantity < requestedQuantity) {
    //   Bert.alert(
    //     'La cantidad ingresada: ' + requestedQuantity 
    //     + 'es mayor a la disponible en stock: ' + stock.quantity 
    //     + ' para el producto seleccionado: ' + currentBarCode, 
    //     'warning', 'growl-top-right' ); 
    //   return;

    // } else {
    //   let productSale = ProductSales.collection.find(
    //     {productSizeId: productSize._id, saleId: this.sale._id}
    //   ).fetch()[0];

    //   console.log('updating stock:' + stock._id);
    //   // update the stock, decrement the quantity field
    //   Stocks.update(
    //    {_id:stock._id},
    //    {$set:{quantity:stock.quantity-requestedQuantity}}
    //   );

    //   // if found the update(increase the quantity)
    //    console.log('current product sale:' + JSON.stringify(productSale));
    //   if (productSale) {
    //     console.log('updating current product sale:');
    //     ProductSales.update(
    //       {_id:productSale._id},
    //       {$set:{quantity:productSale.quantity+requestedQuantity}}
    //     );
    //   } else {
    //     // add a new one
    //     console.log('updating product sales');
    //     // update the produstsale, add the new productsize
    //     ProductSales.insert({
    //       productSizeId: productSize._id, 
    //       saleId: this.sale._id,
    //       quantity: requestedQuantity
    //     });

    //     Bert.alert('Producto agregado', 'success', 'growl-top-right'); 

    //   }
    // }
  }
   
  // setQuantityTracker(index, quantity) {
  //   this.quantityTracker[index] = quantity; 
  //   return this.quantityTracker[index];
  // }

  // calculateSubTotal(index, productPrice) {
  //   this.productSubTotals[index] = 
  //     this.getPrice(productPrice) * this.quantityTracker[index];
  //   return this.productSubTotals[index];
  // }

  // getTotal(){
  //   var total = 0;
  //   if (this.productSubTotals.length > 0) {
  //     for (let subTotal of this.productSubTotals) {
  //       total += subTotal;
  //     }
  //   }
  //   return total;
  // }

  // getPrice(productPrice){
  //   if (this.paymentForm == 1) {
  //     return productPrice.priceCash;
  //   } else {
  //     return productPrice.priceCard;
  //   }
  // }

  // checkLength(){
  //   if (this.selectedProductSizeBarCode.length == 12){
  //     this.addProduct();
  //   }
  // }
  
  // increaseAmount(index, stock) {
  //   if (stock.quantity - this.quantityTracker[index] > 0) {
  //     this.quantityTracker[index] +=1;
  //   }
  // }

  // decreaseAmount(index) {
  //   if (this.quantityTracker[index] > 1) {
  //     this.quantityTracker[index] -=1;
  //   }
  // }

  // removeFormList(product){
 
  // }

  // cancelSale(){
    
  // }

  // notifyProductFound(barCode:string) {
  //   this.selectedProductSizeBarCode = barCode;
  //   this.addProduct();
  // }
}
