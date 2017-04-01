import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Stock } from '../models/stock.model';

export const Stocks = new MongoObservable.Collection<Stock>('stocks');

Stocks.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

Stocks.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

Stocks.collection["helpers"]({
  oneStock() {
    return Stocks.findOne();
  }
});
