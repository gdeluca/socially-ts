import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Sale } from '../models/sale.model';

export const Sales = new MongoObservable.Collection<Sale>('sales');

function loggedIn() {
  return !!Meteor.user();
}
 
Sales.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});