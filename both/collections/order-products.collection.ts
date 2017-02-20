import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { OrderProduct } from '../models/order-product.model';

export const OrderProducts = new MongoObservable.Collection<OrderProduct>('orderProducts');

function loggedIn() {
  return !!Meteor.user();
}
 
OrderProducts.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});