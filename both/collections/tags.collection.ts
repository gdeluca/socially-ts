import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Tag } from '../models/tag.model';

export const Tags = new MongoObservable.Collection<Tag>('tags');

function loggedIn() {
  return !!Meteor.user();
}
 
Tags.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});
