import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Balance } from '../models/balance.model';

export const Balances = new MongoObservable.Collection<Balance>('balances');

export const balanceStatus = ['OPEN','CLOSE'];

export const balanceStatusMapping = {
    'OPEN': 'Abierto', 
    'CLOSE': 'Cerrado'
  };

function loggedIn() {
  return !!Meteor.user();
}

function isAdmin() {
  // return _.include(Meteor.user()['roles'], "Administrator");
  return false;
}
 
Balances.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

Balances.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

