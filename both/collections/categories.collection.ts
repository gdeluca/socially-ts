import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';

import { Category } from '../models/category.model';

export const Categories = new MongoObservable.Collection<Category>('categories');

Categories.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

Categories.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

