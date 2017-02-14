// angular
import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';

import { InjectUser } from "angular2-meteor-accounts-ui";
import { PaginationService } from 'ng2-pagination';

// reactive
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/combineLatest';

import { Counts } from 'meteor/tmeasday:publish-counts';

// model 
import { Products } from '../../../../both/collections/products.collection';
import { Product } from '../../../../both/models/product.model';
import { SearchOptions } from '../../../../both/search/search-options';
 
import template from './product-list.component.html';
import style from './product-list.component.scss';

@Component({
  selector: 'product-list',
  template,
  styles: [ style ],
})
@Injectable()
@InjectUser('user')
export class ProductListComponent implements OnInit, OnDestroy {
  products: Observable<Product[]>;
  
  // pagination related
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  nameOrder: Subject<number> = new Subject<number>();
  productsSize: number = 0;
  PAGESIZE: number = 3; 
  
  productsSub: Subscription;
  optionsSub: Subscription;
  autorunSub: Subscription;

  name: Subject<string> = new Subject<string>();
  user: Meteor.User;


  constructor(
    private paginationService: PaginationService
  ) {}
 
   ngOnInit() {
    this.optionsSub = Observable.combineLatest(
      this.pageSize,
      this.curPage,
      this.nameOrder,
      this.name
    ).subscribe(([pageSize, curPage, nameOrder, name]) => {
        const options: SearchOptions = {
        limit: pageSize as number,
        skip: ((curPage as number) - 1) * (pageSize as number),
        sort: { name: nameOrder as number }
      };
 
      this.paginationService.setCurrentPage(this.paginationService.defaultId() , curPage as number);

      if (this.productsSub) {
        this.productsSub.unsubscribe();
      }
      
      this.productsSub = MeteorObservable.subscribe('products', options, name).subscribe(() => {
        this.products = Products.find({}, {
          sort: {
            name: nameOrder
          }
        }).zone();
      });
    });

    this.pageSize.next(this.PAGESIZE);
    this.curPage.next(1);
    this.nameOrder.next(1);
    this.name.next('');

    this.autorunSub = MeteorObservable.autorun().subscribe(() => {
      this.productsSize = Counts.get('numberOfProducts');
      this.paginationService.setTotalItems(this.paginationService.defaultId(), this.productsSize);
    });

    this.paginationService.register({
      id: this.paginationService.defaultId(),
      itemsPerPage: this.PAGESIZE,
      currentPage: 1,
      totalItems: 30,
    });

  }
  
  remove(product: Product): void {
    Products.remove(product._id);
  }

  onPageChanged(page: number): void {
    this.curPage.next(page);
  }

  search(value: string): void {
    this.curPage.next(1);
    this.name.next(value);
  }
  
  changeSortOrder(nameOrder: string): void {
    this.nameOrder.next(parseInt(nameOrder));
  }

  isAdmin(): boolean {
    // check https://themeteorchef.com/tutorials/using-the-roles-package
    return true // this.user && Roles.userIsInRole( this.user_id, 'admin' ); 
  }
  
  ngOnDestroy() {
    this.productsSub.unsubscribe();
    this.optionsSub.unsubscribe(); 
    this.autorunSub.unsubscribe();
  } 

}