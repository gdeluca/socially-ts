import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { ProductSale } from '../models/product-sale.model';

export const ProductSales = new MongoObservable.Collection<ProductSale>('productSales');

function loggedIn() {
  return !!Meteor.user();
}
 
ProductSales.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});