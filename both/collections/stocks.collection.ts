import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Stock } from '../models/stock.model';

export const Stocks = new MongoObservable.Collection<Stock>('stocks');

function loggedIn() {
  return !!Meteor.user();
}
 
Stocks.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});

Stocks.collection["helpers"]({
  oneStock() {
    return Stocks.findOne();
  }
});
