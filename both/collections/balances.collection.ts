import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Balance } from '../models/balance.model';

export const Balances = new MongoObservable.Collection<Balance>('balances');

export const balanceOps = ['OPEN','CLOSE','EXTRACTION','DEPOSIT'];

export const balanceOpsMapping = {
    'OPEN': 'Abierto', 
    'CLOSE': 'Cerrado', 
    'EXTRACTION': 'Extraccion', 
    'DEPOSIT': 'Deposito'
  };

function loggedIn() {
  return !!Meteor.user();
}
 
Balances.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});