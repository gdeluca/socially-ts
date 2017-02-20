import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Balance } from '../models/balance.model';

export const Balances = new MongoObservable.Collection<Balance>('balances');

function loggedIn() {
  return !!Meteor.user();
}
 
Balances.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});