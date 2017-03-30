import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { BalanceOperation } from '../models/balance-operation.model';

export const BalanceOperations = new MongoObservable.Collection<BalanceOperation>('balanceOperations');

export const balanceOps = ['EXTRACTION','DEPOSIT'];

export const balanceOpsMapping = {
    'EXTRACTION': 'Extraccion', 
    'DEPOSIT': 'Deposito'
  };

function loggedIn() {
  return !!Meteor.user();
}
 
BalanceOperations.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

BalanceOperations.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

