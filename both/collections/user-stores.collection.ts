import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { UserStore } from '../models/user-store.model';

export const UserStores = new MongoObservable.Collection<UserStore>('userStores');

UserStores.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

UserStores.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});