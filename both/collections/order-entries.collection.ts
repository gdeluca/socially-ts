import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { OrderEntry } from '../models/order-entry.model';

export const OrderEntries = new MongoObservable.Collection<OrderEntry>('orderEntries');

function loggedIn() {
  return !!Meteor.user();
}
 
OrderEntries.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});