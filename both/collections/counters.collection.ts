import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Counter } from '../models/counter.model';

export const Counters = new MongoObservable.Collection<Counter>('counters');

function loggedIn() {
  return !!Meteor.user();
}

Counters.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

Counters.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});
