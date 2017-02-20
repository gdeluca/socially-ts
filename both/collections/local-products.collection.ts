import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { LocalProduct } from '../models/local-product.model';

export const LocalProducts = new MongoObservable.Collection<LocalProduct>('localProducts');

function loggedIn() {
  return !!Meteor.user();
}
 
LocalProducts.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});

