// angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, CanActivate } from '@angular/router';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';
 
// reactiveX
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Subject } from 'rxjs/Subject';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/domain/search-options';

// collections
import { ProductPurchases } from '../../../../both/collections/product-purchases.collection';
import { ProductSales } from '../../../../both/collections/product-sales.collection';
import { ProductSizes } from '../../../../both/collections/product-sizes.collection';
import { ProductPrices } from '../../../../both/collections/product-prices.collection';
import { Products } from '../../../../both/collections/products.collection';
import { Purchases } from '../../../../both/collections/purchases.collection';
import { Stocks } from '../../../../both/collections/stocks.collection';
import { Stores } from '../../../../both/collections/stores.collection';
import { Tags } from '../../../../both/collections/tags.collection';
import { Users } from '../../../../both/collections/users.collection';

// model 
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

// domain
import { Dictionary } from '../../../../both/domain/dictionary';
import { Filter, Filters } from '../../../../both/domain/filter';
import * as _ from 'underscore';
import { Bert } from 'meteor/themeteorchef:bert';

import * as moment from 'moment';
import 'moment/locale/es';

import template from "./purchase-verification.component.html";
import style from "./purchase-verification.component.scss";

@Component({
  selector: "purchase-verification",
  template,
  styles: [ style ] 
})
@InjectUser('currentUser')
export class PurchaseVerificationComponent implements OnInit, OnDestroy {

  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filters: Subject<Filters> = new Subject<Filters>();

  filtersParams: Filters = [
    {key: 'code', value:''},
    {key: 'name', value:''},
    {key: 'color', value:''},
    {key: 'brand', value:''},
    {key: 'model', value:''},
    {key: 'size', value:''},
  ];

  // name <-> sortfield, touple
  headers: Dictionary[] = [
    {'key': 'Codigo', 'value':'code'},
    {'key': 'Descripcion', 'value': 'description'},
    {'key': 'Color', 'value':'color'},
    {'key': 'Marca', 'value':'brand'},
    {'key': 'Modelo', 'value':'model'},
    {'key': 'Talle', 'value':'size'},
    {'key': 'Cantidad Recibida X talle', 'value':'received'},
    {'key': 'Precio Costo', 'value':'cost'},
    {'key': 'Precio contado', 'value':'cashPrice'},
    {'key': 'Precio tarjeta', 'value':'cardPrice'},
    {'key': 'En stock X talle', 'value':'inStock'},
  ];

  collectionCount: number = 0;
  PAGESIZE: number = 15; 
  
  orderNumber: number;
  
  paginatedSub: Subscription;
  optionsAndParamsSub: Subscription;
  autorunSub: Subscription;

  currentUser: User;

  purchase: Purchase;
  productPurchases: Observable<ProductPurchase[]>;
  productSizes: Observable<ProductSize[]>;
  productPrices: Observable<ProductPrice[]>;
  products: Observable<Product[]>;
  stocks: Observable<Stock[]>;

  costPrices: number[] = [];
  cardPrices: number[] = [];
  cashPrices: number[] = [];

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private paginationService: PaginationService, 
  )  {} 

  ngOnInit() {
     this.optionsAndParamsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.sortDirection,
      this.sortField,
      this.filters,
      this.activeRoute.params.map(params => params['orderNumber'])
    ).subscribe(([pageSize, curPage, sortDirection, sortField, filters, orderNumber]) => {
      this.orderNumber = +orderNumber;

      const options: SearchOptions = {
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number),
        sort: { [sortField as string] : sortDirection as number }
      };

      this.paginationService.setCurrentPage(this.paginationService.defaultId() , curPage as number);

      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }
      this.paginatedSub = MeteorObservable.subscribe(
        'purchase-orders', 
        this.orderNumber
      ).subscribe(() => {
        this.purchase = Purchases.findOne(
          {purchaseNumber: this.orderNumber})
        this.productPurchases = ProductPurchases.find({ purchaseId: this.purchase._id }).zone();
        this.productSizes = ProductSizes.find().zone();
        this.products = Products.find().zone();
        this.stocks = Stocks.find({}).zone();
        this.productPrices = ProductPrices.find({}).zone();
        
        this.loadInputboxValues(); 
      });

    });

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfPurchases');
      this.paginationService.setTotalItems(
        this.paginationService.defaultId(), this.collectionCount);
    });

    this.paginationService.register({
      id: this.paginationService.defaultId(),
      itemsPerPage: this.PAGESIZE,
      currentPage: 1,
      totalItems: this.collectionCount,
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.sortField.next('description');
    this.sortDirection.next(1);
    this.filters.next(this.filtersParams);
  } 

  ngOnDestroy() {
    this.paginatedSub.unsubscribe();
    this.autorunSub.unsubscribe();
    this.optionsAndParamsSub.unsubscribe(); 
  }

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }

  changeSortOrder(direction: string, fieldName: string): void {
    this.sortDirection.next(parseInt(direction));
    this.sortField.next(fieldName);
  }

  search(fieldKey: string, value: string): void {
    if (value == 'undefined')  {
      value = '';
    }

    let filter = _.find(this.filtersParams, function(filter)
      { return filter.key == fieldKey }
    )
    if (filter) {
      if (filter.value === value) {
        return;
      }

      filter.value = value.toUpperCase();

      this.curPage.next(1);
      this.filters.next(this.filtersParams);
    }
  }

  getProduct(productId:Product) {
    return Products.findOne({_id: productId});
  }

  getStockQuantityForSize(productSizeId):number {
    return Stocks.collection.find({productSizeId: productSizeId}, {fields: {quantity: 1}})
      .fetch()
      .reduce((a, b) => a + +b.quantity, 0);
  }

  loadInputboxValues(){
    this.productPrices.mergeMap(productPrices => {
      return productPrices.map(productPrice => {
        return productPrice})})
    .subscribe(productPrice => {
      let product = Products.findOne({_id: productPrice.productId});
      if (!(this.costPrices[product._id] || this.cardPrices[product._id] || this.cashPrices[product._id])) {
        this.costPrices[product._id] = productPrice.cost
        this.cardPrices[product._id] = productPrice.priceCard
        this.cashPrices[product._id] = productPrice.priceCash
      }
    }) 
  } 

  saveAndChangeVerificationState(){
    let index = 0;
    let productPriceParams = [];
    let productPurchaseParams = [];
    this.productPurchases.mergeMap(productPurchases => {
      return productPurchases.map(productPurchase => {
        return productPurchase})})
    .subscribe(productPurchase => {
      let productSize = ProductSizes.findOne({_id: productPurchase.productSizeId});
      
      let val = {};
       val['productId'] = productSize.productId;
       val['costPrice'] = this.costPrices[productSize.productId];
       val['cashPrice'] = this.cashPrices[productSize.productId];
       val['cardPrice'] = this.cardPrices[productSize.productId];
       productPriceParams.push(val);
      // productPriceParams[index] = [];
      // productPriceParams[index]['productId'] = productSize.productId;
      // productPriceParams[index]['costPrice'] = this.costPrices[productSize.productId];
      // productPriceParams[index]['cashPrice'] = this.cashPrices[productSize.productId];
      // productPriceParams[index]['cardPrice'] = this.cardPrices[productSize.productId];

      // productPurchaseParams[index] = [];
      // productPurchaseParams[index]['productPurchaseId'] = productPurchase._id;
      // productPurchaseParams[index]['quantity'] = productPurchase.quantity;
      // productPurchaseParams[index]['costPrice'] = this.costPrices[productSize.productId];
      val = {};
      val['productPurchaseId'] = productPurchase._id;
      val['quantity'] =  productPurchase.quantity;
      val['costPrice'] = this.costPrices[productSize.productId];
      productPurchaseParams.push(val);
      index++;
    })

    // MeteorObservable.call("bulkUpdateProductPurchase",
    //     _.clone(productPurchaseParams)
    // ).subscribe(
    // (response) => {
    //   Bert.alert('Se guardaron los nuevos estados en los pedidios', 'success', 'growl-top-right' ); 
    // }, (error) => {
    //   Bert.alert('Error al guardar: ' +  error, 'danger', 'growl-top-right' ); 
    // });  
    Meteor.call("bulkUpdateProductPurchase",
     productPurchaseParams
    )

    Meteor.call("bulkUpdateProductPrices",
     productPriceParams
    )

    // MeteorObservable.call("bulkUpdateProductPrices",
    //   _.clone(productPriceParams)
    // ).subscribe((response) => {
    //   Bert.alert('Se guardaron los nuevos precios', 'success', 'growl-top-right' ); 
    // }, (error) => {
    //   Bert.alert('Error al actualizar los precios: ' +  error, 'danger', 'growl-top-right' ); 
    // });  

    this.callMoveToAsignation();  // set the new pruchase order state
  }


  // saveAndChangeVerificationState(){
  //   this.productPurchases.mergeMap(productPurchases => {
  //     return productPurchases.map(productPurchase => {
  //       return productPurchase})})
  //   .subscribe(productPurchase => {
  //     let productSize = ProductSizes.findOne({_id: productPurchase.productSizeId});
      
  //     // update the product prices set
  //     this.callUpdateProductPrices(
  //       productSize.productId,
  //       this.costPrices[productSize.productId],
  //       this.cashPrices[productSize.productId],
  //       this.cardPrices[productSize.productId]
  //     ); 
      
  //     // update the product purchases quantities 
  //     this.callUpdateProductPurchase(
  //       productPurchase._id, 
  //       productPurchase.quantity, 
  //       productSize.productId,
  //       this.costPrices[productSize.productId]
  //     ); 
  //   })
  //   this.callMoveToAsignation();  // set the new pruchase order state
  // }

  // callUpdateProductPurchase(
  //   productPurchaseId,
  //   productPurchaseQuantity,
  //   productId,
  //   productCostPrice
  // ){
  //   MeteorObservable.call("updateProductPurchase",
  //     productPurchaseId,
  //     this.costPrices[productId],
  //     productPurchaseQuantity,
  //     productPurchaseQuantity * productCostPrice
  //   ).subscribe(
  //   (response) => {
  //     Bert.alert('Se guardaron los nuevos estados en los pedidios', 'success', 'growl-top-right' ); 
  //   }, (error) => {
  //     Bert.alert('Error al guardar: ' +  error, 'danger', 'growl-top-right' ); 
  //   });  
  // }

  // callUpdateProductPrices(
  //   productId,
  //   productCostPrice,
  //   productCashPrice,
  //   productCardPrice
  // ) {
  //   MeteorObservable.call("updateProductPrices",
  //     productId,
  //     productCostPrice,
  //     productCashPrice,
  //     productCardPrice
  //   ).subscribe((response) => {
  //     Bert.alert('Se guardaron los nuevos precios', 'success', 'growl-top-right' ); 
  //   }, (error) => {
  //     Bert.alert('Error al actualizar los precios: ' +  error, 'danger', 'growl-top-right' ); 
  //   });  
  // }

  callMoveToAsignation() {
    MeteorObservable.call(
      'updatePurchaseOrderStatus', 
      this.purchase._id, 
      'ASIGNATION'
    ).subscribe((response) => {
      this.router.navigate(['purchases/'+this.orderNumber+'/asignation']); 
      Bert.alert('Se actualizo la orden al estado ASIGNADO', 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al actualizar la orden al estado ASIGNADO: ' +  error, 'danger', 'growl-top-right' ); 
    });  
  }

}