import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Counter } from '../models/counter.model';

export const Counters = new MongoObservable.Collection<Counter>('counters');

function loggedIn() {
  return !!Meteor.user();
}
 
Counters.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});

