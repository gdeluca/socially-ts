import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { ProductPrice } from '../models/product-price.model';

export const ProductPrices = new MongoObservable.Collection<ProductPrice>('productPrices');

function loggedIn() {
  return !!Meteor.user();
}
 
ProductPrices.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});