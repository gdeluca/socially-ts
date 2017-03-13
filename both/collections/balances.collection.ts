import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Balance } from '../models/balance.model';

export const Balances = new MongoObservable.Collection<Balance>('balances');

export const balanceOps = ['open','close','extraction','deposit'];

export const balanceOpsMapping = {
    'open': 'Abierto', 
    'close': 'Cerrado', 
    'extraction': 'Extraccion', 
    'deposit': 'Deposito'
  };

function loggedIn() {
  return !!Meteor.user();
}
 
Balances.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});