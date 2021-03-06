// angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, CanActivate } from '@angular/router';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';
import { Bert } from 'meteor/themeteorchef:bert';
 
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

import * as moment from 'moment';
import 'moment/locale/es';

import template from "./purchase-selection.component.html";
import style from "./purchase-selection.component.scss";

@Component({
  selector: "purchase-selection",
  template,
  styles: [ style ] 
})
@InjectUser('currentUser')
export class PurchaseSelectionComponent implements OnInit, OnDestroy {

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
  ];
    
  headers: Dictionary[] = [
    {'key': 'Codigo', 'value':'code'},
    {'key': 'Descripcion', 'value': 'description'},
    {'key': 'Color', 'value':'color'},
    {'key': 'Marca', 'value':'brand'},
    {'key': 'Modelo', 'value':'model'},
    {'key': 'Precio Costo', 'value':'cost'}
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

  toRequestXSize: number[] = [];
  productSubTotals: number[] = [];

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

      this.paginationService.setCurrentPage(
        this.paginationService.defaultId() , curPage as number);

      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }
      this.paginatedSub = MeteorObservable.subscribe(
        'purchase-orders', 
        this.orderNumber
      ).subscribe(() => {
        this.purchase = Purchases.findOne(
          {purchaseNumber: this.orderNumber})
        this.productPurchases = ProductPurchases.find(
          { purchaseId: this.purchase._id }).zone();
        this.productSizes = this.findProductSizes(this.productPurchases).zone();
        this.products = this.findProducts(this.productSizes).zone();
        this.stocks = Stocks.find({}).zone();
        this.productPrices = ProductPrices.find({}).zone();
        
        this.loadInputboxValues();
      });

    });

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.collectionCount = Counts.get('numberOfPurchases');
      this.paginationService.setTotalItems(
        this.paginationService.defaultId(), this.collectionCount);
    
      // console.log('running autorun');
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

  calculateSubTotal(productId) { 
    this.productSubTotals[productId] = 
      (this.toRequestXSize[productId]) 
      ? this.getCost(productId) * this.toRequestXSize[productId] 
      : 0;

    return this.productSubTotals[productId];
  }

  notifyProductSelected(productId:string) {
    this.addProductToList(productId);
  }

  getTotalStock(productId: string) {
    let productSize = ProductSizes.find({productId: productId}, {fields: {_id: 1}});
    if (productSize) {
      let sizesIds = productSize.fetch().map(x => {return x._id});
      return Stocks.collection.find({productSizeId: { $in: sizesIds }}, {fields: {quantity: 1}})
        .fetch()
        .reduce((a, b) => a + +b.quantity, 0);
    } else { 
      return 0;
    }
  }

  getCost(productId) {
    let productPrice = ProductPrices.findOne({productId:productId});
     return (productPrice) ? productPrice.cost : 0;
  }

  getSizeQuantities(productId){
    return ProductSizes.collection.find({productId: productId}).count();
  }

  loadInputboxValues(){
    this.productPurchases.mergeMap(productPurchases => {
      return productPurchases.map(productPurchase => {
        return productPurchase})})
    .subscribe(productPurchase => {
      let productSize = ProductSizes.findOne(
        {_id: productPurchase.productSizeId});
      if (!this.toRequestXSize[productSize.productId]){
        this.toRequestXSize[productSize.productId] = productPurchase.quantity;
      }
    }) 
  } 
 
  addProductToList(productId){ 
    MeteorObservable.call('addProductSizesPurchase', 
      this.purchase._id, 
      productId
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

  findProductSizes(productPurchasesObs: Observable<ProductPurchase[]>): Observable<ProductSize[]> {
    let ids: string[] = [];
    productPurchasesObs.mergeMap(productPurchases => {
      return productPurchases.map(productPurchase => {
        return productPurchase.productSizeId})})
      .subscribe(res => {
        ids.push(res); 
      });
      // console.log("productSize ids:" ,ids);
       
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
      });

      // Products.find(
      //   {_id: { $in: ids }}
      // ).subscribe((es)=>{
      //   console.log(JSON.stringify(es))
      // });
    return Products.find({_id: { $in: ids }});
  } 


  getProductSizeIds(productId:string) {
    let productSize = ProductSizes.find({productId:productId}, {fields: {}});
    return (productSize)?productSize.fetch().map(x => {return x._id}):'';
  }

  removeFormList(productId){
    MeteorObservable.call('removeProductSizesPurchase', 
      this.purchase._id, 
      this.getProductSizeIds(productId)
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

  saveAndChangeSelectionState(){
    // let index = 0;
    // let productPriceParams = [];
    let productPurchaseParams = [];

    this.productPurchases.mergeMap(productPurchases => {
      return productPurchases.map(productPurchase => {
        return productPurchase})})
    .subscribe(productPurchase => {
      let productSize = ProductSizes.findOne({_id: productPurchase.productSizeId});

      // productPurchaseParams[index] = [];
      // productPurchaseParams[index]['productPurchaseId'] = productPurchase._id;
      // productPurchaseParams[index]['quantity'] = this.toRequestXSize[productSize.productId];
      // productPurchaseParams[index]['costPrice'] = undefined;
      // productPurchaseParams[index]['subTotal'] = this.productSubTotals[productSize.productId];

      // index++;
      let val = {};
      val['productPurchaseId'] = productPurchase._id;
      val['quantity'] = this.toRequestXSize[productSize.productId];
      val['costPrice'] = undefined;
      val['subTotal'] = this.productSubTotals[productSize.productId];
      productPurchaseParams.push(val);
      // productPurchaseParams[index] = [];
      // productPurchaseParams[index]['productPurchaseId'] = productPurchase._id;
      // productPurchaseParams[index]['quantity'] = this.toRequestXSize[productSize.productId];
      // productPurchaseParams[index]['costPrice'] = undefined;
      // productPurchaseParams[index]['subTotal'] = this.productSubTotals[productSize.productId];

      // index++;
       // let val = {};
       // val['productPurchaseId'] = productPurchase._id;
       // val['quantity'] = this.toRequestXSize[productSize.productId];
       // val['costPrice'] = undefined;
       // val['subTotal'] = this.productSubTotals[productSize.productId];
       // productPurchaseParams.push(val);
    })

    console.log(productPurchaseParams);
    // Meteor.call('bulkUpdateProductPurchase', 
    //   Object.assign({}, productPurchaseParams), function(err, result){
    //     console.log(err);
    //     console.log(result);
    // });
    Meteor.call("bulkUpdateProductPurchase",
     productPurchaseParams
     //, {wait:true}
    )
    this.callMoveToAsignation();
  }

  // saveAndChangeSelectionState(){
  //   // console.log(JSON.stringify(this.toRequestXSize));
  //   this.productPurchases.mergeMap(productPurchases => {
  //     return productPurchases.map(productPurchase => {
  //       return productPurchase})})
  //   .subscribe(productPurchase => {
  //       let productSize = ProductSizes.findOne({_id: productPurchase.productSizeId});
  //       this.callUpdateProductPurchase(productPurchase, productSize); 
  //     }
  //   )
  //   this.callMoveToAsignation();
  // }

  // callUpdateProductPurchase(productPurchase, productSize){
  //   // console.log("updateProductPurchase",
  //   // productPurchase.purchaseId,
  //   // this.toRequestXSize[productSize.productId], 
  //   // this.productSubTotals[productSize.productId]);
  //   MeteorObservable.call("updateProductPurchase",
  //     productPurchase._id,
  //     undefined,
  //     +this.toRequestXSize[productSize.productId],
  //     +this.productSubTotals[productSize.productId]
  //   ).subscribe(
  //   (response) => {
  //     Bert.alert('Se guardaron los nuevos estados en los pedidios', 'success', 'growl-top-right' ); 
  //   }, (error) => {
  //     Bert.alert('Error al actualizar el producto: ' +  error, 'danger', 'growl-top-right' ); 
  //   }); 
  // }

  callMoveToAsignation() {
    MeteorObservable.call(
      'updatePurchaseOrderStatus', 
      this.purchase._id, 
      'VERIFICATION'
    ).subscribe(
      (response) => {
       this.router.navigate(['purchases/'+this.orderNumber+'/verification']); 
       Bert.alert('Se actualizo la orden al estado VERIFICADO', 'success', 'growl-top-right' ); 
    }, (error) => {
      Bert.alert('Error al actualizar la orden al estado VERIFICADO: ' +  error, 'danger', 'growl-top-right' ); 
    });  
  }


}
