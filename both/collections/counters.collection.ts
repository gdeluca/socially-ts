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

const counterCollections = ['balance','purchase', 'sales'];

function getNext(type) {
  if (type.indexOf(counterCollections) > -1) {
    Counters.upsert({type: type}, {$set:{$inc: {lastCode: 1}}});
    return Counters.findOne({type: type});
  }
}