import { Meteor } from 'meteor/meteor';
import { Counters } from '../../../both/collections/counters.collection';


Meteor.publish('tags', function() {
  return Counters.collection.find();
 });
