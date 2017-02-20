import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Local } from '../models/local.model';

export const Locals = new MongoObservable.Collection<Local>('locals');

function loggedIn() {
  return !!Meteor.user();
}
 
Locals.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});

