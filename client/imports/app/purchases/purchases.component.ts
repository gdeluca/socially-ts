// angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, CanActivate } from '@angular/router';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';
 
// reactiveX
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/map';

import { Counts } from 'meteor/tmeasday:publish-counts';
import { SearchOptions } from '../../../../both/domain/search-options';

// collections
import { ProductPurchases } from '../../../../both/collections/product-purchases.collection';
import { ProductSizes } from '../../../../both/collections/product-sizes.collection';
import { Products } from '../../../../both/collections/products.collection';
import { Purchases, purchasesStatusMapping} from '../../../../both/collections/purchases.collection';
import { Stocks } from '../../../../both/collections/stocks.collection';
import { Stores } from '../../../../both/collections/stores.collection';
import { Tags } from '../../../../both/collections/tags.collection';

// model 
import { Counter } from '../../../../both/models/counter.model';
import { ProductPurchase } from '../../../../both/models/product-purchase.model';
import { ProductSize } from '../../../../both/models/product-size.model';
import { Product } from '../../../../both/models/product.model';
import { Purchase } from '../../../../both/models/purchase.model';
import { Stock } from '../../../../both/models/stock.model';
import { Store } from '../../../../both/models/store.model';
import { Tag } from '../../../../both/models/tag.model';

// domain
import { Dictionary } from '../../../../both/domain/dictionary';
import { Filter, Filters } from '../../../../both/domain/filter';
import * as _ from 'underscore';
import { Bert } from 'meteor/themeteorchef:bert';

import * as moment from 'moment';
import 'moment/locale/es';

import template from "./purchases.component.html";
import style from "./purchases.component.scss";

@Component({
  selector: "purchases",
  template,
  styles: [ style ]
})
@InjectUser('currentUser')
export class PurchasesComponent {
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  sortDirection: Subject<number> = new Subject<number>();
  sortField: Subject<string> = new Subject<string>();

  filters: Subject<Filters> = new Subject<Filters>();

  filtersParams: Filters = [
    {key: 'purchaseState', value:''},
    {key: 'createdAt', value:''},
    {key: 'lastUpdate', value:''},
    {key: 'provider', value:''},
  ];

  // purchaseNumber, purchaseState, createdAt, lastUpdate, total, provider, paymentAmount
  headers: Dictionary[] = [
    {'key': 'Nº Compra', 'value':'purchaseNumber'},
    {'key': 'Estado', 'value':'purchaseState', 'showHeaderFilter': true},
    {'key': 'Fecha de Compra', 'value':'createdAt', 'showHeaderFilter': true},
    {'key': 'Ultimo Cambio', 'value':'lastUpdate', 'showHeaderFilter': false},
    {'key': 'Total', 'value':'total', 'showHeaderFilter': false},
    {'key': 'Proveedor', 'value':'provider', 'showHeaderFilter': true},
    {'key': 'Pago', 'value':'paymentAmount', 'showHeaderFilter': true},
  ];

  collectionCount: number = 0;
  PAGESIZE: number = 10; 

  paginatedSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;
  providersSub: Subscription;

  currentUser: Meteor.User;
  selectedProvider: string; // drowpdown selected provider

  valuesMapping = purchasesStatusMapping;

  purchases: Observable<Purchase[]>;
  providers: Observable<Tag[]>;

  constructor(
    private paginationService: PaginationService,
    private router:Router,
  ){ 
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
            
      this.paginationService.setCurrentPage(
        this.paginationService.defaultId() , curPage as number);

      if (this.paginatedSub) {
        this.paginatedSub.unsubscribe();
      }
      this.paginatedSub = MeteorObservable.subscribe(
        'purchases', 
        options, 
        filters
      ).subscribe(() => {
          this.purchases = Purchases.find({}).zone();
      });

      // provider names for select dropdown
      if (this.providersSub) { 
        this.providersSub.unsubscribe();
      }
      this.providersSub = MeteorObservable.subscribe(
        'tags.provider').subscribe(() => {
        this.providers = Tags.find({type: 'provider'}).zone();
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
    this.sortField.next('purchaseNumber');
    this.sortDirection.next(-1);
    this.filters.next(this.filtersParams);
  }

  getCurrentStoreId(): string{
    let val = Session.get("currentStoreId"); 
    return (val != null)?val:'';
  }

  ngOnDestroy() {
    this.paginatedSub.unsubscribe();
    this.optionsSub.unsubscribe();
    this.autorunSub.unsubscribe();
    this.providersSub.unsubscribe();
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

  createOrder(){
    MeteorObservable.call('createPurchaseOrder', 
      this.selectedProvider,
      this.getCurrentStoreId(),
    ).subscribe( 
    (orderNumber) => {
      this.router.navigate(['purchases/'+orderNumber+'/selection']); 
    }, (error) => {
       Bert.alert('Error al crear el pedido: ' +  error, 'danger', 'growl-top-right' ); 
    });  
  }
}

// emptyPurchase = 
  //   {
  //     purchaseNumber:'', 
  //     purchaseState:'',
  //     createdAt:'',
  //     lastUpdate:'',
  //     total:'',
  //     provider:'',
  //     paymentAmount:'',
  //     quantity:'',
  //   };
  // editedPurchase: any;
  // editing: boolean = false;

  // copy(original: any){
  //   return Object.assign({}, original)
  // }

  // update(editedPurchase, purchase) {
  //   if (editedPurchase.purchaseState != purchase.purchaseState) {
  //     MeteorObservable.call(
  //       'updatePurchaseOrderStatus', 
  //       purchase._id, 
  //       editedPurchase.purchaseState
  //     ).subscribe(
  //       (response) => {
  //        Bert.alert('Se actualizo el pedidio al nuevo estado: ' 
  //          + editedPurchase.purchaseState, 'success', 'growl-top-right' ); 
  //     }, (error) => {
  //       Bert.alert('Error al guardar: ' +  error, 'danger', 'growl-top-right' ); 
  //     });  
  //   }
  // }

  // getCurrentDate(){
  //   return moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  // }


