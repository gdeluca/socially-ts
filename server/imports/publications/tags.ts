import { Meteor } from 'meteor/meteor';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { SearchOptions } from '../../../both/search/search-options';
import { Tags } from '../../../both/collections/tags.collection';

Meteor.publish('tags', function() {
  return Tags.find({code: '00', description:"active"});
});

Meteor.publish('tags.name', function(options: SearchOptions) {
  let selector = {type: 'name', code: { $ne: '00' }}
  Counts.publish(this, 'numberOfTagsName', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, {fields: {type: 1, description: 1}});
});

Meteor.publish('tags.model', function(options: SearchOptions) {
  let selector = {type: 'model', code: { $ne: '00' }}
  Counts.publish(this, 'numberOfTagsModel', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, {fields: {type: 1, description: 1}});
});

Meteor.publish('tags.brand', function(options: SearchOptions) {
  let selector = {type: 'brand', code: { $ne: '00' }}
  Counts.publish(this, 'numberOfTagsBrand', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});

Meteor.publish('tags.color', function(options: SearchOptions) {
  let selector = {type: 'color', code: { $ne: '00' }}
  Counts.publish(this, 'numberOfTagsColor', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});

Meteor.publish('tags.category', function(options: SearchOptions) {
  let selector = {type: 'category', code: { $ne: '00' }}
  Counts.publish(this, 'numberOfTagsCategory', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});

Meteor.publish('tags.size', function(options: SearchOptions) {
  let selector = {type: 'size', code: { $ne: '00' }}
  Counts.publish(this, 'numberOfTagsSize', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});

Meteor.publish('tags.provider', function(options: SearchOptions) {
  let selector = {type: 'provider', code: { $ne: '00' }}
  Counts.publish(this, 'numberOfProviders', Tags.collection.find(selector), { noReady: true });
  return Tags.find(selector, options);
});
