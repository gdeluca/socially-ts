import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { ProductDetail } from '../models/product-detail.model';

export const ProductDetails = new MongoObservable.Collection<ProductDetail>('productDetails');

function loggedIn() {
  return !!Meteor.user();
}
 
ProductDetails.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});