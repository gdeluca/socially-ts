import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Store } from '../models/store.model';

export const Stores = new MongoObservable.Collection<Store>('stores');

Stores.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

Stores.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});