import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { ProductSize } from '../models/product-size.model';

export const ProductSizes = new MongoObservable.Collection<ProductSize>('productSizes');

function loggedIn() {
  return !!Meteor.user();
}
 
ProductSizes.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});

