import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';


import { Product } from '../models/product.model';
import { Categories } from '../collections/categories.collection';


export const Products = new MongoObservable.Collection<Product>('products');

function loggedIn() {
  return !!Meteor.user();
}
 
Products.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});

Products.collection["helpers"]({ 
  category() {
    return Categories.collection.find({ _id: this.categoryId });
  }
  
});
