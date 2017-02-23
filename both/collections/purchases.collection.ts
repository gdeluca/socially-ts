import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Purchase } from '../models/purchase.model';

export const Purchases = new MongoObservable.Collection<Purchase>('purchases');

function loggedIn() {
  return !!Meteor.user();
}
 
Purchases.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});

