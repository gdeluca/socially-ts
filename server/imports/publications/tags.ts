import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { SearchOptions } from '../../../both/search/search-options';
import { Tags } from '../../../both/collections/tags.collection';

Meteor.publish('tags.name', function(options: SearchOptions) {
  let selector = {type: 'name'}
  Counts.publish(this, 'numberOfTagsName', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});

Meteor.publish('tags.model', function(options: SearchOptions) {
  let selector = {type: 'model'}
  Counts.publish(this, 'numberOfTagsModel', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});

Meteor.publish('tags.brand', function(options: SearchOptions) {
  let selector = {type: 'brand'}
  Counts.publish(this, 'numberOfTagsBrand', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});

Meteor.publish('tags.color', function(options: SearchOptions) {
  let selector = {type: 'color'}
  Counts.publish(this, 'numberOfTagsColor', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});

Meteor.publish('tags.category', function(options: SearchOptions) {
  let selector = {type: 'category'}
  Counts.publish(this, 'numberOfTagsCategory', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});

Meteor.publish('tags.size', function(options: SearchOptions) {
  let selector = {type: 'size'}
  Counts.publish(this, 'numberOfTagsSize', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});

