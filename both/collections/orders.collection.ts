import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Order } from '../models/order.model';

export const Orders = new MongoObservable.Collection<Order>('orders');

function loggedIn() {
  return !!Meteor.user();
}
 
Orders.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});