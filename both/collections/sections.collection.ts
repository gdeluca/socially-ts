import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Section } from '../models/section.model';

export const Sections = new MongoObservable.Collection<Section>('sections');

function loggedIn() {
  return !!Meteor.user();
}
 
Sections.allow({
  insert: loggedIn,
  update: loggedIn,
  remove: loggedIn
});