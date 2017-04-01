import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';


import { Product } from '../models/product.model';
import { Categories } from '../collections/categories.collection';


export const Products = new MongoObservable.Collection<Product>('products');
export const productTagNames = ['name','model','color','brand','provider'];

Products.collection["helpers"]({ 
  category() {
    return Categories.collection.find({ _id: this.categoryId });
  }
});

Products.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

Products.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});