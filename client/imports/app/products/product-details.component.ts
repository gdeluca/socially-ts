// angular
import { Component, OnInit, OnDestroy, Injectable } from '@angular/core';
import { Router, ActivatedRoute, CanActivate } from '@angular/router';
import { InjectUser } from "angular2-meteor-accounts-ui";

// reactive
import { Subscription } from 'rxjs/Subscription';
import { Meteor } from 'meteor/meteor';
import { MeteorObservable } from 'meteor-rxjs';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

// models 
import { Products } from '../../../../both/collections/products.collection';
import { Product } from '../../../../both/models/product.model';
import { Users } from '../../../../both/collections/users.collection';
import { User } from '../../../../both/models/user.model';
import { Category } from '../../../../both/models/category.model';
import { Categories } from '../../../../both/collections/categories.collection';

 
import template from './product-details.component.html';
import style from './product-details.component.scss';

   
@Component({
  selector: 'product-details',
  template,
  styles: [ style ],
})
@Injectable()
@InjectUser('user')
export class ProductDetailsComponent implements OnInit, OnDestroy {
  productId: string;
  product: Product;
  paramsSub: Subscription;
  productSub: Subscription;
  users: Observable<User>;

  category: Category;
  availableCategories: Observable<Category[]>;
  categoriesSub: Subscription;


  user: Meteor.User;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {}
 
 
  ngOnInit() {
    console.log('init product details subscriber');
    this.paramsSub = this.activeRoute.params
      .map(params => params['productId'])
      .subscribe(productId => {
        this.productId = productId
        
        if (this.productSub) {
          console.log('unsuscribe product sub');
          this.productSub.unsubscribe();
        }

        this.productSub = MeteorObservable.subscribe('productById', this.productId).subscribe(() => {
          MeteorObservable.autorun().subscribe(() => {
            this.product = Products.findOne(this.productId);
          });
        });

        this.categoriesSub = MeteorObservable.subscribe('categories').subscribe(() => {
          this.availableCategories = Categories.find({}, {}).zone();
        });

      });
  }

  ngOnDestroy() {
    console.log('destroy product details subscribers');
    this.paramsSub.unsubscribe();
    this.categoriesSub.unsubscribe();
  }
 
  save() {
    if (!Meteor.userId()) {
      alert('Por favor ingrese al sistema para cambiar el producto');
      return; 
    }

    Products.update(this.product._id, {
      $set: { 
         name: this.product.name,
         code: this.product.code,
         size: this.product.size,
         color: this.product.color,
         description: this.product.description,
         categoryId: this.product.categoryId
      }
    });
 
    this.router.navigate(['/products']); 
  }

  isAdmin(): boolean {
    // check https://themeteorchef.com/tutorials/using-the-roles-package
    return true // this.user && Roles.userIsInRole( this.user_id, 'admin' ); 
  }

}