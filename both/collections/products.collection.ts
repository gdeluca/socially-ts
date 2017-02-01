import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Product } from '../models/product.model';

export const Products = new MongoObservable.Collection<Product>('products');

function loggedIn() {
  return !!Meteor.user();
}
 
Products.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});