import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { UserStore } from '../models/user-store.model';

export const UserStores = new MongoObservable.Collection<UserStore>('userStores');

function loggedIn() {
  return !!Meteor.user();
}
 
UserStores.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});

