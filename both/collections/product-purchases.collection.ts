import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { ProductPurchase } from '../models/product-purchase.model';

export const ProductPurchases = new MongoObservable.Collection<ProductPurchase>('productPurchases');

function loggedIn() {
  return !!Meteor.user();
}
 
ProductPurchases.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});